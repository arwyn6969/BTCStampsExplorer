import type { Activity, Listing } from "../lib/catalog.ts";
import { catalog, dataMode } from "../lib/data.ts";

export function btcFromSats(value: string | null): string {
  if (value === null) return "Unavailable";
  const sats = BigInt(value);
  return `${sats / 100000000n}.${
    String(sats % 100000000n).padStart(8, "0")
  } BTC`;
}

export function RecordTime({ value }: { value: string }) {
  const text = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value));
  return <time dateTime={value}>{text} UTC</time>;
}

function short(value: string): string {
  return value.length > 18 ? `${value.slice(0, 8)}…${value.slice(-6)}` : value;
}

function AddressLink({ address }: { address: string }) {
  const username = catalog?.profile(address)?.username;
  return (
    <a
      href={`/wallet/${encodeURIComponent(address)}`}
      title={address}
      aria-label={username ? `${username}, ${address}` : address}
    >
      {username ?? short(address)}
    </a>
  );
}

function Transaction({ hash }: { hash: string }) {
  return (
    <details class="record-transaction">
      <summary class="mono">{short(hash)}</summary>
      <span class="mono">{hash}</span>
    </details>
  );
}

interface ListingsTableProps {
  rows: Listing[];
  back: string;
  caption?: string;
  currentStampId?: string;
}

export function ListingsTable({
  rows,
  back,
  currentStampId,
  caption = "Example listings — prices are per stamp unit",
}: ListingsTableProps) {
  return (
    <div class="table-scroll" role="region" aria-label={caption} tabIndex={0}>
      <table class="data-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Stamp</th>
            <th scope="col">Price / unit</th>
            <th scope="col">Available units</th>
            <th scope="col">Seller</th>
            <th scope="col">Status</th>
            <th scope="col">Listed (UTC)</th>
            <th scope="col">Example transaction</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((listing) => (
            <tr key={listing.id}>
              <td>
                {listing.stampId === currentStampId ? `#${listing.stampId}` : (
                  <a
                    href={`/stamp/${listing.stampId}?back=${
                      encodeURIComponent(back)
                    }`}
                  >
                    #{listing.stampId}
                  </a>
                )}
              </td>
              <td class="market-price">{btcFromSats(listing.priceSats)}</td>
              <td>{listing.available}</td>
              <td>
                <AddressLink address={listing.seller} />
              </td>
              <td>
                <span class="status-pill">
                  {listing.status === "open" ? "Open" : "Closed"}
                </span>
              </td>
              <td>
                <RecordTime value={listing.timestamp} />
              </td>
              <td>
                <Transaction hash={listing.txHash} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ActivityTableProps {
  rows: Activity[];
  back: string;
  caption?: string;
  currentStampId?: string;
}

export function ActivityTable({
  rows,
  back,
  currentStampId,
  caption = "Example sales and transfers — a transfer is not a sale",
}: ActivityTableProps) {
  return (
    <div class="table-scroll" role="region" aria-label={caption} tabIndex={0}>
      <table class="data-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Event</th>
            <th scope="col">Stamp</th>
            <th scope="col">Units</th>
            <th scope="col">From</th>
            <th scope="col">To</th>
            <th scope="col">Sale price / unit</th>
            <th scope="col">Time (UTC)</th>
            <th scope="col">Example transaction</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((event) => (
            <tr key={event.id}>
              <td>
                <span class="status-pill">
                  {event.kind === "sale" ? "Sale" : "Transfer"}
                </span>
              </td>
              <td>
                {event.stampId === currentStampId ? `#${event.stampId}` : (
                  <a
                    href={`/stamp/${event.stampId}?back=${
                      encodeURIComponent(back)
                    }`}
                  >
                    #{event.stampId}
                  </a>
                )}
              </td>
              <td>{event.quantity}</td>
              <td>
                <AddressLink address={event.from} />
              </td>
              <td>
                <AddressLink address={event.to} />
              </td>
              <td class="market-price">
                {event.kind === "transfer"
                  ? "Not applicable"
                  : btcFromSats(event.priceSats)}
              </td>
              <td>
                <RecordTime value={event.timestamp} />
              </td>
              <td>
                <Transaction hash={event.txHash} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StampMarket({ stampId }: { stampId: string }) {
  if (dataMode !== "fixture" || !catalog) {
    return (
      <section class="market-panel" aria-labelledby="stamp-market-title">
        <h2 id="stamp-market-title">Listings and activity</h2>
        <p>
          Live listings, sales and transfers are not connected yet. These
          records are unavailable in live stamp browsing.
        </p>
      </section>
    );
  }
  const listings = catalog.listings({ stampId });
  const activity = catalog.activity({ stampId });
  const collections = catalog.collectionsForStamp(stampId);
  const back = `/stamp/${encodeURIComponent(stampId)}`;
  return (
    <section class="market-panel" aria-labelledby="stamp-market-title">
      <h2 id="stamp-market-title">Listings and activity</h2>
      <p class="demo-note">
        Fixed demo records. Prices, participants and transactions below are
        examples, not live market or on-chain history.
      </p>
      {collections.length > 0 && (
        <div
          class="related-links"
          aria-label="Sample collections containing this stamp"
        >
          <span>In sample collections:</span>
          {collections.map((collection) => (
            <a
              key={collection.id}
              href={`/collection/${encodeURIComponent(collection.id)}`}
            >
              {collection.name}
            </a>
          ))}
        </div>
      )}
      <h3>Listings</h3>
      {listings.length
        ? (
          <ListingsTable
            rows={listings.slice(0, 3)}
            back={back}
            currentStampId={stampId}
          />
        )
        : (
          <p class="catalog-empty">
            No listing records for this stamp in the demo sample. This does not
            establish its live availability.
          </p>
        )}
      <h3>Sales and transfers</h3>
      {activity.length
        ? (
          <ActivityTable
            rows={activity.slice(0, 5)}
            back={back}
            currentStampId={stampId}
          />
        )
        : (
          <p class="catalog-empty">
            No activity records for this stamp in the demo sample. This is not a
            complete history.
          </p>
        )}
      <div class="related-links">
        <a href="/marketplace">Browse sample listings ↗</a>
        <a href="/activity">Browse sample activity ↗</a>
      </div>
    </section>
  );
}
