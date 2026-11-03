export const LIMIT = 12;
export const MAX_PAGE = 1_000_000;

export interface ExplorerQuery {
  type: "all" | "classic" | "posh" | "cursed";
  format: "all" | "png" | "jpg" | "gif" | "webp";
  sort: "newest" | "oldest";
  page: number;
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
    format: choice(
      params.get("format"),
      ["all", "png", "jpg", "gif", "webp"],
      "all",
    ),
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
  return `?${new URLSearchParams({
    type: normalized.type,
    format: normalized.format,
    sort: normalized.sort,
    page: String(normalized.page),
  })}`;
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
