# Explorer proof: delivery evidence

Updated 4 November 2026. The working temporary public preview is
[the explorer](https://hottest-position-turbo-patients.trycloudflare.com/explorer),
using a Cloudflare Quick Tunnel over HTTP/2. It forwards to the production-built
proof on the local Mac and lasts only while its server and tunnel processes run.
It requires no account or card. Render setup was canceled under the owner's
no-card requirement; the dashboard was checked and showed zero services.
Independent hosting, hosted artifact rollback, and human acceptance remain open;
the temporary public preview does not complete E04.

3 November 2026. The owner authorized continuation of E01–E04 and requested the
existing dark style with a condensed layout. That design direction is
implemented. Final owner task acceptance and the unfamiliar human review have
not been recorded.

## Delivery state

| Item                 | State                                      | Evidence / limit                                                                                                                                                                                                                  |
| -------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E01 option check     | Local probes and decision delivered        | [Decision](E01.md), [import graph](evidence/reuse-imports.json), [live contracts](evidence/live/data-contract.md). Staging access, service agreement, quotas, costs and operational support remain unverified.                    |
| E02 two-page slice   | Implemented; local browser checks recorded | Dark compact list/detail, URL-owned type/format/order/page, canonical identity, explicit Back, failure states, fixtures. Desktop/mobile captures and observations in `evidence/browser/`. Human and final acceptance remain open. |
| E03 live integration | Implemented and sampled                    | Real adapter comparison, PNG body/decoding evidence, bounded JSON/media and protocol-pinned list queries. A sampled dataset does not establish complete indexer correctness or media coverage.                                    |
| E04 deployed proof   | Temporary public review verified; E04 open | Public HTTPS route/header/media checks and browser journeys pass through the temporary proxy. Independent deployment, provider artifacts, staged rollback and human acceptance remain unverified.                                 |

## Source and code changes

Reviewed upstream baseline is `7e3cd554b44302f9c07dc6c8c557ed63a6520294`.
Initial application revision is `4ff242c9a4d6c27878cfaec5c8d7253fcd8a52bf`,
pushed to
[the owner fork proof branch](https://github.com/arwyn6969/BTCStampsExplorer/tree/codex/explorer-proof).
Implementation is isolated on `codex/explorer-proof`, using the application
repository rather than its parent. Only the three planning documents were copied
from the dirty checkout; the original application changes are intact.

Deployment preparation commit `31ff31698d18cd40f6d3380c36f281353115aefc` adds
source-revision and data-mode response headers, full revision enforcement and a
deterministic Fresh build identity in Docker, a Dockerfile-specific context
allowlist, and a separate hostname-restricted hosted checker. Local package
checks, the original 25 focused tests, three checker-safety tests, and
repository format/lint checks pass. Linux Docker build/start remains unverified.
The original archive and browser records below refer to the earlier application
revision and do not establish evidence for a hosted version of this follow-up.

The prepared source `31d81df8de44a0357c6aba0f681b7434203fda16` also has an
updated local archive: 85,784 bytes, SHA-256
`a02c5c33af3c77010485b71b2e39e68ba54391a1b85890ac0f38baacd27c4a6b`, Fresh build
ID `9daedd9b1ee1b716192c035b1535db9499625722`. All 48 inventory files were
verified after extraction; the Docker context allowlist is included. The
extracted artifact cold-started with a cleared environment and outbound network
permission denied. Its 32 fixture capability cases and source/data-mode headers
pass. See [preparation record](evidence/render-preparation.json) and
[restored check](evidence/capabilities-restored-fixture-31d81df.json). This is
local artifact evidence. That same restored artifact now serves the temporary
public preview, with source revision and live-data headers verified there.
Independent hosting, staged rollback and human acceptance remain open.

The new `explorer/` package contains one restricted Fresh manifest and entry
point, two page types, one typed read adapter, query normalization, bounded
static raster serving, explicit request allowlists, deterministic fixtures,
focused tests and packaging/capability scripts. It reuses the pure stamp
constants leaf and existing logo. It does not inherit the legacy layout, route
manifest, wallet/signing/broadcast code, administrative handlers or backend
credentials. No search, address, collection or token page is implemented.

The initial page selects PNG through an explicit redirect, with an explanation
that All formats includes placeholders. This is a useful static-art proof scope,
not approval to exclude tokens from a later browsing release. The live adapter
requests `ident=STAMP,SRC-721` because unrestricted source lists include SRC-20
records whose stamp-detail endpoint returns 404. The source gap and correction
are preserved in [raw evidence](evidence/live/list-detail-contract-gap.md).

## Checks run

- Deno 2.6.9; Fresh 1.7.3; Preact 10.27.2; package lockfile enabled and frozen
  for production/check/test commands.
- Package formatting, lint, type check and production build pass.
- Twenty-five focused tests pass: 13 adapter, 10 media, 2 query tests. Four
  hosted checker safety/regression tests also pass, for 29 focused tests in
  total.
- Repository `check:fmt` passes (702 files at that run) and `check:lint` passes.
  Initial sandbox-only attempts could not fetch inherited Node typings; the
  permitted network retry completed. No inherited source repair was needed.
- A later accidental whole-repository `deno task check` passed root formatting
  and lint, then could not resolve an unrelated legacy `js-beautify` import in
  the sandbox. No legacy repair was attempted. The correct explorer package
  check, including its types, and the four checker tests passed afterward; a
  successful whole-repository type check is not claimed.
- The production server cold-starts from a cleared environment and a built
  snapshot, with no database, Redis, AWS-write or administrative credentials.
  Runtime has no write, subprocess or system permission. Selected framework
  environment reads are explicit, and outbound request destinations are fixed.
- [Local capability report](evidence/capabilities-live.json): exact seven-route
  manifest, no islands, 32 passing HTTP cases, expected 302/200/404/405
  behavior, headers and absence of generator references, active artwork frames,
  wallet controls and mutation forms. These are local production-build
  observations.
- [Independent agent review](evidence/independent-review.md) and
  [source-to-adapter comparison](evidence/source-adapter-comparison.json) pass.
  Four material integration/mapping issues were found and corrected during the
  bounded correction work; none is concealed as a successful first attempt.

The earlier `4ff242c` artifact passed all 32 capability checks in fixture mode
with outbound network permission denied, and all 32 again in live mode. The
archive was safely extracted into a different directory and cold-started without
credentials or the original checkout. Its SHA-256 inventory was checked for
every file, and a second complete packaging run produced identical bytes.
[Artifact record](evidence/artifact.json): 80,847 bytes, SHA-256
`c39b0e79d0078794a4bd47bbd4edf0b9a8f9213d3696f90ac1f56dd4a7dbafef`, Fresh build
ID `c64f227ca3bee1273bc6b19e1e0a39c313805d75`. This is a local restore
demonstration, not a staged rollback.

The first all-formats capability run reported 28/29 HTTP cases passing; its
first detail record was an unsupported SRC-20 result. That report was
overwritten by an interrupted rerun before preservation, so its original JSON is
unavailable. The subsequent bounded direct source GETs preserve the 200/404
mismatch, and the final protocol-constrained journey passes. The separate
interrupted report is retained and is not presented as the original failure.

## Browser, data and media evidence

The current public run is recorded in
[HTTP/2 capabilities](evidence/quick-tunnel/capabilities-http2.json): all 35
HTTP cases pass, including three bounded raster responses, source/live-data
headers, and the existing route/method and HTML/header boundaries. Its five
injected source-parser checks are local checks, separately labelled in that
report. The served artifact is source
`31d81df8de44a0357c6aba0f681b7434203fda16`, Fresh build ID
`9daedd9b1ee1b716192c035b1535db9499625722`.

Public browser observations cover desktop 1440×900 and mobile 390×844
filter/detail/Back/Forward journeys and oldest-first stamp zero. Those captures
include the earlier QUIC hostname. On the final HTTP/2 hostname, page two and
reload passed at 1280×720. The earlier host's page-two failure remains recorded;
it is not counted as a successful observation. No actual 200% zoom or complete
unfamiliar-human test is claimed.
[Public browser observations](evidence/quick-tunnel/browser-observations.json).

Public captures: [desktop list](evidence/quick-tunnel/desktop-list.jpg),
[desktop detail](evidence/quick-tunnel/desktop-detail.jpg),
[mobile list](evidence/quick-tunnel/mobile-list.jpg),
[mobile detail](evidence/quick-tunnel/mobile-detail.jpg), and
[final HTTP/2 preview](evidence/quick-tunnel/final-preview.jpg).

The first QUIC tunnel passed its 32 route cases, then the checker failed to
discover raster links carrying Fresh's cache query. The harness was corrected
with a regression test; the failure remains in
[first media discovery](evidence/quick-tunnel/capabilities-first-media-discovery-failed.json).
That tunnel later dropped connections with error 1033/timeouts and was stopped;
[the timeout run](evidence/quick-tunnel/capabilities-quic-timeout.json) is
retained. The replacement HTTP/2 hostname passed the complete 35-case run above.
These observations establish a temporary review path, not independent service
availability or provider cold-start performance.

Earlier local observations/captures are under `evidence/browser/`. Live
list/detail values agree with saved source records for stamps 1507273 and 0. The
fixture adapter maps all sixteen captured rows. Eight preselected PNGs were
fully decoded independently; four HTML originals were intentionally unsupported
and not fetched during sampling. Native CDN PNG bytes can differ from API base64
while preserving visible pixels, so byte identity is not asserted.

Browser checks cover the known filter/detail/Back task, Forward, explicit
return, page two, reload, copied URLs, oldest-first stamp zero, missing detail
recovery and no horizontal overflow. Limited automated DOM accessibility checks
cover language, landmarks, headings, control/link names, image alternatives and
active frames; they are not a full accessibility certification. Native-key
activation and focus/zoom limitations are recorded with the final observations.
No human completion-time improvement claim is made.

Earlier local captures: [desktop list](evidence/browser/desktop-list.jpg),
[desktop detail](evidence/browser/desktop-detail.jpg),
[mobile list](evidence/browser/mobile-list.jpg),
[mobile detail](evidence/browser/mobile-detail.jpg),
[missing media](evidence/browser/fixture-fallbacks.jpg), and
[unsupported artwork](evidence/browser/unsupported-artwork.jpg).
[Browser observations](evidence/browser/observations.json) identify the exact
committed source/build. The earlier development observations remain separate,
including an error-page heading/return-link issue that was then corrected.

Three repeated list measurements per profile are in
[performance.json](evidence/browser/performance.json): desktop LCP 856/852/668
ms at a measured CSS viewport of 1600×1000; mobile LCP 636/644/632 ms at
390×844. All observed CLS values were zero. These are unthrottled local SSR
loads against a live API in a warm module/cache environment, not hosted
cold-start, field-percentile or general capacity results. Native Return
submitted the focused filter form. The complete unfamiliar-human keyboard/focus
journey remains pending. A native zoom shortcut did not change the browser's
measured viewport, so only 800×500 reflow equivalent to 200% of the desktop
viewport was verified; actual 200% browser zoom is not claimed.

The existing-site baseline used the same already-filtered Classic PNG task and
known stamp, and browser Back retained the query. Its detail page's unrelated
latest-stamp section emitted preview-generation URLs. Navigation was stopped
after detecting them; actual dispatch/cache side effects were not established.
Do not claim that this baseline visit avoided generation requests. The new
proof's own requests and markup exclude those URLs. See
`evidence/browser/current-site-baseline.json`. This constrained agent run is not
the owner/unfamiliar-reviewer usability comparison required by the plan.

## Remaining dependencies and decision

No production deployment or merge is requested or performed. The existing AWS
scripts target production and were not used. The attempted Render setup was
canceled, and zero Render services were verified in the dashboard. The retained
[Render recipe](../../explorer/render.yaml) is optional and unapplied; it is not
the active preview. The owner requires a route without a card. No account
billing details are included here, and no card-dependent setup is an outstanding
instruction. Linux Docker build/start remains unverified.

The temporary HTTPS preview enables owner review while the local processes run.
Continue the existing bounded proof when an independently hosted target meeting
the owner's constraint is established: deploy the exact immutable artifact,
repeat capability/browser/header/performance checks there, demonstrate rollback
to a prior staged artifact, and complete owner plus unfamiliar human task
review. Do not expand routes or declare E04 complete while those conditions are
unresolved. A local archive/restart is useful evidence but cannot satisfy staged
rollback.

The 4–8 engineering-day allowance remains provisional. Evidence timestamps
describe this implementation session; they do not calibrate agent work into paid
engineering days or establish a new release estimate.
