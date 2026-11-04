import {
  type ExplorerQuery,
  LIMIT,
  parseQuery,
  selectedFormats,
} from "./query.ts";

const API = "https://stampchain.io/api/v2/stamps";
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const SUPPORTED_PROTOCOLS = ["STAMP", "SRC-721"];
const MIME_EXTENSIONS: Record<string, readonly string[]> = {
  "image/png": ["png"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/gif": ["gif"],
  "image/webp": ["webp"],
};

export interface Stamp {
  id: string;
  cpid: string;
  txHash: string;
  creator: string | null;
  creatorName: string | null;
  name: string | null;
  mime: string | null;
  mediaUrl: string | null;
  supply: string | null;
  block: number | null;
  timestamp: string | null;
  locked: boolean | null;
  divisible: boolean | null;
}

export interface StampPage {
  stamps: Stamp[];
  page: number;
  limit: number;
  total: number | null;
  totalPages: number | null;
  lastBlock: number | null;
  fetchedAt: string;
  source: "live" | "fixture";
  freshness: "unknown" | "fixture";
}

export interface DetailResult {
  stamp: Stamp;
  lastBlock: number | null;
  fetchedAt: string;
  source: "live" | "fixture";
  freshness: "unknown" | "fixture";
}

export type AdapterErrorKind =
  | "invalid"
  | "not-found"
  | "timeout"
  | "upstream"
  | "invalid-data";

export class AdapterError extends Error {
  constructor(
    public readonly kind: AdapterErrorKind,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AdapterError";
  }
}

interface AdapterOptions {
  mode: "live" | "fixture";
  fetcher?: typeof fetch;
  fixtureData?: unknown;
  timeoutMs?: number;
}

type Row = Record<string, unknown>;

function object(value: unknown): Row {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AdapterError(
      "invalid-data",
      "The data service returned an invalid record.",
      502,
    );
  }
  return value as Row;
}

function optionalText(value: unknown, maximum = 256): string | null {
  return typeof value === "string" && value.length > 0 &&
      value.length <= maximum
    ? value
    : null;
}

function integerString(value: unknown): string | null {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) ? String(value) : null;
  }
  return typeof value === "string" && /^-?(?:0|[1-9]\d{0,29})$/.test(value)
    ? BigInt(value).toString()
    : null;
}

function safeInteger(value: unknown): number | null {
  const raw = integerString(value);
  if (raw === null) return null;
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

function quantity(value: unknown): string | null {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value < 0) return null;
    // Unsafe numeric inputs have already lost precision. Live JSON is parsed
    // losslessly below; callers must provide large fixture values as strings.
    if (Number.isInteger(value) && !Number.isSafeInteger(value)) return null;
    return String(value);
  }
  return typeof value === "string" && value.length <= 100 &&
      /^(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(value)
    ? value
    : null;
}

function flag(value: unknown): boolean | null {
  if (value === true || value === 1 || value === "1") return true;
  if (value === false || value === 0 || value === "0") return false;
  return null;
}

function mediaUrl(value: unknown, mime: string | null): string | null {
  if (typeof value !== "string" || !mime) return null;
  const match = value.match(
    /^https:\/\/stampchain\.io\/stamps\/[a-f0-9]{64}\.(png|jpe?g|gif|webp)$/,
  );
  return match && MIME_EXTENSIONS[mime]?.includes(match[1]) ? value : null;
}

