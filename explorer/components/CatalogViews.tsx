import type { Stamp } from "../lib/adapter.ts";
import { StampArt } from "./StampArt.tsx";

export const CATALOG_PAGE_SIZE = 12;

export function catalogPage(value: string | null): number {
  return value && /^[1-9]\d{0,3}$/.test(value) ? Number(value) : 1;
}

export function pageItems<T>(items: T[], page: number): T[] {
  return items.slice((page - 1) * CATALOG_PAGE_SIZE, page * CATALOG_PAGE_SIZE);
}

export function CatalogNotice() {
  return (
    <aside class="catalog-notice" aria-label="Demo data notice">
      Fixed demo sample. Usernames, collection membership, holdings, prices and
      activity are for reviewing this preview. They do not establish current
      ownership or market availability. <a href="/help">About the data</a>
    </aside>
  );
}

interface CatalogHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function CatalogHeading(
  { eyebrow, title, description }: CatalogHeadingProps,
) {
  return (
    <header class="catalog-heading">
      <span class="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}

export function CatalogUnavailable() {
  return (
    <section class="catalog-empty" aria-labelledby="catalog-unavailable">
      <h2 id="catalog-unavailable">Live data is not connected for this view</h2>
      <p>
        Stamp browsing is available. Profiles, collections and market activity
        can currently be reviewed in the demo-data preview.
      </p>
      <a class="button" href="/explorer">Explore stamps</a>
    </section>
  );
}

interface StampResultsProps {
  stamps: Stamp[];
  back: string;
  quantities?: Record<string, string>;
  emptyMessage?: string;
}

export function StampResults(
  { stamps, back, quantities, emptyMessage = "No stamps in this sample." }:
    StampResultsProps,
) {
  if (!stamps.length) return <p class="catalog-empty">{emptyMessage}</p>;
  return (
    <div class="stamp-grid">
      {stamps.map((stamp, index) => (
        <a
          class="stamp-card"
          href={`/stamp/${encodeURIComponent(stamp.id)}?back=${
            encodeURIComponent(back)
          }`}
          key={stamp.id}
          data-stamp={stamp.id}
        >
          <StampArt stamp={stamp} priority={index < 4} />
          <div class="card-info">
            <span class="stamp-kind">
              BITCOIN STAMP
              <span>{stamp.mime?.split("/")[1]?.toUpperCase() ?? "FILE"}</span>
            </span>
            <h3>
              #{stamp.id} <span class="card-arrow" aria-hidden="true">↗</span>
            </h3>
            <p>
              {stamp.name ?? stamp.creatorName ?? "Creator name unavailable"}
            </p>
            {quantities?.[stamp.id] !== undefined && (
              <p>Demo holding: {quantities[stamp.id]} units</p>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}

interface CatalogPaginationProps {
  page: number;
  total: number;
  path: string;
  params?: Record<string, string>;
  label?: string;
}

export function CatalogPagination(
  { page, total, params = {}, label = "Results" }: CatalogPaginationProps,
) {
  const pages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
  // Query-relative links avoid Fresh 1 marking every page link as current.
  const href = (next: number) => {
    const query = new URLSearchParams({ ...params, page: String(next) });
    return `?${query}`;
  };
  return (
    <nav class="catalog-pagination" aria-label={`${label} pagination`}>
      {page > 1
        ? <a class="button" rel="prev" href={href(page - 1)}>← Previous</a>
        : <span class="button disabled" aria-disabled="true">← Previous</span>}
      <span>
        {page > pages
          ? `No results on page ${page}`
          : `Page ${page} of ${pages}`}
        {` · ${total} sample records`}
      </span>
      {page > pages
        ? <a class="button" href={href(1)}>First page →</a>
        : page < pages
        ? <a class="button" rel="next" href={href(page + 1)}>Next →</a>
        : <span class="button disabled" aria-disabled="true">Next →</span>}
    </nav>
  );
}
