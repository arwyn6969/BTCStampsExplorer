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
All formats exposes other records with safe placeholders. Type, format, global
transaction order and page are URL-owned. Detail links carry a whitelisted
return query. Browser Back/Forward and the explicit return link retain it.
Invalid query values normalize to documented defaults; the forward link cannot
wrap at the supported page limit.

`EXPLORER_DATA_MODE=fixture deno task start` uses the sixteen captured source
records and eight verified local PNGs. Fixture images not present in the sample
show a placeholder. No credentials or network requests are needed for fixture
data/media; the Deno module cache must already be populated by the build.

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

`/media/:asset` reads only the existing canonical static raster host/key shape.
It rejects redirects, HTML/SVG, MIME/signature mismatches, malformed structures,
animation, oversized bodies and excessive dimensions. It never requests a
preview generator. Static GIF/JPEG/WebP parsers have controlled tests; only PNG
has sampled live decoding evidence. Full decoding is left to the browser.
Missing/unsupported artwork has a text placeholder. No untrusted content or
arbitrary URL can be served from the explorer origin.

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

The Docker recipe has not been executed where a daemon is unavailable. It is not
deployment evidence. It binds inside the container using
`EXPLORER_HOST=0.0.0.0`; the local start task deliberately permits only
loopback.

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
