import type { Handlers, PageProps } from "$fresh/server.ts";
import { Page } from "../../components/Page.tsx";
import {
  CatalogHeading,
  CatalogNotice,
  catalogPage,
  CatalogPagination,
  CatalogUnavailable,
  pageItems,
  StampResults,
} from "../../components/CatalogViews.tsx";
import { catalog, dataMode } from "../../lib/data.ts";
import type { Stamp } from "../../lib/adapter.ts";

interface CollectionData {
  collection: ReturnType<typeof catalog.collection>;
  page: number;
}

export const handler: Handlers<CollectionData> = {
  GET(request, context) {
    const page = catalogPage(new URL(request.url).searchParams.get("page"));
    const collection = dataMode === "fixture"
      ? catalog.collection(context.params.id)
      : null;
    return context.render({ collection, page }, {
      status: dataMode === "live" ? 503 : collection ? 200 : 404,
    });
  },
};

export default function CollectionDetail({ data }: PageProps<CollectionData>) {
  const { collection, page } = data;
  const stamps = collection?.stampIds.map((id) => catalog.stamp(id)).filter((
    stamp,
  ): stamp is Stamp => stamp !== null) ?? [];
  const path = collection
    ? `/collection/${encodeURIComponent(collection.id)}`
    : "/collections";
  const back = `${path}?page=${page}`;
  return (
    <Page
      title={`${collection?.name ?? "Collection unavailable"} · Stampchain`}
    >
      <div class="page-shell catalog-shell">
        <a class="back-link" href="/collections">← Back to collections</a>
        <CatalogHeading
          eyebrow="Demo collection"
          title={collection?.name ?? "Collection unavailable"}
          description={collection?.description ??
            "Find artwork grouped into sample collections."}
        />
        {dataMode === "live"
          ? <CatalogUnavailable />
          : !collection
          ? (
            <section class="catalog-empty">
              <h2>Collection not found in this sample</h2>
              <a class="button" href="/collections">Browse collections</a>
            </section>
          )
          : (
            <>
              <CatalogNotice />
              <section
                class="catalog-section"
                aria-labelledby="collection-creators"
              >
                <h2 id="collection-creators">Creators</h2>
                <ul class="catalog-result-list">
                  {collection.creatorAddresses.map((address) => (
                    <li key={address}>
                      <a
                        class="catalog-result"
                        href={`/wallet/${encodeURIComponent(address)}`}
                      >
                        <strong>
                          {catalog.profile(address)?.username ??
                            "Public address"}
                        </strong>
                        <small class="mono">{address}</small>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
              <section
                class="catalog-section"
                aria-labelledby="collection-stamps"
              >
                <h2 id="collection-stamps">{stamps.length} sample stamps</h2>
                <StampResults
                  stamps={pageItems(stamps, page)}
                  back={back}
                  emptyMessage={page > 1
                    ? "No sample stamps on this page. Return to a previous page."
                    : "No stamps recorded in this sample collection."}
                />
                <CatalogPagination
                  page={page}
                  total={stamps.length}
                  path={path}
                  label="Collection stamps"
                />
              </section>
            </>
          )}
      </div>
    </Page>
  );
}
