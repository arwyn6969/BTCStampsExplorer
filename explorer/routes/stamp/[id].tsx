import type { Handlers, PageProps } from "$fresh/server.ts";
import { ErrorState, Page } from "../../components/Page.tsx";
import { StampArt } from "../../components/StampArt.tsx";
import { AdapterError, type DetailResult } from "../../lib/adapter.ts";
import { adapter } from "../../lib/data.ts";
import { parseQuery, queryString } from "../../lib/query.ts";

interface DetailData {
  result?: DetailResult;
  error?: string;
  backHref: string;
}

export const handler: Handlers<DetailData> = {
  async GET(request, context) {
    const url = new URL(request.url);
    const query = parseQuery(
      new URLSearchParams(url.searchParams.get("from") ?? ""),
    );
    const backHref = `/explorer${queryString(query)}`;
    try {
      const result = await adapter.detail(context.params.id);
      if (context.params.id !== result.stamp.id) {
        return new Response(null, {
          status: 302,
          headers: {
            location: `/stamp/${encodeURIComponent(result.stamp.id)}?from=${
              encodeURIComponent(queryString(query))
            }`,
          },
        });
      }
      return context.render({ result, backHref });
    } catch (error) {
      const invalid = error instanceof AdapterError && error.kind === "invalid";
      const missing = error instanceof AdapterError &&
        error.kind === "not-found";
      return context.render({
        error: invalid
          ? "Enter a valid stamp identifier or return to the explorer."
          : missing
          ? "The source did not return a detail record for this stamp. Try again or return to the explorer."
          : "The stamp data could not be loaded. Please try again.",
        backHref,
      }, { status: invalid || missing ? 404 : 502 });
    }
  },
};

function utc(value: string | null): string {
  if (!value) return "Unavailable";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value)) + " UTC";
}

function booleanLabel(value: boolean | null): string {
  return value === null ? "Unavailable" : value ? "Yes" : "No";
}

export default function StampDetail({ data, url }: PageProps<DetailData>) {
  const { result, error, backHref } = data;
  const stamp = result?.stamp;
  return (
    <Page
      title={stamp
        ? `Bitcoin Stamp #${stamp.id} · Stampchain`
        : "Stamp unavailable · Stampchain"}
    >
      <div class="page-shell detail-shell">
        <a class="back-link" href={backHref}>
          <span aria-hidden="true">←</span> Back to explorer
        </a>
        {!result || !stamp
          ? (
            <ErrorState
              message={error ?? "This stamp is unavailable."}
              href={`${url.pathname}${url.search}`}
              backHref={backHref}
              heading="h1"
            />
          )
          : (
            <>
              <div class="detail-grid">
                <div class="detail-art">
                  <StampArt stamp={stamp} priority />
                  <p class="art-caption">
                    {stamp.mime ?? "Format unavailable"}{" "}
                    · Existing raster artwork where available
                  </p>
                </div>
                <section class="detail-info" aria-labelledby="stamp-title">
                  <span class="eyebrow">Bitcoin Stamp</span>
                  <h1 id="stamp-title">Stamp #{stamp.id}</h1>
                  {stamp.name && <p class="stamp-name">{stamp.name}</p>}
                  <p class="detail-intro">A record of art on Bitcoin.</p>
                  <dl class="detail-facts">
                    <div>
                      <dt>Supply</dt>
                      <dd>{stamp.supply ?? "Unavailable"}</dd>
                    </div>
                    <div>
                      <dt>Locked</dt>
                      <dd>{booleanLabel(stamp.locked)}</dd>
                    </div>
                    <div>
                      <dt>Divisible</dt>
                      <dd>{booleanLabel(stamp.divisible)}</dd>
                    </div>
                  </dl>
                  <h2>Creation record</h2>
                  <dl class="provenance">
                    <div>
                      <dt>Creator</dt>
                      <dd>
                        {stamp.creatorName && (
                          <span class="creator-name">
                            {stamp.creatorName}
                            <br />
                          </span>
                        )}
                        <span class="mono">
                          {stamp.creator ?? "Unavailable"}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt>Asset identifier</dt>
                      <dd class="mono">{stamp.cpid}</dd>
                    </div>
                    <div>
                      <dt>Created</dt>
                      <dd>{utc(stamp.timestamp)}</dd>
                    </div>
                    <div>
                      <dt>Block</dt>
                      <dd>{stamp.block ?? "Unavailable"}</dd>
                    </div>
                    <div>
                      <dt>Creation transaction</dt>
                      <dd class="mono">
                        <a
                          href={`https://mempool.space/tx/${stamp.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {stamp.txHash}
                          <span
                            class="external-mark"
                            aria-label="opens in a new tab"
                          >
                            ↗
                          </span>
                        </a>
                      </dd>
                    </div>
                  </dl>
                  <p class="detail-scope">
                    This view shows creation provenance. Listings, sales, and
                    transfers are not included in this preview.
                  </p>
                </section>
              </div>
              <aside class="data-note" aria-label="Data source">
                <span>
                  {result.source === "fixture"
                    ? "Fixture sample"
                    : "Stampchain API"}
                </span>
                <span>Fetched {utc(result.fetchedAt)}</span>
                <span>Indexed block: {result.lastBlock ?? "unavailable"}</span>
                <span>
                  {result.freshness === "fixture"
                    ? "Fixed sample; not live data"
                    : "Source freshness unknown"}
                </span>
              </aside>
            </>
          )}
      </div>
    </Page>
  );
}
