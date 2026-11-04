# Isolated explorer preview

A read-only Bitcoin Stamps explorer with a complete demo browsing journey. The
owner authorized extending the original two-page proof with search, public
profiles, collections, listings and activity using dummy data. Live-release
acceptance and token browsing remain separate decisions.

Use **Deno 2.6.9**, Fresh 1.7.3 and the package's committed lockfile. Run
commands from this directory, not the legacy application root:

```sh
deno task check
deno task test
deno task build
deno task start
```

Open `http://127.0.0.1:8007/explorer`. The default start task uses **fixed demo
fixtures**, with outbound network permission denied. It needs no database,
credentials or API access after dependencies are cached by the build.

The preview includes:

- `/explorer` and `/stamp/:id`: multi-format buttons, global sort/paging,
  creation provenance, existing static HTML thumbnails and related demo records.
- `/search`: exact stamp number, CPID or creation transaction, plus public
  username/address and collection discovery within the fixed sample.
- `/wallet/:address`: public creator/address profiles, created/held views and
  exact example holding quantities. Known username aliases redirect to
  addresses.
- `/collections` and `/collection/:id`: filtered collection index, memberships,
  creator links and paged stamp grids. `/collection` redirects to the index.
- `/marketplace`: paged example listings with status, per-unit BTC prices,
  quantity, seller and timestamp.
- `/activity`: separate sale and transfer records, participants and quantities;
  unknown sale prices remain unavailable, while transfer prices are
  inapplicable.
- `/help`: visible preview scope and remaining live-release work.

There are sixteen captured stamp records and sixteen locally stored static
images (twelve originals and four HTML-preview PNGs). Usernames on captured
records are source display labels. Biographies, holdings, collection membership,
listings and activity are synthetic review examples. Their exact provenance is
recorded in `fixtures/catalog.json`; sample market transaction hashes are shown
as text, never linked to real chain records. This is not a current ownership or
market availability service. Empty, unknown and zero remain distinct.

GET forms and native links own URL state. Format buttons allow combinations such
as PNG + JPEG while excluding GIF. Detail Back links preserve explorer filters
or a validated local search/profile/collection context. Profiles and collections
have useful missing/empty states. No client-side search requests or
stale-response race are introduced.

The original app's local `DATA_PLACEHOLDER_DEV` switch was set to `true` at the
owner's request in the original checkout, outside this proof branch's commit.
The isolated preview does not import that legacy module or the rich legacy
fixture runtime; it uses `EXPLORER_DATA_MODE=fixture`, which is now the default.
The pure catalog shares the adapter's stamp normalization and has no IO.

`deno task start:live` explicitly permits the original public stamp adapter to
read `stampchain.io:443`. Search, profiles, collections and market pages return
503 unavailable views in live mode until their real read contracts are connected
and checked; synthetic data is never silently mixed into a live view. The Docker
review image also defaults to fixture mode and permits only its listener.

Runtime filesystem writes, subprocesses and system access are denied.
Environment reads are explicit framework/config names; no `.env` is read. In
explicit live stamp mode, JSON responses have a 2 MiB bound and ten-second
deadline. Integer quantity lexemes retain their precision. Source freshness
stays unknown, with retrieval time and indexed block displayed separately.
Source errors remain distinct from empty data or a valid zero.

The adapter requests `ident=STAMP,SRC-721`: unrestricted source lists include
SRC-20 records that the stamp-detail endpoint rejects. It does not filter a live
page client-side or silently report the unrestricted total as art-stamp
coverage.

`/media/:asset` reads only the existing canonical static raster host/key shapes.
HTML stamps use `preview-{id}.png`, resolving only to the existing static
`https://stampchain.io/stamps/previews/{id}.png` file. A missing thumbnail fails
visibly; it never invokes preview generation or runs the HTML artwork. The
boundary rejects redirects, HTML/SVG bodies, MIME/signature mismatches,
malformed structures, animation, oversized bodies and excessive dimensions. It
never requests a preview generator. Static GIF/JPEG/WebP parsers have controlled
tests; only PNG has sampled live decoding evidence. Full decoding is left to the
browser. Missing/unsupported artwork has a text placeholder. No untrusted
content or arbitrary URL can be served from the explorer origin.

