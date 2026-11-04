# Explorer preview and staging status

Updated 4 November 2026. The current expanded demo is
[the explorer](https://boundary-nsw-cleaning-fruit.trycloudflare.com/explorer),
using an HTTP/2 Quick Tunnel to the immutable local artifact at source
`c9eff0cdee5646dd3f63450034061be08679f283`. The server runs in fixture mode,
with loopback-only runtime networking and no database, credentials or live API
access. The preview includes search, public profiles, collections, listings,
sales and transfers with explicit demo labels. All sixteen sample images are
stored locally, including four static HTML thumbnails.

The clean archive `explorer-c9eff0cdee56-9db3812b4196.tar.gz` is 456,394 bytes,
SHA-256 `9db3812b41969782198e07a1855cf502c1e405d3c69b407a407f5d66a2155c39`. All
72 inventory files and the embedded manifest were verified before running its
restored copy. Fresh build ID is `4f80a713e18f2ebffc35c28ec17b1313516d77e8`.
Artifacts and the recovered checkout now live in persistent visualization
storage rather than temporary storage. The runtime uses the already populated,
pinned Deno module cache.

The final
[public HTTP report](evidence/catalog-demo/public-capabilities-c9eff0c.json)
passes 55 cases with exact revision and fixture headers. The independent
[semantic report](evidence/catalog-demo/semantic-audit.json),
[browser observations](evidence/catalog-demo/browser-observations.json), and
[validation record](evidence/catalog-demo/validation.json) provide the remaining
review evidence. Username aliases with spaces and selected filter states were
corrected during review; the earlier failed evidence is retained.

This requires no account or card. Render was canceled and has no service to
complete. The tunnel remains temporary: the Mac, server and tunnel must stay
running. No independent host, Linux Docker build, hosted rollback, sustained
capacity, or human acceptance is claimed. E04 remains open, and live catalog
contracts remain release work. No production DNS, domain cutover or main-branch
merge has been performed.

For reproduction, use `explorer/README.md`: build with Deno2.6.9 and the full
`GITHUB_SHA`, start with the default fixture task, then start the HTTP/2 tunnel.
A new Quick Tunnel process can issue a different hostname. Use the hosted
checker with the explicit full revision and `fixture` argument. Publishing a new
link requires repeating the identity/header/media checks on that actual
hostname.

## Previous two-page proof, superseded by the expansion

The material below records earlier November4 proof runs. Its hostnames,
revisions, counts and images are historical, rather than the current demo.

Updated 4 November 2026. The working public preview is
[the explorer](https://hottest-position-turbo-patients.trycloudflare.com/explorer),
through a Cloudflare Quick Tunnel using HTTP/2. It forwards HTTPS requests to
the production-built proof running on the local Mac. The URL works only while
that server and tunnel stay running; it requires no account or card.

Render setup was canceled under the owner's no-card requirement. The dashboard
was checked and showed zero services. No Render deployment, provider artifact,
or hosted rollback is claimed. The retained Render configuration is optional and
unapplied; it is not the current preview or an instruction to add a card. No
account billing details are recorded in this document.

## Earlier served artifact and evidence

The tunnel serves the restored immutable local artifact at source revision
`911a1e5597d5d55cbd1244aec41277de31c4dd3d`, Fresh build ID
`1eac0c88692d30f5b1b314a73aa38d67299abf46`. Its clean local archive is 429,681
bytes, SHA-256
`ac20c5f315d027f472a77886b1e8afa9f4bb7fc8453bc369de7d66d992303967`; all 52
inventory files were verified after extraction.

The final public [capability report](evidence/format-buttons/capabilities.json)
passes all 35 HTTP cases, including three media checks, full source/live-data
headers, forbidden route/method checks, and HTML/security headers. The
explorer's 31 package tests and four hosted-checker safety/regression tests
pass, for 35 tests in total. Package types and the required repository
format/lint checks pass; an unrelated sandbox resolution failure does not
establish a passing full legacy-repository type check.

The latest format controls use multi-select checkbox pills, canonical comma
URLs, a sole default Apply submit button, and an All reset with a no-JavaScript
link fallback. Existing static PNG thumbnails now represent HTML stamps;
original HTML never executes and production generation endpoints are not used.
The first sampled HTML page decoded 12/12 thumbnails in the browser; four also
have
[independent decode/hash evidence](evidence/html-previews/static-preview-sample.json).
Missing thumbnails retain an unavailable fallback; complete coverage is not
claimed.

[Latest browser observations](evidence/format-buttons/browser-observations.json)
cover desktop 1440×900 and mobile 390×844 selection by Space, Apply by Enter,
detail/Back state retention, HTML list/detail, and mobile combined-format page
two/reload. PNG + JPEG excludes GIF; All clears selections. No overflow or
active frames were observed. Captures include
[desktop PNG + JPEG](evidence/format-buttons/desktop-png-jpeg.jpg),
[desktop HTML](evidence/format-buttons/desktop-html.jpg),
[HTML detail](evidence/format-buttons/html-detail.jpg),
[mobile HTML](evidence/format-buttons/mobile-html.jpg),
[mobile combined formats](evidence/format-buttons/mobile-combined.jpg), and
[desktop combined formats](evidence/format-buttons/desktop-combined.jpg). No
actual 200% browser zoom, full unfamiliar-human test, or timing improvement is
claimed.

The prior public run served source `31d81df8de44a0357c6aba0f681b7434203fda16`,
Fresh build ID `9daedd9b1ee1b716192c035b1535db9499625722`, from an 85,784-byte
archive with SHA-256
`a02c5c33af3c77010485b71b2e39e68ba54391a1b85890ac0f38baacd27c4a6b`. Its
[preparation record](evidence/render-preparation.json),
[restored fixture check](evidence/capabilities-restored-fixture-31d81df.json),
[earlier HTTP/2 report](evidence/quick-tunnel/capabilities-http2.json), and
[earlier browser observations](evidence/quick-tunnel/browser-observations.json)
remain historical evidence, rather than current-artifact acceptance.

## Earlier tunnel failures remain recorded

The earlier `creek-engagement-written-handling.trycloudflare.com` tunnel used
QUIC. Its first run passed 32 HTTP route cases, then the harness failed to find
media URLs carrying Fresh's cache query. A regression test and harness
correction address that discovery error; the
[first failure](evidence/quick-tunnel/capabilities-first-media-discovery-failed.json)
is retained. The tunnel subsequently dropped connections with error 1033 and
timeouts; its
[timeout report](evidence/quick-tunnel/capabilities-quic-timeout.json) is also
retained. It was stopped and replaced by that earlier HTTP/2 hostname. The
failed first-host page-two visit is not recorded as a pass.

## E04 still requires independent staging

A staging deployment for E04 needs an independently running, identified artifact
on a host meeting the owner's no-card constraint. The current tunnel depends on
the local Mac and its processes. It supports public review but does not prove
independent hosting, provider build/start behavior, sustained service capacity,
or a hosted rollback.

Remaining acceptance is to record the actual deployed artifact and source,
repeat capability/media/browser/header checks on that host, measure performance
with stated device/network/cache conditions, and demonstrate rollback between
two known successful staged artifacts. Owner design/task acceptance and an
unfamiliar reviewer's task result remain pending. A local archive restore or
restarting a tunnel does not satisfy staged rollback. Keep noindex/robots
exclusion and avoid production DNS or domain cutover; the preview URL is public.

The earlier archive remains historical local evidence: source
`4ff242c9a4d6c27878cfaec5c8d7253fcd8a52bf`, 80,847 bytes, SHA-256
`c39b0e79d0078794a4bd47bbd4edf0b9a8f9213d3696f90ac1f56dd4a7dbafef`, Fresh build
ID `c64f227ca3bee1273bc6b19e1e0a39c313805d75`.
[Original artifact record](evidence/artifact.json). It is not the artifact now
served through the tunnel and was never a Render deployment.

## Optional Render recipe retained, unapplied

[explorer/render.yaml](../../explorer/render.yaml) retains one Free Docker web
service in Frankfurt, owner fork `arwyn6969/BTCStampsExplorer`, explicit branch
`codex/explorer-proof`, root build context, Dockerfile `explorer/Dockerfile`,
and `/robots.txt` health checks. It requires the full selected source revision
in `EXPLORER_REVISION`; the Dockerfile checks the revision and derives Fresh's
build identity from it. The fork's older default `dev` branch is unsuitable.

Service auto-deploy is Off. Blueprint Auto Sync is a separate dashboard control;
applying a Blueprint initiates creation/deployment even with service auto-deploy
disabled. This recipe was not applied. Resume no provider setup that conflicts
with the owner's current no-card requirement.
[Blueprint controls](https://render.com/docs/infrastructure-as-code),
[Blueprint fields](https://render.com/docs/blueprint-spec).

The earlier configuration/schema validation remains a preparation result only.
It passed Render's published schema on 3 November and the full revision prompt
was revalidated on 4 November. The schema SHA-256 was
`8a3fb8da6b4f55fe686fbefa790e011d3dd7895f013f355953c572a21ab6494a`. No
successful Linux Docker build or Render runtime verification followed.
