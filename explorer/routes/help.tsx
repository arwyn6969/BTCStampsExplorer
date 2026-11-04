import { Page } from "../components/Page.tsx";
import { dataMode } from "../lib/data.ts";

export default function Help() {
  return (
    <Page title="About this preview · Stampchain">
      <div class="shell catalog-shell">
        <header class="catalog-heading">
          <span class="eyebrow">Bitcoin Stamps explorer</span>
          <h1>About this preview</h1>
          <p>Explore the artwork, the people and the records around it.</p>
        </header>
        <aside class="demo-note" aria-label="Preview data">
          {dataMode === "fixture"
            ? "Demo mode is on. Artwork and creation records are a fixed source sample. Profiles, holdings, collections, prices and activity are examples for reviewing the interface, not live records."
            : "Live stamp browsing is on. The other sections need their live data connections; demo records are not mixed into live views."}
        </aside>
        <section class="panel" aria-labelledby="available-title">
          <h2 id="available-title">Ready to explore</h2>
          <ul class="help-list">
            <li>
              <a href="/explorer">Artwork</a>: combine file formats, sort, open
              a stamp and return to your selection.
            </li>
            <li>
              <a href="/search">Search</a>: look up a stamp number, asset
              identifier, creation transaction, username or address in the demo
              sample.
            </li>
            <li>
              <a href="/collections">Collections</a>: browse sample groups and
              their stamps.
            </li>
            <li>
              <a href="/marketplace">Listings</a>: inspect example prices,
              quantities, seller addresses and listing status.
            </li>
            <li>
              <a href="/activity">Activity</a>: follow example sales and
              transfers as separate event types.
            </li>
          </ul>
          <p>
            Creator links open a public address page with created and held
            stamps. A username is a display label for an address; it does not
            verify a person's identity. Balances and holdings are only the
            supplied sample, not a wallet balance check.
          </p>
        </section>
        <section class="panel" aria-labelledby="preview-title">
          <h2 id="preview-title">Artwork previews</h2>
          <p>
            PNG, JPEG, GIF and WebP images are shown where a supported static
            image is available. HTML artwork uses an existing static PNG
            preview. The original HTML does not run here, and missing previews
            are labelled.
          </p>
        </section>
        <section class="panel" aria-labelledby="remaining-title">
          <h2 id="remaining-title">Before a live release</h2>
          <p>
            Live profile, collection and market data still need to be connected
            and checked against their sources. Search across the full archive,
            production route coverage, independent hosting, hosted rollback and
            final usability review remain release work.
          </p>
          <p>
            This is a temporary review site. It supports browsing records.
            Buying, listing, signing transactions, minting and sending assets
            are separate work.
          </p>
        </section>
        <section class="panel" aria-labelledby="data-title">
          <h2 id="data-title">Reading the records</h2>
          <p>
            BTC prices are per unit where stated. A transfer is not a sale.
            Missing data is shown as unavailable rather than zero. Demo events
            and prices are illustrative and must not be used to make a trade.
          </p>
          <p>
            Dates are displayed in UTC. Creation details include the source
            block and transaction, with a transaction link for further
            inspection.
          </p>
        </section>
      </div>
    </Page>
  );
}