function normalizeStamp(value: unknown): Stamp {
  const row = object(value);
  if (
    typeof row.ident !== "string" || !SUPPORTED_PROTOCOLS.includes(row.ident)
  ) {
    throw new AdapterError(
      "invalid-data",
      "The data service returned a record outside the supported stamp protocols.",
      502,
    );
  }
  const id = integerString(row.stamp);
  const cpid = optionalText(row.cpid, 100);
  const txHash = optionalText(row.tx_hash, 64);
  if (!id || !cpid || !txHash || !/^[a-f0-9]{64}$/.test(txHash)) {
    throw new AdapterError(
      "invalid-data",
      "A stamp is missing a valid identity.",
      502,
    );
  }
  const mime = optionalText(row.stamp_mimetype, 100)?.toLowerCase() ?? null;
  const rawTime = optionalText(row.block_time, 64);
  return {
    id,
    cpid,
    txHash,
    creator: optionalText(row.creator, 100),
    creatorName: optionalText(row.creator_name),
    name: optionalText(row.name),
    mime,
    mediaUrl: mediaUrl(row.stamp_url, mime),
    supply: quantity(row.supply),
    block: safeInteger(row.block_index),
    timestamp: rawTime && Number.isFinite(Date.parse(rawTime)) ? rawTime : null,
    locked: flag(row.locked),
    divisible: flag(row.divisible),
  };
}

/** Preserve JSON numeric lexemes before JavaScript can round large quantities. */
export function parseSourceJson(text: string): unknown {
  // Validate the original grammar first: replacing numeric tokens must never
  // make an invalid source (such as an unquoted numeric object key) valid.
  JSON.parse(text);
  let transformed = "";
  let offset = 0;
  while (offset < text.length) {
    if (text[offset] === '"') {
      const start = offset++;
      let closed = false;
      while (offset < text.length) {
        if (text[offset] === "\\") offset += 2;
        else if (text[offset++] === '"') {
          closed = true;
          break;
        }
      }
      if (!closed) throw new SyntaxError("Unterminated JSON string");
      transformed += text.slice(start, offset);
    } else if (text[offset] === "-" || /[0-9]/.test(text[offset])) {
      const match = text.slice(offset).match(
        /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/,
      );
      if (!match) throw new SyntaxError("Invalid JSON number");
      transformed += JSON.stringify(match[0]);
      offset += match[0].length;
    } else transformed += text[offset++];
  }
  return JSON.parse(transformed);
}

function validIdentifier(id: string): boolean {
  return /^-?(?:0|[1-9]\d{0,19})$/.test(id) || /^[a-f0-9]{64}$/.test(id) ||
    /^[A-Za-z][A-Za-z0-9._-]{0,99}$/.test(id);
}

async function readJson(
  response: Response,
  signal: AbortSignal,
): Promise<unknown> {
  const contentType = response.headers.get("content-type")?.split(";")[0]
    .trim();
  if (contentType !== "application/json") {
    throw new AdapterError(
      "invalid-data",
      "The data service did not return JSON.",
      502,
    );
  }
  const length = response.headers.get("content-length");
  if (length && Number(length) > MAX_BODY_BYTES) {
    await response.body?.cancel();
    throw new AdapterError(
      "invalid-data",
      "The data response exceeded the size limit.",
      502,
    );
  }
  if (!response.body) {
    throw new AdapterError(
      "invalid-data",
      "The data service returned an empty response.",
      502,
    );
  }
  const reader = response.body.getReader();
  const cancel = () => {
    void reader.cancel().catch(() => {});
  };
  signal.addEventListener("abort", cancel, { once: true });
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new AdapterError(
          "invalid-data",
          "The data response exceeded the size limit.",
          502,
        );
      }
      text += decoder.decode(value, { stream: true });
    }
    if (signal.aborted) {
      throw new AdapterError(
        "timeout",
        "The data service took too long. Please retry.",
        504,
      );
    }
    text += decoder.decode();
    try {
      return parseSourceJson(text);
    } catch {
      throw new AdapterError(
        "invalid-data",
        "The data service returned invalid JSON.",
        502,
      );
    }
  } finally {
    signal.removeEventListener("abort", cancel);
    reader.releaseLock();
  }
}

