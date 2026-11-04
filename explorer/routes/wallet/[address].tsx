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

interface ProfileData {
  profile: ReturnType<typeof catalog.profile>;
  view: "created" | "held";
  page: number;
}

export const handler: Handlers<ProfileData> = {
  GET(request, context) {
    const params = new URL(request.url).searchParams;
    const view = params.get("view") === "held"
      ? "held" as const
      : "created" as const;
    const page = catalogPage(params.get("page"));
    if (dataMode === "live") {
      // Username aliases are supplied by the demo catalog only.
      if (!/^[a-zA-Z0-9]{14,90}$/.test(context.params.address)) {
        return context.renderNotFound();
      }
      return context.render({ profile: null, view, page }, { status: 503 });
    }
    const profile = catalog.profile(context.params.address);
    if (profile && context.params.address !== profile.address) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/wallet/${
            encodeURIComponent(profile.address)
          }?${new URLSearchParams({ view, page: String(page) })}`,
        },
      });
    }
    return context.render({ profile, view, page }, {
      status: profile ? 200 : 404,
    });
  },
};

export default function PublicProfile({ data }: PageProps<ProfileData>) {
  const { profile, view, page } = data;
  const created = profile ? catalog.created(profile.address) : [];
  const held = profile ? catalog.held(profile.address) : null;
  const collections = profile
    ? catalog.collectionsForProfile(profile.address)
    : [];
  const stamps = view === "created"
    ? created
    : held?.map((entry) => entry.stamp) ?? [];
  const path = profile
    ? `/wallet/${encodeURIComponent(profile.address)}`
    : "/search";
  const back = `${path}?${new URLSearchParams({ view, page: String(page) })}`;
  const quantities = view === "held" && held
    ? Object.fromEntries(held.map((entry) => [entry.stamp.id, entry.quantity]))
    : undefined;
  return (
    <Page title={`${profile?.username ?? "Public profile"} · Stampchain`}>
      <div class="page-shell catalog-shell">
        <CatalogHeading
          eyebrow="Public profile"
          title={profile?.username ?? "Public address"}
          description="Explore created artwork and example holdings from a public address."
        />
        {dataMode === "live"
          ? <CatalogUnavailable />
          : !profile
          ? (
            <section class="catalog-empty">
              <h2>Profile not found in this sample</h2>
              <p>Search a username or address included in the demo.</p>
              <a class="button" href="/search">Search profiles</a>
            </section>
          )
          : (
            <>
              <p class="mono profile-address">{profile.address}</p>
              {profile.bio && <p class="catalog-empty">{profile.bio}</p>}
              <CatalogNotice />
              <dl class="catalog-stats">
                <div>
                  <dt>Created in sample</dt>
                  <dd>{created.length}</dd>
                </div>
                <div>
                  <dt>Held stamp types in sample</dt>
                  <dd>{held === null ? "Unavailable" : held.length}</dd>
                </div>
                <div>
                  <dt>Sample collections</dt>
                  <dd>{collections.length}</dd>
                </div>
              </dl>
              <nav class="catalog-tabs" aria-label="Profile views">
                <a
                  href="?view=created&page=1"
                  aria-current={view === "created" ? "page" : undefined}
                >
                  Created
                </a>
                <a
                  href="?view=held&page=1"
                  aria-current={view === "held" ? "page" : undefined}
                >
                  Held
                </a>
              </nav>
              <section class="catalog-section" aria-labelledby="profile-stamps">
                <h2 id="profile-stamps">
                  {view === "created" ? "Created stamps" : "Demo holdings"}
                </h2>
                {view === "held" && held === null
                  ? (
                    <p class="catalog-empty">
                      Holdings are unavailable for this sample address. This
                      does not mean the address holds no stamps.
                    </p>
                  )
                  : (
                    <>
                      <StampResults
                        stamps={pageItems(stamps, page)}
                        back={back}
                        quantities={quantities}
                        emptyMessage={page > 1
                          ? "No sample stamps on this page. Return to a previous page."
                          : view === "created"
                          ? "No created stamps recorded in this sample."
                          : "This fixture records an empty holding list."}
                      />
                      <CatalogPagination
                        path={path}
                        page={page}
                        total={stamps.length}
                        params={{ view }}
                        label="Profile stamps"
                      />
                    </>
                  )}
              </section>
              {collections.length > 0 && (
                <section
                  class="catalog-section"
                  aria-labelledby="profile-collections"
                >
                  <h2 id="profile-collections">Sample collections</h2>
                  <ul class="catalog-result-list">
                    {collections.map((collection) => (
                      <li key={collection.id}>
                        <a
                          class="catalog-result"
                          href={`/collection/${
                            encodeURIComponent(collection.id)
                          }`}
                        >
                          <strong>{collection.name}</strong>
                          <small>
                            {collection.stampIds.length} sample stamps ↗
                          </small>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
      </div>
    </Page>
  );
}
