# Isolated explorer proof

Two server-rendered page types: `/explorer` and `/stamp/:id`. This is a bounded
art-stamp browsing proof, not a first-release route commitment. Token browsing
remains a later release decision.

Use **Deno 2.6.9**, Fresh 1.7.3 and the package's committed lockfile. Run
commands from this directory, not the legacy application root:

```sh
deno task check
deno task test
deno task build
deno task start
```

Open `http://127.0.0.1:8007/explorer`. The initial URL explicitly selects PNG;
format buttons allow combinations such as PNG + JPEG, with HTML as another
option. All clears the selection; Apply filters submits the selected formats as
one upstream OR filter before pagination. Type, formats, global transaction
order and page are URL-owned. Detail links carry a whitelisted return query.
Browser Back/Forward and the explicit return link retain it. Invalid query
values normalize to documented defaults; the forward link cannot wrap at the
supported page limit.

`EXPLORER_DATA_MODE=fixture deno task start` uses the sixteen captured source
records, eight verified original PNGs and four verified HTML-preview PNGs.
Fixture images not present in the sample show a placeholder. No credentials or
network requests are needed for fixture data/media; the Deno module cache must
already be populated by the build.

The production start task denies filesystem writes, subprocesses and system
access. Runtime network access is limited to the local listener and
`stampchain.io:443`. Environment reads are explicit framework/config names. It
does not read a `.env` file. Data defaults to live public reads. Every JSON
response has a 2 MiB bound and a 10-second deadline; integer quantity lexemes
retain their precision. Source freshness stays unknown, with retrieval time and
reported indexed block shown separately. Source errors remain distinct from
empty data or a valid zero.

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

Only the two pages, bounded media, local static assets and Fresh assets are
allowed; mutation methods and legacy routes fail before dispatch. The restricted
manifest has no islands. The only reused legacy runtime module is the pure stamp
constants leaf; the logo is copied from the existing branding. All pages carry
noindex and restrictive security headers. Local DOM performance observations
stay in attributes; they are never transmitted or persisted by the app.

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
deno run --frozen --allow-read=./fresh.gen.ts --allow-net=NAME.onrender.com:443 scripts/check-hosted-capabilities.ts https://NAME.onrender.com COMMIT_SHA
```

Its 32 route/method cases, three media cases, source identity, response-size
limits, security headers and live source checks are remote evidence. The local
manifest inventory and injected parser cases are explicitly labelled as local.
Warm the service separately before running the 15-second request deadline; this
checker does not measure Render's idle wake-up.

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