Only the sixteen manifest routes (including error/layout/middleware entries),
bounded media, local static assets and Fresh assets are allowed. Mutation
methods and transaction/admin/generator routes fail before dispatch. The
restricted manifest has no islands. The only reused legacy runtime module is the
pure stamp constants leaf; the logo is copied from the existing branding. All
pages carry noindex and restrictive security headers. Local DOM performance
observations stay in attributes; they are never transmitted or persisted by the
app.

## Capability checks and packaging

With the production server running:

```sh
deno run --allow-read=./fresh.gen.ts --allow-net=127.0.0.1:8007 scripts/check-capabilities.ts
```

From the repository root, the Dockerfile uses an allowlisted context:

```sh
docker build -f explorer/Dockerfile --build-arg EXPLORER_REVISION=COMMIT_SHA -t explorer-proof:COMMIT_SHA .
docker run --rm --read-only -p 127.0.0.1:8007:8007 explorer-proof:COMMIT_SHA
```

Replace `COMMIT_SHA` with the full lowercase 40-character source revision. The
build refuses a missing/invalid revision or a mismatched Render commit, sets
Fresh's build identity from that revision, and records it in the image label and
build log. `Dockerfile.dockerignore` includes only proof inputs and the reused
constants file. Every application response exposes the revision and data mode
through `X-Explorer-Revision` and `X-Explorer-Data-Mode`.

The Docker recipe has not been executed where a daemon is unavailable. It is not
deployment evidence. It binds inside the container using
`EXPLORER_HOST=0.0.0.0`; the local start task deliberately permits only
loopback.

For an owned Render staging service, use the separate hosted checker. It
requires an exact HTTPS `onrender.com` origin and the deployed full revision; it
rejects the production hostname before dispatching requests:

```sh
deno run --frozen --allow-read=./fresh.gen.ts --allow-net=NAME.onrender.com:443 scripts/check-hosted-capabilities.ts https://NAME.onrender.com COMMIT_SHA fixture
```

Route/method cases, media validation, source identity, response-size limits,
security headers and the explicitly selected data mode are remote evidence. The
local manifest inventory and injected parser cases are explicitly labelled as
local. Warm the service separately before running the 15-second request
deadline; this checker does not measure Render's idle wake-up.

For a temporary, no-account review link, Cloudflare Quick Tunnels can forward
the local restricted Deno server without changing the application runtime. Start
the server, create an empty YAML config containing `{}`, then run:

```sh
TUNNEL_TRANSPORT_PROTOCOL=http2 cloudflared tunnel --config /absolute/empty-config.yml --no-autoupdate --url http://127.0.0.1:8007 --metrics 127.0.0.1:0 --management-diagnostics=false
```

The public URL is temporary and depends on this computer, the server and the
tunnel staying online. It provides no uptime guarantee and does not establish an
independently hosted E04 artifact or staged rollback. The checker also accepts
an exact HTTPS `NAME.trycloudflare.com` origin and labels its results as a local
server reached through a public tunnel. Use that exact hostname in the network
permission above. The initial QUIC connection dropped during review; the
replacement HTTP/2 tunnel passed all 35 HTTP cases.

After committing and building the exact source, create an immutable local
archive:

```sh
deno run --allow-read=.. --allow-run=git --allow-write=/private/tmp/stampchain-explorer-artifacts scripts/package.ts /private/tmp/stampchain-explorer-artifacts
```

The archive includes a SHA-256 inventory, source revision, source-state record
and Fresh build ID. It excludes the legacy server, credentials, Git metadata and
unrelated files. Source state must be empty to call it a committed-source
artifact. Runtime imports need the locked Deno cache; this is documented rather
than presented as a self-contained offline image.

For an actual staging rollback, retain the prior **staged** immutable artifact
and switch the staging deployment back to that exact digest/revision, then run
the capability and browser journey checks there. Local archive extraction or
restart does not establish staging rollback. Do not run the legacy production
deployment scripts for this proof.

See `../documentation/rebuild/STATUS.md` for checks actually run, captures,
source comparisons, known limitations and remaining staging/human acceptance.
