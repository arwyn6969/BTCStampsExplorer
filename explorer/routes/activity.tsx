import type { Handlers, PageProps } from "$fresh/server.ts";
import { Page } from "../components/Page.tsx";
import { ActivityTable } from "../components/StampMarket.tsx";
import type { Activity } from "../lib/catalog.ts";
import { catalog, dataMode } from "../lib/data.ts";

const PAGE_SIZE = 6;
type Kind = "all" | "sale" | "transfer";
interface ActivityData {
  rows: Activity[];
  kind: Kind;
  page: number;
  totalPages: number;
  total: number;
  available: boolean;
}

function href(kind: Kind, page = 1): string {
  return `/activity?kind=${kind}&page=${page}`;
}

export const handler: Handlers<ActivityData> = {
  GET(request, context) {
    const url = new URL(request.url);
    const rawKind = url.searchParams.get("kind");
    const kind: Kind = rawKind === "sale" || rawKind === "transfer"
      ? rawKind
      : "all";
    const rawPage = url.searchParams.get("page") ?? "1";
    const page = /^[1-9]\d{0,5}$/.test(rawPage) ? Number(rawPage) : 1;
    const available = dataMode === "fixture" && catalog !== null;
    const records = available ? catalog!.activity({ kind }) : [];
    const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
    if (available && page > totalPages) {
      return new Response(null, {
        status: 302,
        headers: { Location: href(kind, totalPages) },
      });
    }
    return context.render({
      kind,
      page,
      total: records.length,
      totalPages,
      available,
      rows: records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    }, { status: available ? 200 : 503 });
  },
};

export default function ActivityPage({ data }: PageProps<ActivityData>) {
  const { rows, kind, page, total, totalPages, available } = data;
  return (
    <Page title="Sales and transfers · Stampchain">
      <div class="shell catalog-shell">
        <header class="catalog-heading">
          <span class="eyebrow">Follow the records</span>
          <h1>Sales and transfers</h1>
          <p>
            See how stamps move between addresses, with each event kept
            distinct.
          </p>
        </header>
        {!available
          ? (
            <section class="catalog-empty">
              <h2>Live activity is unavailable</h2>
              <p>
                The sales and transfer data connections have not been added yet.
                {" "}
                <a href="/explorer">Continue browsing stamps</a>.
              </p>
            </section>
          )
          : (
            <>
              <aside class="demo-note">
                Fixed example events for reviewing the interface, not an
                on-chain history. Addresses, quantities, prices, dates and
                transaction identifiers are illustrative. A transfer is not
                counted as a sale.
              </aside>
              <nav class="catalog-tabs" aria-label="Activity type">
                {([["all", "All activity"], ["sale", "Sales"], [
                  "transfer",
                  "Transfers",
                ]] as const).map(([value, label]) => (
                  <a
                    key={value}
                    href={href(value).slice("/activity".length)}
                    aria-current={value === kind ? "page" : undefined}
                  >
                    {label}
                  </a>
                ))}
              </nav>
              <div class="results-heading">
                <h2>
                  {kind === "all"
                    ? "Sample activity"
                    : kind === "sale"
                    ? "Sample sales"
                    : "Sample transfers"} <span>{total} records</span>
                </h2>
                <span class="result-order">Newest first</span>
              </div>
              {rows.length
                ? <ActivityTable rows={rows} back={href(kind, page)} />
                : (
                  <section class="catalog-empty">
                    <h2>No events in this sample</h2>
                    <p>
                      Try another event type. This sample is not a complete
                      transaction history.
                    </p>
                  </section>
                )}
              <nav class="catalog-pagination" aria-label="Activity pages">
                {page > 1
                  ? (
                    <a
                      class="button"
                      rel="prev"
                      href={href(kind, page - 1).slice("/activity".length)}
                    >
                      ← Previous
                    </a>
                  )
                  : <span>First page</span>}
                <span>Page {page} of {totalPages}</span>
                {page < totalPages
                  ? (
                    <a
                      class="button"
                      rel="next"
                      href={href(kind, page + 1).slice("/activity".length)}
                    >
                      Next →
                    </a>
                  )
                  : <span>Last page</span>}
              </nav>
              <p class="catalog-empty">
                Sale prices are BTC per unit where supplied. Missing sale prices
                are unavailable. Transfers have no sale price.
              </p>
            </>
          )}
      </div>
    </Page>
  );
}
