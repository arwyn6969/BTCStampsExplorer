import type { Handlers, PageProps } from "$fresh/server.ts";
import { Page } from "../components/Page.tsx";
import {
  CatalogHeading,
  CatalogNotice,
  CatalogUnavailable,
  StampResults,
} from "../components/CatalogViews.tsx";
import { catalog, dataMode } from "../lib/data.ts";

interface SearchData {
  query: string;
  tooLong: boolean;
}

export const handler: Handlers<SearchData> = {
  GET(request, context) {
    const raw = new URL(request.url).searchParams.get("q") ?? "";
    return context.render({
      query: raw.trim().slice(0, 100),
      tooLong: raw.length > 100,
    }, {
      status: dataMode === "live" ? 503 : raw.length > 100 ? 400 : 200,
    });
  },
};

export default function Search({ data }: PageProps<SearchData>) {
  const result = dataMode === "fixture" && data.query && !data.tooLong
    ? catalog.search(data.query)
    : null;
  const empty = result && !result.stamps.length && !result.profiles.length &&
    !result.collections.length;
  const back = `/search?${new URLSearchParams({ q: data.query })}`;
  return (
    <Page title="Search Bitcoin Stamps · Stampchain">
      <div class="page-shell catalog-shell">
        <CatalogHeading
          eyebrow="Find a record"
          title="Search the archive"
          description="Look up a stamp, discover a creator, or explore a collection."
        />
        {dataMode === "live" ? <CatalogUnavailable /> : (
          <>
            <CatalogNotice />
            <form
              class="catalog-search"
              action="/search"
              method="get"
              role="search"
              aria-label="Search archive"
            >
              <label for="archive-query">
                Stamp number, asset ID, transaction, username or address
                <input
                  id="archive-query"
                  type="search"
                  name="q"
                  value={data.query}
                  maxLength={100}
                  autoComplete="off"
                  aria-describedby="search-hint"
                />
              </label>
              <button class="button primary" type="submit">Search ↗</button>
              <p id="search-hint">
                Try <a href="?q=TonyNL">TonyNL</a>,{" "}
                <a href="?q=Arwyn">Arwyn</a>, <a href="?q=1505513">1505513</a>
                {" "}
                or a collection name. Searches cover the fixed sample only.
              </p>
            </form>
            {data.tooLong && (
              <p class="catalog-empty" role="alert">
                Use 100 characters or fewer for your search.
              </p>
            )}
            {!data.query && (
              <p class="catalog-empty">
                Enter a term to search stamps, profiles and collections.
              </p>
            )}
            {empty && (
              <section class="catalog-empty">
                <h2>No matching sample records</h2>
                <p>
                  Try a stamp number or another name. This demo does not search
                  the full live archive.
                </p>
              </section>
            )}
            {result && (
              <>
                {result.stamps.length > 0 && (
                  <section
                    class="catalog-section"
                    aria-labelledby="stamp-results"
                  >
                    <h2 id="stamp-results">Stamps · {result.stamps.length}</h2>
                    <StampResults stamps={result.stamps} back={back} />
                  </section>
                )}
                {result.profiles.length > 0 && (
                  <section
                    class="catalog-section"
                    aria-labelledby="profile-results"
                  >
                    <h2 id="profile-results">
                      Creators and addresses · {result.profiles.length}
                    </h2>
                    <ul class="catalog-result-list">
                      {result.profiles.map((profile) => (
                        <li key={profile.address}>
                          <a
                            class="catalog-result"
                            href={`/wallet/${
                              encodeURIComponent(profile.address)
                            }`}
                          >
                            <strong>
                              {profile.username ?? "Public address"}
                            </strong>
                            <span class="mono">{profile.address}</span>
                            <small>
                              View created stamps and demo holdings ↗
                            </small>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {result.collections.length > 0 && (
                  <section
                    class="catalog-section"
                    aria-labelledby="collection-results"
                  >
                    <h2 id="collection-results">
                      Collections · {result.collections.length}
                    </h2>
                    <ul class="catalog-result-list">
                      {result.collections.map((collection) => (
                        <li key={collection.id}>
                          <a
                            class="catalog-result"
                            href={`/collection/${
                              encodeURIComponent(collection.id)
                            }`}
                          >
                            <strong>{collection.name}</strong>
                            <small>{collection.description}</small>
                            <small>
                              {collection.stampIds.length} sample stamps ↗
                            </small>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {result.truncated && (
                  <p class="catalog-empty">
                    Showing up to eight matches per group. Refine the search to
                    find a more specific record.
                  </p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Page>
  );
}
