export const LIMIT = 12;
export const MAX_PAGE = 1_000_000;
export const FORMAT_OPTIONS = ["png", "jpg", "gif", "webp", "html"] as const;
export type StampFormat = typeof FORMAT_OPTIONS[number];

export interface ExplorerQuery {
  type: "all" | "classic" | "posh" | "cursed";
  /** "all" or a comma-separated selection in FORMAT_OPTIONS order. */
  format: string;
  sort: "newest" | "oldest";
  page: number;
}

function normalizeFormats(values: string[]): string {
  const tokens = values.flatMap((value) => value.split(","))
    .map((value) => value.trim().toLowerCase())
    .map((value) => value === "jpeg" ? "jpg" : value);
  if (tokens.includes("all")) return "all";
  const formats = FORMAT_OPTIONS.filter((format) => tokens.includes(format));
  return formats.length ? formats.join(",") : "all";
}

export function selectedFormats(format: string): StampFormat[] {
  const normalized = normalizeFormats([format]);
  return normalized === "all" ? [] : normalized.split(",") as StampFormat[];
}

function choice<T extends string>(
  value: string | null,
  choices: readonly T[],
  fallback: T,
): T {
  return choices.includes(value as T) ? value as T : fallback;
}

export function parseQuery(params: URLSearchParams): ExplorerQuery {
  const rawPage = params.get("page");
  const page = rawPage && /^\d{1,7}$/.test(rawPage) ? Number(rawPage) : 1;
  return {
    type: choice(
      params.get("type"),
      ["all", "classic", "posh", "cursed"],
      "all",
    ),
    format: normalizeFormats(params.getAll("format")),
    sort: choice(params.get("sort"), ["newest", "oldest"], "newest"),
    page: page >= 1 && page <= MAX_PAGE ? page : 1,
  };
}

export function queryString(query: ExplorerQuery): string {
  const normalized = parseQuery(
    new URLSearchParams({
      type: query.type,
      format: query.format,
      sort: query.sort,
      page: String(query.page),
    }),
  );
  return `?${
    new URLSearchParams({
      type: normalized.type,
      format: normalized.format,
      sort: normalized.sort,
      page: String(normalized.page),
    }).toString().replaceAll("%2C", ",")
  }`;
}

export function withPage(query: ExplorerQuery, page: number): ExplorerQuery {
  return parseQuery(
    new URLSearchParams({
      type: query.type,
      format: query.format,
      sort: query.sort,
      page: String(page),
    }),
  );
}
