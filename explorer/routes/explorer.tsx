import type { Handlers, PageProps } from "$fresh/server.ts";
import { STAMP_TYPES } from "../../lib/constants/stampConstants.ts";
import { ErrorState, Page } from "../components/Page.tsx";
import { StampArt } from "../components/StampArt.tsx";
import { adapter } from "../lib/data.ts";
import type { StampPage } from "../lib/adapter.ts";
import {
  type ExplorerQuery,
  FORMAT_OPTIONS,
  MAX_PAGE,
  parseQuery,
  queryString,
  selectedFormats,
  withPage,
} from "../lib/query.ts";

interface ExplorerData {
  query: ExplorerQuery;
  result: StampPage | null;
  error: string | null;
}

export const handler: Handlers<ExplorerData> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    if (!url.search) {
      return new Response(null, {
        status: 302,
        headers: {
          location: "/explorer?type=all&format=png&sort=newest&page=1",
        },
      });
    }
    const query = parseQuery(url.searchParams);
    const canonical = queryString(query);
    if (url.search !== canonical) {
      return new Response(null, {
        status: 302,
        headers: { location: `/explorer${canonical}` },
      });
    }
    try {
      return ctx.render({
        query,
        result: await adapter.list(query),
        error: null,
      });
    } catch (error) {
      return ctx.render({
        query,
        result: null,
        error: error instanceof Error ? error.message : "Please try again.",
      }, { status: 502 });
    }
  },
};

const typeLabels = [
  [STAMP_TYPES.ALL, "All art stamps"],
  [STAMP_TYPES.CLASSIC, "Classic"],
  [STAMP_TYPES.POSH, "Posh"],
  [STAMP_TYPES.CURSED, "Cursed"],
];

export default function Explorer({ data }: PageProps<ExplorerData>) {
  const { query, result, error } = data;
  const state = queryString(query);
  const formats = selectedFormats(query.format);
  return (
    <Page title="Explore Bitcoin Stamps · Stampchain">
      <div class="shell">
        <section class="explorer-intro">
          <div>
            <span class="eyebrow">
              <span class="orange-line" />The Bitcoin Stamps archive
            </span>
            <h1>Explore Bitcoin Stamps</h1>
            <p>Discover the art. Trace its origin. All preserved on Bitcoin.</p>
            <p class="scope-note">
              Choose one or more formats. HTML artwork uses an existing static
              preview where available.
            </p>
          </div>
          <div class="intro-note">
            <span class="tiny-stamp" aria-hidden="true">₿</span>
            <span>
              SMALL FILES.<br />
              <strong>LASTING IMPRESSIONS.</strong>
            </span>
          </div>
        </section>
        <form
          class="filter-bar"
          method="get"
          action="/explorer"
          aria-label="Filter and sort stamps"
        >
          <label class="type-filter">
            <span>Stamp type</span>
            <select name="type" value={query.type}>
              {typeLabels.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <fieldset class="format-filter">
            <legend>File formats</legend>
            <div class="format-options">
              <button
                class="format-all"
                type="button"
                aria-label="All formats"
                aria-pressed={formats.length === 0}
                data-format-all
                hidden
              >
                All
              </button>
              <noscript>
                <a
                  class="format-all"
                  href={queryString({ ...query, format: "all", page: 1 })}
                >
                  All
                </a>
              </noscript>
              {FORMAT_OPTIONS.map((format) => (
                <label class="format-chip" key={format}>
                  <input
                    type="checkbox"
                    name="format"
                    value={format}
                    checked={formats.includes(format)}
                  />
                  <span>
                    {format === "jpg" ? "JPEG" : format.toUpperCase()}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <label class="sort-filter">
            <span>Order</span>
            <select name="sort" value={query.sort}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
          <button class="button primary apply-filter" type="submit">
            Apply filters <span aria-hidden="true">↗</span>
          </button>
          <a class="reset-link" href="/explorer">Reset</a>
        </form>
        {error
          ? <ErrorState message={error} href={`/explorer${state}`} />
          : result && (
            <>
              <div class="results-heading">
                <h2>
                  Explore the archive{" "}
                  <span>
                    {result.total === null
                      ? "Total unavailable"
                      : `${result.total.toLocaleString("en-GB")} stamps`}
                  </span>
                </h2>
                <span class="result-order">
                  {query.sort === "newest" ? "Newest" : "Oldest"}{" "}
                  across all pages
                </span>
              </div>
              {result.stamps.length === 0
                ? (
                  <section class="empty-state">
                    <span class="placeholder-mark" aria-hidden="true">▧</span>
                    <h2>No stamps in this view.</h2>
                    <p>Try another format or reset the filters.</p>
                    <a class="button" href="/explorer">Reset filters</a>
                  </section>
                )
                : (
                  <div class="stamp-grid">
                    {result.stamps.map((stamp, i) => (
                      <a
                        class="stamp-card"
                        key={stamp.id}
                        href={`/stamp/${encodeURIComponent(stamp.id)}?from=${
                          encodeURIComponent(state)
                        }`}
                        data-stamp={stamp.id}
                      >
                        <StampArt stamp={stamp} priority={i < 4} />
                        <div class="card-info">
                          <span class="stamp-kind">
                            BITCOIN STAMP{" "}
                            <span>
                              {stamp.mime?.split("/")[1]?.toUpperCase() ??
                                "FILE"}
                            </span>
                          </span>
                          <h3>
                            #{stamp.id}
                            <span class="card-arrow" aria-hidden="true">↗</span>
                          </h3>
                          <p>
                            {stamp.creatorName || (stamp.creator
                              ? `${stamp.creator.slice(0, 7)}…${
                                stamp.creator.slice(-5)
                              }`
                              : "Creator unavailable")}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              {query.page >= MAX_PAGE && (
                <p class="detail-note">
                  The browsing page limit has been reached. Narrow the filters
                  to continue.
                </p>
              )}
              <nav class="pagination" aria-label="Pagination">
                {query.page > 1
                  ? (
                    <a
                      class="button"
                      rel="prev"
                      href={queryString(withPage(query, query.page - 1))}
                    >
                      ← Previous
                    </a>
                  )
                  : (
                    <span class="button disabled" aria-disabled="true">
                      ← Previous
                    </span>
                  )}
                <span>
                  Page <strong>{query.page}</strong>
                  {result.totalPages !== null
                    ? ` of ${result.totalPages.toLocaleString("en-GB")}`
                    : ""}
                </span>
                {(query.page < MAX_PAGE && (result.totalPages === null
                    ? result.stamps.length === result.limit
                    : query.page < result.totalPages))
                  ? (
                    <a
                      class="button"
                      rel="next"
                      href={queryString(withPage(query, query.page + 1))}
                    >
                      Next <span aria-hidden="true">→</span>
                    </a>
                  )
                  : (
                    <span class="button disabled" aria-disabled="true">
                      Next →
                    </span>
                  )}
              </nav>
              <aside class="data-note">
                <span class="source-dot" />
                {result.source === "fixture" ? "Sample dataset" : "Live API"}
                <span>
                  Fetched{" "}
                  {new Date(result.fetchedAt).toLocaleTimeString("en-GB", {
                    timeZone: "UTC",
                  })} UTC
                </span>
                <span>
                  Indexed block{" "}
                  {result.lastBlock?.toLocaleString("en-GB") ?? "unavailable"}
                </span>
                <span>
                  Freshness{" "}
                  {result.freshness === "fixture"
                    ? "sample snapshot"
                    : "unknown"}
                </span>
              </aside>
            </>
          )}
      </div>
    </Page>
  );
}
