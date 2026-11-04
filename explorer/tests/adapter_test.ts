import { deepStrictEqual, rejects, strictEqual, throws } from "node:assert";
import {
  AdapterError,
  createAdapter,
  parseSourceJson,
} from "../lib/adapter.ts";
import { LIMIT, parseQuery } from "../lib/query.ts";

const TX = "0".repeat(64);
const query = parseQuery(new URLSearchParams());

function rawStamp(stamp: number | string = 0) {
  return {
    stamp,
    cpid: "A7337447728884561000",
    tx_hash: TX,
    tx_index: typeof stamp === "number" ? Math.abs(stamp) : stamp,
    creator: "1GotRejB6XsGgMsM79TvcypeanDJRJbMtg",
    creator_name: "Mike in Space",
    stamp_mimetype: "image/png",
    stamp_url: `https://stampchain.io/stamps/${TX}.png`,
    supply: 0 as number | string | null,
    locked: 0 as number | boolean,
    divisible: false as number | boolean,
    block_index: 0,
    block_time: "2023-03-07T01:19:09.000Z",
    ident: "STAMP",
    stamp_base64: "not part of the read model",
    market_data: { incomplete: true },
  };
}

function jsonResponse(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function pageResponse(rows: unknown[] = [rawStamp()]) {
  return jsonResponse({
    data: rows,
    last_block: 100,
    page: 1,
    limit: LIMIT,
    total: rows.length,
    totalPages: 1,
    metadata: { cacheStatus: "fresh", source: "cached" },
  });
}

function hasKind(kind: AdapterError["kind"]) {
  return (error: unknown) =>
    error instanceof AdapterError && error.kind === kind;
}

Deno.test("list adapter normalizes zero, flags and unknown freshness without enrichment", async () => {
  let observedUrl = "";
  let observedInit: RequestInit | undefined;
  const adapter = createAdapter({
    mode: "live",
    fetcher: ((url, init) => {
      observedUrl = String(url);
      observedInit = init;
      return Promise.resolve(pageResponse());
    }) as typeof fetch,
  });
  const result = await adapter.list(query);
  const url = new URL(observedUrl);
  strictEqual(url.origin, "https://stampchain.io");
  strictEqual(url.pathname, "/api/v2/stamps");
  strictEqual(url.searchParams.get("limit"), "12");
  strictEqual(url.searchParams.get("type"), "all");
  strictEqual(url.searchParams.get("ident"), "STAMP,SRC-721");
  strictEqual(url.searchParams.get("sortBy"), "DESC");
  strictEqual(observedInit?.method, "GET");
  strictEqual(observedInit?.redirect, "error");
  strictEqual(new Headers(observedInit?.headers).get("X-API-Version"), "2.3");
  const stamp = result.stamps[0];
  strictEqual(stamp.id, "0");
  strictEqual(stamp.block, 0);
  strictEqual(stamp.supply, "0");
  strictEqual(stamp.creatorName, "Mike in Space");
  strictEqual(stamp.name, null);
  strictEqual(stamp.locked, false);
  strictEqual(stamp.divisible, false);
  strictEqual(result.freshness, "unknown");
  strictEqual("stamp_base64" in stamp, false);
  strictEqual("market_data" in stamp, false);
});

Deno.test("source JSON preserves large integer and tiny decimal lexemes", async () => {
  const parsed = parseSourceJson(
    '{"n":900719925474099312345,"tiny":0.0000000000000000001,"text":"42\\"1","yes":true}',
  ) as Record<string, unknown>;
  strictEqual(parsed.n, "900719925474099312345");
  strictEqual(parsed.tiny, "0.0000000000000000001");
  strictEqual(parsed.text, '42"1');
  strictEqual(parsed.yes, true);
  const body = JSON.stringify({ data: { stamp: rawStamp() }, last_block: 100 })
    .replace('"supply":0', '"supply":900719925474099312345');
  const adapter = createAdapter({
    mode: "live",
    fetcher: (() =>
      Promise.resolve(
        new Response(body, {
          headers: { "content-type": "application/json" },
        }),
      )) as typeof fetch,
  });
  const result = await adapter.detail("0");
  strictEqual(result.stamp.supply, "900719925474099312345");
  strictEqual(result.stamp.cpid, "A7337447728884561000");
  throws(() => parseSourceJson("{1:2}"), SyntaxError);
});

Deno.test("detail envelope and aliases preserve identity; wrong records are rejected", async () => {
  const row = { ...rawStamp(), locked: true, divisible: 1 };
  const adapter = createAdapter({
    mode: "live",
    fetcher: (() =>
      Promise.resolve(jsonResponse({ data: { stamp: row } }))) as typeof fetch,
  });
  for (const id of ["0", row.cpid, TX]) {
    const result = await adapter.detail(id);
    strictEqual(result.stamp.id, "0");
    strictEqual(result.stamp.locked, true);
    strictEqual(result.stamp.divisible, true);
    strictEqual(result.lastBlock, null);
  }
  await rejects(() => adapter.detail("1"), hasKind("invalid-data"));
  await rejects(
    () => adapter.detail("https://evil.invalid/"),
    hasKind("invalid"),
  );
  await rejects(() => adapter.detail("../api/internal"), hasKind("invalid"));
});

Deno.test("unavailable values remain null and unsafe media is excluded", async () => {
  const rows = [
    {
      ...rawStamp(0),
      supply: null,
      block_index: null,
      locked: null,
      divisible: 2,
    },
    { ...rawStamp(1), stamp_url: "https://evil.invalid/stamps/test.png" },
    {
      ...rawStamp(2),
      stamp_url: `https://stampchain.io/stamps/${TX}.svg`,
      stamp_mimetype: "image/svg+xml",
    },
    {
      ...rawStamp(3),
      stamp_url: `https://stampchain.io/api/v2/stamp/3/preview`,
    },
    {
      ...rawStamp(4),
      stamp_url: `https://stampchain.io/stamps/${TX}.png?refresh=true`,
    },
    { ...rawStamp(5), stamp_mimetype: "text/html" },
  ];
  const adapter = createAdapter({
    mode: "live",
    fetcher: (() => Promise.resolve(pageResponse(rows))) as typeof fetch,
  });
  const { stamps } = await adapter.list(query);
  strictEqual(stamps[0].supply, null);
  strictEqual(stamps[0].block, null);
  strictEqual(stamps[0].locked, null);
  strictEqual(stamps[0].divisible, null);
  strictEqual(stamps[0].mediaUrl, rawStamp().stamp_url);
  strictEqual(stamps.slice(1).every((row) => row.mediaUrl === null), true);
});

Deno.test("fixture paging is globally ordered, complete and deterministic", async () => {
  const rows = Array.from({ length: 29 }, (_, index) => rawStamp(index));
  const adapter = createAdapter({
    mode: "fixture",
    fixtureData: { data: rows, last_block: 200 },
  });
  const seen: string[] = [];
  for (let page = 1; page <= 3; page++) {
    const result = await adapter.list({ ...query, page, sort: "oldest" });
    seen.push(...result.stamps.map((row) => row.id));
    strictEqual(result.totalPages, 3);
    strictEqual(result.total, 29);
    strictEqual(result.freshness, "fixture");
  }
  deepStrictEqual(seen, rows.map((row) => String(row.stamp)));
  strictEqual(new Set(seen).size, 29);
  const reversed = await adapter.list({ ...query, sort: "newest" });
  deepStrictEqual(
    reversed.stamps.map((row) => row.id),
    rows.slice().reverse().slice(0, LIMIT).map((row) => String(row.stamp)),
  );
  strictEqual((await adapter.list({ ...query, page: 4 })).stamps.length, 0);
});

Deno.test("fixture classification mirrors STAMP type contracts", async () => {
  const classic = rawStamp(0);
  const cursed = rawStamp(-1);
  const posh = { ...rawStamp(-2), cpid: "NAMEDASSET" };
  const recursive = { ...rawStamp(3), ident: "SRC-721" };
  const adapter = createAdapter({
    mode: "fixture",
    fixtureData: { data: [classic, cursed, posh, recursive] },
  });
  for (
    const [type, expected] of [["classic", "0"], ["cursed", "-1"], [
      "posh",
      "-2",
    ]] as const
  ) {
    deepStrictEqual(
      (await adapter.list({ ...query, type })).stamps.map((row) => row.id),
      [expected],
    );
  }
  strictEqual((await adapter.detail("NAMEDASSET")).stamp.id, "-2");
  await rejects(() => adapter.detail("42"), hasKind("not-found"));
});

Deno.test("protocol scope is applied upstream and unexpected live records fail visibly", async () => {
  const token = { ...rawStamp(100), ident: "SRC-20" };
  const recursive = { ...rawStamp(1), ident: "SRC-721" };
  const adapter = createAdapter({
    mode: "fixture",
    fixtureData: { data: [rawStamp(0), token, recursive] },
  });
  const page = await adapter.list(query);
  deepStrictEqual(page.stamps.map((stamp) => stamp.id), ["1", "0"]);
  strictEqual(page.total, 2);
  strictEqual((await adapter.detail("0")).stamp.id, "0");
  await rejects(() => adapter.detail("100"), hasKind("not-found"));
  const live = createAdapter({
    mode: "live",
    fetcher: (() =>
      Promise.resolve(pageResponse([rawStamp(0), token]))) as typeof fetch,
  });
  await rejects(() => live.list(query), hasKind("invalid-data"));
});

Deno.test("multi-format live filters use one upstream OR request and retain source pagination", async () => {
  let requests = 0;
  let requestedUrl = "";
  const jpeg = {
    ...rawStamp(1),
    stamp_mimetype: "image/jpeg",
    stamp_url: `https://stampchain.io/stamps/${TX}.jpeg`,
  };
  const adapter = createAdapter({
    mode: "live",
    fetcher: ((url) => {
      requests++;
      requestedUrl = String(url);
      return Promise.resolve(jsonResponse({
        data: [jpeg, rawStamp(0)],
        page: 1,
        limit: LIMIT,
        total: 120,
        totalPages: 10,
      }));
    }) as typeof fetch,
  });
  const result = await adapter.list({ ...query, format: "jpg,png,jpg" });
  const url = new URL(requestedUrl);
  strictEqual(requests, 1);
  deepStrictEqual(url.searchParams.getAll("filetype"), ["png,jpg,jpeg"]);
  strictEqual(url.searchParams.get("ident"), "STAMP,SRC-721");
  strictEqual(result.total, 120);
  strictEqual(result.totalPages, 10);
  deepStrictEqual(result.stamps.map((stamp) => stamp.id), ["1", "0"]);
});

Deno.test("multi-format fixtures exclude GIF before paging and preserve selectable HTML metadata", async () => {
  const rows = Array.from({ length: 30 }, (_, index) => {
    const extension = ["png", "jpeg", "gif"][index % 3];
    return {
      ...rawStamp(index),
      stamp_mimetype: extension === "jpeg"
        ? "image/jpeg"
        : `image/${extension}`,
      stamp_url: `https://stampchain.io/stamps/${TX}.${extension}`,
    };
  });
  const html = {
    ...rawStamp(31),
    stamp_mimetype: "text/html",
    stamp_url: `https://stampchain.io/stamps/${TX}.html`,
  };
  const adapter = createAdapter({
    mode: "fixture",
    fixtureData: { data: [...rows, html] },
  });
  const seen: string[] = [];
  for (const page of [1, 2]) {
    const result = await adapter.list({ ...query, format: "png,jpg", page });
    strictEqual(result.total, 20);
    strictEqual(result.totalPages, 2);
    strictEqual(
      result.stamps.every((stamp) => stamp.mime !== "image/gif"),
      true,
    );
    seen.push(...result.stamps.map((stamp) => stamp.id));
  }
  const expected = rows.filter((row) => row.stamp_mimetype !== "image/gif")
    .reverse().map((row) => String(row.stamp));
  deepStrictEqual(seen, expected);
  strictEqual(new Set(seen).size, 20);
  const htmlResult = await adapter.list({ ...query, format: "html" });
  strictEqual(htmlResult.total, 1);
  strictEqual(htmlResult.stamps[0].id, "31");
  strictEqual(htmlResult.stamps[0].mime, "text/html");
  strictEqual(htmlResult.stamps[0].mediaUrl, null);
});

Deno.test("fixture chronology uses transaction index for negative stamps", async () => {
  const rows = [
    { ...rawStamp(-100), tx_index: 30 },
    { ...rawStamp(-300), tx_index: 10 },
    { ...rawStamp(-200), tx_index: 20 },
  ];
  const adapter = createAdapter({
    mode: "fixture",
    fixtureData: { data: rows },
  });
  deepStrictEqual(
    (await adapter.list({ ...query, type: "cursed", sort: "oldest" })).stamps
      .map((row) => row.id),
    ["-300", "-200", "-100"],
  );
  deepStrictEqual(
    (await adapter.list({ ...query, type: "cursed", sort: "newest" })).stamps
      .map((row) => row.id),
    ["-100", "-200", "-300"],
  );
});

Deno.test("unknown fixture chronology follows known records with deterministic ties", async () => {
  const rows = [
    { ...rawStamp(5), tx_index: null },
    { ...rawStamp(3), tx_index: "unknown" },
    { ...rawStamp(2), tx_index: 20 },
    { ...rawStamp(1), tx_index: 20 },
    { ...rawStamp(0), tx_index: 0 },
  ];
  const adapter = createAdapter({
    mode: "fixture",
    fixtureData: { data: rows },
  });
  for (
    const [sort, ids] of [
      ["oldest", ["0", "1", "2", "3", "5"]],
      ["newest", ["2", "1", "0", "5", "3"]],
    ] as const
  ) {
    deepStrictEqual(
      (await adapter.list({ ...query, sort })).stamps.map((row) => row.id),
      ids,
    );
  }
});

Deno.test("live failures differ from empty results and malformed pages", async () => {
  for (
    const [response, kind] of [
      [new Response("no", { status: 404 }), "not-found"],
      [new Response("no", { status: 500 }), "upstream"],
      [
        new Response("not json", { headers: { "content-type": "text/html" } }),
        "invalid-data",
      ],
      [
        new Response("{broken", {
          headers: { "content-type": "application/json" },
        }),
        "invalid-data",
      ],
      [jsonResponse({ data: [], page: 2, limit: LIMIT }), "invalid-data"],
      [pageResponse([rawStamp(), rawStamp()]), "invalid-data"],
    ] as const
  ) {
    const adapter = createAdapter({
      mode: "live",
      fetcher: (() => Promise.resolve(response)) as typeof fetch,
    });
    await rejects(() => adapter.list(query), hasKind(kind));
  }
  const empty = createAdapter({
    mode: "live",
    fetcher: (() => Promise.resolve(pageResponse([]))) as typeof fetch,
  });
  strictEqual((await empty.list(query)).stamps.length, 0);
});

Deno.test("response limit applies to streamed bodies without content length", async () => {
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(2 * 1024 * 1024 + 1));
    },
    cancel() {
      cancelled = true;
    },
  });
  const adapter = createAdapter({
    mode: "live",
    fetcher: (() =>
      Promise.resolve(
        new Response(body, { headers: { "content-type": "application/json" } }),
      )) as typeof fetch,
  });
  await rejects(() => adapter.list(query), hasKind("invalid-data"));
  strictEqual(cancelled, true);
});

