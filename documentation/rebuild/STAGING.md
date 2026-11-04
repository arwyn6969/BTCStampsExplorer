# Explorer preview and staging status

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

## Current served artifact and evidence

The tunnel serves the restored immutable local artifact at source revision
`31d81df8de44a0357c6aba0f681b7434203fda16`, Fresh build ID
`9daedd9b1ee1b716192c035b1535db9499625722`. Its existing local archive is 85,784
bytes, SHA-256
`a02c5c33af3c77010485b71b2e39e68ba54391a1b85890ac0f38baacd27c4a6b`.
[Local preparation and restore record](evidence/render-preparation.json),
[restored fixture check](evidence/capabilities-restored-fixture-31d81df.json).

The final public
[HTTP/2 capability report](evidence/quick-tunnel/capabilities-http2.json) passes
all 35 HTTP cases, including three media checks, full source/live-data
headers, forbidden route/method checks, and HTML/security headers. Its five
injected source-parser checks are explicitly local checks. The explorer's 25
focused tests and four hosted-checker safety/regression tests pass, for 29 tests
in total. Package types and the required repository format/lint checks pass; an
unrelated sandbox resolution failure does not establish a passing full
legacy-repository type check.

[Browser observations](evidence/quick-tunnel/browser-observations.json) cover
list/filter/detail/Back/Forward and oldest-first stamp zero at desktop 1440×900
and mobile 390×844 on the earlier tunnel. The final HTTP/2 hostname also passed
page two and reload at 1280×720. Captures are available for
[desktop list](evidence/quick-tunnel/desktop-list.jpg),
[desktop detail](evidence/quick-tunnel/desktop-detail.jpg),
[mobile list](evidence/quick-tunnel/mobile-list.jpg),
[mobile detail](evidence/quick-tunnel/mobile-detail.jpg), and the
[final preview](evidence/quick-tunnel/final-preview.jpg). No actual 200% browser
zoom, full unfamiliar-human test, or timing improvement is claimed.

## Earlier tunnel failures remain recorded

The earlier `creek-engagement-written-handling.trycloudflare.com` tunnel used
QUIC. Its first run passed 32 HTTP route cases, then the harness failed to find
media URLs carrying Fresh's cache query. A regression test and harness
correction address that discovery error; the
[first failure](evidence/quick-tunnel/capabilities-first-media-discovery-failed.json)
is retained. The tunnel subsequently dropped connections with error 1033 and
timeouts; its
[timeout report](evidence/quick-tunnel/capabilities-quic-timeout.json) is also
retained. It was stopped and replaced by the current HTTP/2 hostname. The failed
first-host page-two visit is not recorded as a pass.

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
