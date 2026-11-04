import type { Handlers, PageProps } from "$fresh/server.ts";
import { Page } from "../components/Page.tsx";
import {
  CatalogHeading,
  CatalogNotice,
  catalogPage,
  CatalogPagination,
  CatalogUnavailable,
  pageItems,
} from "../components/CatalogViews.tsx";
import { catalog, dataMode } from "../lib/data.ts";

interface CollectionsData {
  query: string;
  page: number;
  tooLong: boolean;
}

export const handler: Handlers<CollectionsData> = {
  GET(request, context) {
    const params = new URL(request.url).searchParams;
    const raw = params.get("q") ?? "";
    return context.render({
      query: raw.trim().slice(0, 100),
      page: catalogPage(params.get("page")),
      tooLong: raw.length > 100,
    }, { status: dataMode === "live" ? 503 : raw.length > 100 ? 400 : 200 });
  },
};

export default function Collections({ data }: PageProps<CollectionsData>) {
  const collections = dataMode === "fixture" && !data.tooLong
    ? catalog.collections(data.query)
    : [];
  return (
    <Page title="Collections · Stampchain">
      <div class="page-shell catalog-shell">
        <CatalogHeading
          eyebrow="Curated groups"
          title="Explore collections"
          description="Follow artwork through collections and their creators."
        />
        {dataMode === "live" ? <CatalogUnavailable /> : (
          <>
            <CatalogNotice />
            <form class="catalog-search" method="get" action="/collections">
              <label for="collection-query">
                Collection name<input
                  id="collection-query"
                  name="q"
                  type="search"
                  value={data.query}
                  maxLength={100}
                />
              </label>
              <button class="button primary" type="submit">
                Find collections ↗
              </button>
            </form>
            {data.tooLong
              ? (
                <p class="catalog-empty" role="alert">
                  Use 100 characters or fewer for the collection name.
                </p>
              )
              : (
                <>
                  <section
                    class="catalog-section"
                    aria-labelledby="collection-list"
                  >
                    <h2 id="collection-list">
                      {collections.length} sample collections
                    </h2>
                    {collections.length === 0 ||
                        pageItems(collections, data.page).length === 0
                      ? (
                        <p class="catalog-empty">
                          No sample collections in this view. Try another name
                          or return to{" "}
                          <a href="/collections">all collections</a>.
                        </p>
                      )
                      : (
                        <div class="collection-grid">
                          {pageItems(collections, data.page).map((
                            collection,
                          ) => (
                            <a
                              key={collection.id}
                              class="collection-card"
                              href={`/collection/${
                                encodeURIComponent(collection.id)
                              }`}
                            >
                              <span class="eyebrow">Demo collection</span>
                              <h3>{collection.name} ↗</h3>
                              <p>{collection.description}</p>
                              <small>
                                {collection.stampIds.length} sample stamps ·
                                {" "}
                                {collection.creatorAddresses.length} creators
                              </small>
                            </a>
                          ))}
                        </div>
                      )}
                  </section>
                  <CatalogPagination
                    page={data.page}
                    total={collections.length}
                    path="/collections"
                    params={data.query ? { q: data.query } : {}}
                    label="Collections"
                  />
                </>
              )}
          </>
        )}
      </div>
    </Page>
  );
}
