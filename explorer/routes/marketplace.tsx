import type { Handlers, PageProps } from "$fresh/server.ts";
import { Page } from "../components/Page.tsx";
import { ListingsTable } from "../components/StampMarket.tsx";
import type { Listing } from "../lib/catalog.ts";
import { catalog, dataMode } from "../lib/data.ts";

const PAGE_SIZE = 6;
type Status = "all" | "open" | "closed";
interface MarketplaceData {
  rows: Listing[];
  status: Status;
  page: number;
  totalPages: number;
  total: number;
  available: boolean;
}

function href(status: Status, page = 1): string {
  return `/marketplace?status=${status}&page=${page}`;
}

export const handler: Handlers<MarketplaceData> = {
  GET(request, context) {
    const url = new URL(request.url);
    const rawStatus = url.searchParams.get("status");
    const status: Status = rawStatus === "all" || rawStatus === "closed"
      ? rawStatus
      : "open";
    const rawPage = url.searchParams.get("page") ?? "1";
    const page = /^[1-9]\d{0,5}$/.test(rawPage) ? Number(rawPage) : 1;
    const available = dataMode === "fixture" && catalog !== null;
    const records = available ? catalog!.listings({ status }) : [];
    const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
    if (available && page > totalPages) {
      return new Response(null, {
        status: 302,
        headers: { Location: href(status, totalPages) },
      });
    }
    return context.render({
      status,
      page,
      total: records.length,
      totalPages,
      available,
      rows: records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    }, { status: available ? 200 : 503 });
  },
};

export default function Marketplace({ data }: PageProps<MarketplaceData>) {
  const { rows, status, page, total, totalPages, available } = data;
  return (
    <Page title="Stamp listings · Stampchain">
      <div class="shell catalog-shell">
        <header class="catalog-heading">
          <span class="eyebrow">The Bitcoin Stamps market</span>
          <h1>Stamp listings</h1>
          <p>
            Inspect prices, quantities and the addresses behind the listings.
          </p>
        </header>
        {!available
          ? (
            <section class="catalog-empty">
              <h2>Live listings are unavailable</h2>
              <p>
                The listing data connection has not been added yet.{" "}
                <a href="/explorer">Continue browsing stamps</a>.
              </p>
            </section>
          )
          : (
            <>
              <aside class="demo-note">
                Fixed demo listings for reviewing this interface. Prices,
                availability, seller details and transaction identifiers are
                examples. No purchase or listing actions are offered here.
              </aside>
              <nav class="catalog-tabs" aria-label="Listing status">
                {([["open", "Open"], ["closed", "Closed"], [
                  "all",
                  "All listings",
                ]] as const).map(([value, label]) => (
                  <a
                    key={value}
                    href={href(value).slice("/marketplace".length)}
                    aria-current={value === status ? "page" : undefined}
                  >
                    {label}
                  </a>
                ))}
              </nav>
              <div class="results-heading">
                <h2>
                  {status === "all"
                    ? "All sample listings"
                    : `${
                      status === "open" ? "Open" : "Closed"
                    } sample listings`} <span>{total} records</span>
                </h2>
              </div>
              {rows.length
                ? <ListingsTable rows={rows} back={href(status, page)} />
                : (
                  <section class="catalog-empty">
                    <h2>No listings in this sample</h2>
                    <p>
                      Try another status. An empty demo view does not establish
                      live market availability.
                    </p>
                  </section>
                )}
              <nav class="catalog-pagination" aria-label="Listings pages">
                {page > 1
                  ? (
                    <a
                      class="button"
                      rel="prev"
                      href={href(status, page - 1).slice("/marketplace".length)}
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
                      href={href(status, page + 1).slice("/marketplace".length)}
                    >
                      Next →
                    </a>
                  )
                  : <span>Last page</span>}
              </nav>
              <p class="catalog-empty">
                Prices are BTC per stamp unit. Available units are sample
                quantities; closed listings are not available for purchase.
              </p>
            </>
          )}
      </div>
    </Page>
  );
}