export function createAdapter(options: AdapterOptions) {
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = Math.min(10_000, Math.max(1, options.timeoutMs ?? 10_000));
  const source = options.mode;
  const freshness = source === "live" ? "unknown" as const : "fixture" as const;

  function metadata(envelope: Row) {
    return {
      lastBlock: safeInteger(envelope.last_block),
      fetchedAt: new Date().toISOString(),
      source,
      freshness,
    };
  }

  async function request(url: string): Promise<Row> {
    const controller = new AbortController();
    let timer: number | undefined;
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(
          new AdapterError(
            "timeout",
            "The data service took too long. Please retry.",
            504,
          ),
        );
      }, timeoutMs);
    });
    try {
      return await Promise.race([
        (async () => {
          const response = await fetcher(url, {
            method: "GET",
            redirect: "error",
            signal: controller.signal,
            headers: { Accept: "application/json", "X-API-Version": "2.3" },
          });
          if (!response.ok) {
            await response.body?.cancel();
            if (response.status === 404) {
              throw new AdapterError(
                "not-found",
                "This stamp could not be found.",
                404,
              );
            }
            throw new AdapterError(
              "upstream",
              "The data service is unavailable. Please retry.",
              502,
            );
          }
          return object(await readJson(response, controller.signal));
        })(),
        deadline,
      ]);
    } catch (error) {
      if (error instanceof AdapterError) throw error;
      if (controller.signal.aborted) {
        throw new AdapterError(
          "timeout",
          "The data service took too long. Please retry.",
          504,
        );
      }
      throw new AdapterError(
        "upstream",
        "The data service is unavailable. Please retry.",
        502,
      );
    } finally {
      clearTimeout(timer);
    }
  }

  function fixtureEnvelope(): Row {
    return object(options.fixtureData);
  }

  async function list(query: ExplorerQuery): Promise<StampPage> {
    const q = parseQuery(
      new URLSearchParams({
        type: query.type,
        format: query.format,
        sort: query.sort,
        page: String(query.page),
      }),
    );
    if (source === "fixture") {
      const envelope = fixtureEnvelope();
      if (!Array.isArray(envelope.data)) {
        throw new AdapterError(
          "invalid-data",
          "Fixture records are unavailable.",
          502,
        );
      }
      const stamps = envelope.data.filter((value) => {
        const row = object(value);
        if (
          typeof row.ident !== "string" ||
          !SUPPORTED_PROTOCOLS.includes(row.ident)
        ) return false;
        const id = integerString(row.stamp);
        const cpid = optionalText(row.cpid, 100);
        if (id === null || !cpid) return false;
        const number = BigInt(id);
        const isStamp = row.ident === "STAMP";
        if (
          q.type === "classic" &&
          !(number >= 0n && cpid.startsWith("A") && isStamp)
        ) return false;
        if (
          q.type === "cursed" &&
          !(number < 0n && cpid.startsWith("A") && isStamp)
        ) return false;
        if (
          q.type === "posh" &&
          !(number < 0n && !cpid.startsWith("A") && isStamp)
        ) return false;
        if (q.format === "all") return true;
        // Match the source filter's OR-of-suffixes AND OR-of-MIME-types.
        // HTML records remain selectable even though safe mediaUrl is null.
        const extension = typeof row.stamp_url === "string"
          ? /\.([a-z]+)$/.exec(row.stamp_url)?.[1]
          : undefined;
        const formats = selectedFormats(q.format);
        const suffixes = formats.flatMap((format) =>
          format === "jpg" ? ["jpg", "jpeg"] : [format]
        );
        const mimeTypes = formats.map((format) =>
          format === "jpg"
            ? "image/jpeg"
            : format === "html"
            ? "text/html"
            : `image/${format}`
        );
        return suffixes.includes(extension ?? "") &&
          typeof row.stamp_mimetype === "string" &&
          mimeTypes.includes(row.stamp_mimetype);
      }).map((value) => {
        const row = object(value);
        const transaction = integerString(row.tx_index);
        return {
          stamp: normalizeStamp(row),
          transaction: transaction !== null && BigInt(transaction) >= 0n
            ? BigInt(transaction)
            : null,
        };
      }).sort((a, b) => {
        // Live lists order by tx_index. Unknown chronology stays after known
        // records in either direction; fixture ties use ID for repeatability.
        if (a.transaction === null && b.transaction !== null) return 1;
        if (a.transaction !== null && b.transaction === null) return -1;
        const chronology = a.transaction === null || b.transaction === null
          ? 0
          : a.transaction < b.transaction
          ? -1
          : a.transaction > b.transaction
          ? 1
          : 0;
        const order = chronology ||
          (BigInt(a.stamp.id) < BigInt(b.stamp.id)
            ? -1
            : BigInt(a.stamp.id) > BigInt(b.stamp.id)
            ? 1
            : 0);
        return q.sort === "oldest" ? order : -order;
      }).map((row) => row.stamp);
      return {
        stamps: stamps.slice((q.page - 1) * LIMIT, q.page * LIMIT),
        page: q.page,
        limit: LIMIT,
        total: stamps.length,
        totalPages: Math.ceil(stamps.length / LIMIT),
        ...metadata(envelope),
      };
    }
    const params = new URLSearchParams({
      page: String(q.page),
      limit: String(LIMIT),
      sortBy: q.sort === "newest" ? "DESC" : "ASC",
      type: q.type,
      ident: SUPPORTED_PROTOCOLS.join(","),
    });
    if (q.format !== "all") {
      params.set(
        "filetype",
        selectedFormats(q.format).flatMap((format) =>
          format === "jpg" ? ["jpg", "jpeg"] : [format]
        ).join(","),
      );
    }
    const envelope = await request(`${API}?${params}`);
    if (!Array.isArray(envelope.data) || envelope.data.length > LIMIT) {
      throw new AdapterError(
        "invalid-data",
        "The data service returned an invalid page.",
        502,
      );
    }
    const page = safeInteger(envelope.page);
    const limit = safeInteger(envelope.limit);
    if (page !== q.page || limit !== LIMIT) {
      throw new AdapterError(
        "invalid-data",
        "The data service returned unexpected pagination.",
        502,
      );
    }
    const stamps = envelope.data.map(normalizeStamp);
    if (new Set(stamps.map((stamp) => stamp.id)).size !== stamps.length) {
      throw new AdapterError(
        "invalid-data",
        "The data service returned duplicate stamps.",
        502,
      );
    }
    return {
      stamps,
      page,
      limit,
      total: safeInteger(envelope.total),
      totalPages: safeInteger(envelope.totalPages),
      ...metadata(envelope),
    };
  }

  async function detail(id: string): Promise<DetailResult> {
    if (!validIdentifier(id)) {
      throw new AdapterError("invalid", "Enter a valid stamp identifier.", 400);
    }
    if (source === "fixture") {
      const envelope = fixtureEnvelope();
      if (!Array.isArray(envelope.data)) {
        throw new AdapterError(
          "invalid-data",
          "Fixture records are unavailable.",
          502,
        );
      }
      const stamp = envelope.data.filter((value) => {
        const row = object(value);
        return typeof row.ident === "string" &&
          SUPPORTED_PROTOCOLS.includes(row.ident);
      }).map(normalizeStamp).find((row) =>
        row.id === id || row.cpid === id || row.txHash === id
      );
      if (!stamp) {
        throw new AdapterError(
          "not-found",
          "This stamp could not be found.",
          404,
        );
      }
      return { stamp, ...metadata(envelope) };
    }
    const envelope = await request(`${API}/${encodeURIComponent(id)}`);
    const stamp = normalizeStamp(object(envelope.data).stamp);
    if (stamp.id !== id && stamp.cpid !== id && stamp.txHash !== id) {
      throw new AdapterError(
        "invalid-data",
        "The data service returned a different stamp.",
        502,
      );
    }
    return { stamp, ...metadata(envelope) };
  }

  return { list, detail };
}
