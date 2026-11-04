const QUERY_KEYS: [RegExp, string[]][] = [
  [/^\/search$/, ["q"]],
  [/^\/collections$/, ["q", "page"]],
  [/^\/collection\/[a-zA-Z0-9_-]{1,80}$/, ["page"]],
  [/^\/wallet\/[a-zA-Z0-9_.%~-]{1,300}$/, ["view", "page"]],
  [/^\/marketplace$/, ["status", "page"]],
  [/^\/activity$/, ["kind", "page"]],
];

/** Return only bounded local browsing routes, never arbitrary redirects. */
export function contextBack(value: string | null): string | null {
  if (
    !value || value.length > 1024 || !value.startsWith("/") ||
    value.startsWith("//") || value.includes("\\") ||
    [...value].some((character) =>
      character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127
    )
  ) return null;
  const url = new URL(value, "https://preview.invalid");
  if (url.origin !== "https://preview.invalid" || url.hash) return null;
  const keys = QUERY_KEYS.find(([path]) => path.test(url.pathname))?.[1];
  if (!keys) return null;
  for (const [key, entry] of url.searchParams) {
    if (!keys.includes(key) || entry.length > 100) return null;
  }
  return url.pathname + url.search;
}

export function contextBackLabel(path: string): string {
  if (path.startsWith("/search")) return "Back to search";
  if (path.startsWith("/wallet/")) return "Back to profile";
  if (path.startsWith("/collection/")) return "Back to collection";
  if (path.startsWith("/collections")) return "Back to collections";
  if (path.startsWith("/marketplace")) return "Back to listings";
  if (path.startsWith("/activity")) return "Back to activity";
  return "Back to explorer";
}