Deno.test("deadline aborts a slow service and caller can retry", async () => {
  let calls = 0;
  let aborted = false;
  const adapter = createAdapter({
    mode: "live",
    timeoutMs: 10,
    fetcher: ((_url, init) => {
      calls++;
      if (calls > 1) return Promise.resolve(pageResponse());
      return new Promise<Response>((_, reject) => {
        (init as { signal?: AbortSignal } | undefined)?.signal
          ?.addEventListener("abort", () => {
            aborted = true;
            reject(new DOMException("Aborted", "AbortError"));
          }, { once: true });
      });
    }) as typeof fetch,
  });
  await rejects(() => adapter.list(query), hasKind("timeout"));
  strictEqual(aborted, true);
  strictEqual((await adapter.list(query)).stamps.length, 1);
  strictEqual(calls, 2);
});

Deno.test("deadline also cancels a stalled response stream", async () => {
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('{"data":['));
    },
    cancel() {
      cancelled = true;
    },
  });
  const adapter = createAdapter({
    mode: "live",
    timeoutMs: 10,
    fetcher: (() =>
      Promise.resolve(
        new Response(stream, {
          headers: { "content-type": "application/json" },
        }),
      )) as typeof fetch,
  });
  await rejects(() => adapter.list(query), hasKind("timeout"));
  strictEqual(cancelled, true);
});
