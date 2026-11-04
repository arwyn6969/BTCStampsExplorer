# Explorer: delivery evidence and remaining work

Updated 4 November 2026. The read-only demo now extends beyond the original
list/detail proof to search, public profiles, collections, listings and separate
sales/transfer views. These new flows use clearly labelled fixed examples and
need no database or live API connection. Their live integrations, independent
hosting, hosted rollback and human acceptance remain open. This is a reviewable
demo extension, not a completed production release.

The verified preview is
[the expanded explorer](https://boundary-nsw-cleaning-fruit.trycloudflare.com/explorer),
serving source `c9eff0cdee5646dd3f63450034061be08679f283` in fixture mode. It is
a temporary HTTP/2 tunnel to the production-built artifact on the local Mac; it
lasts only while the server and tunnel run. No account or card is needed.

The clean artifact is 456,394 bytes, SHA-256
`9db3812b41969782198e07a1855cf502c1e405d3c69b407a407f5d66a2155c39`, Fresh build
ID `4f80a713e18f2ebffc35c28ec17b1313516d77e8`. All 72 inventory files and the
embedded manifest were verified on restore. Runtime allows the loopback listener
only; all sixteen artwork files are local.

Package format/lint/types, repository format/lint, production build and 44 tests
pass. The final
[public report](evidence/catalog-demo/public-capabilities-c9eff0c.json) passes
55 HTTP cases, the local report 53, and the independent
[semantic audit](evidence/catalog-demo/semantic-audit.json) passes twelve HTTP
cases and nineteen semantic checks. It also accepts all sixteen offline media
files. [Browser observations](evidence/catalog-demo/browser-observations.json)
record public search/profile/HTML detail/Back, collection paging and reload,
listings/activity selection, and mobile390×844 flows without page overflow or
active frames. Eight observations cover the selection fix at aa90ef1; three
final c9eff0c observations verify the encoded username redirect and settled
explorer. The final gallery decodes all twelve displayed images.

Review found and corrected two defects: Fresh1 marked query-based filter links
current together, and an encoded username containing spaces failed lookup.
Earlier captures/reports remain explicitly superseded evidence. See the
[validation record](evidence/catalog-demo/validation.json) for exact scope and
remaining limits.

## Current scope and status

On 4 November the owner asked to continue the fuller read-only explorer and
supplied the existing `DATA_PLACEHOLDER_DEV` switch. It is now `true` in the
original checkout as a local, uncommitted development change. The isolated app
does not load that legacy module: its equivalent fixture mode is the default,
using captured stamp/media samples and a separate synthetic catalog of holdings,
collection membership, listings and activity. Names from captured stamp records
remain distinct from synthetic profile descriptions and market examples. Demo
holdings and prices do not establish real ownership or current availability.

| Item                                | Current state                                                                                                                    | Still needed for release                                                                   |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| E05 search                          | Fixture UX implemented: exact identifiers, usernames/address discovery, grouped native links and contextual Back                 | Verified live search contracts and partial-failure behavior                                |
| E06 profiles and collections        | Fixture UX implemented: created/held tabs, quantities, collection index/detail and paging; unavailable holdings stay unavailable | Verified live creator, holdings and collection coverage                                    |
| E07 listings and activity           | Fixture UX implemented: dedicated listings/activity and stamp-detail sections; sales and transfers kept distinct                 | Verified live fields, status, quantities, prices and source metadata                       |
| E08 compatibility and accessibility | Selected route aliases and native forms/links implemented; expanded mobile browser checks pass                                   | Final hostname/canonical metadata, sitemap policy and complete manual accessibility review |
| E09 hardening and operations        | Pinned build and offline runtime configured; expanded capability/build checks pass                                               | Independent hosting, monitoring, operational ownership and staged rollback                 |
| E10 acceptance and handover         | Demo and scope notes prepared for review                                                                                         | Owner and unfamiliar-human task acceptance and final handover                              |

The default preview runtime allows its local listener and denies outbound
network access. It has no database, Redis or administrative credentials and no
wallet connection or transaction actions. Explicit live mode retains the
existing stamp list/detail adapter; extended catalog views return a visible
unavailable state rather than mixing demo balances or events into live claims.

E04 is still open: a temporary tunnel and local artifact restore do not prove
independent deployment or hosted rollback. Render setup was canceled under the
owner's free/no-card requirement; zero services were verified at cancellation.
No card setup is outstanding. The prior tunnel was tied to local processes and
may no longer be available after an interruption. Its evidence below is
historical, not validation of the new expanded demo.

3 November 2026. The owner authorized continuation of E01–E04 and requested the
existing dark style with a condensed layout. That design direction is
implemented. Final owner task acceptance and the unfamiliar human review have
not been recorded.

## Previous owner-feedback update: source 911a1e5

The previous temporary HTTP/2 preview at
`https://hottest-position-turbo-patients.trycloudflare.com/explorer` served
source `911a1e5597d5d55cbd1244aec41277de31c4dd3d`, Fresh build ID
`1eac0c88692d30f5b1b314a73aa38d67299abf46`. Its clean local archive is 429,681
bytes, SHA-256
`ac20c5f315d027f472a77886b1e8afa9f4bb7fc8453bc369de7d66d992303967`; all 52
inventory files were verified after extraction.

At that revision, file-format checkbox pills support multiple selections and
canonical comma URLs. PNG + JPEG excludes GIF; All clears the selection. Apply
is the sole default submit button, with an ordinary All link when JavaScript is
unavailable. HTML stamps use existing static PNG thumbnails through the same
bounded raster boundary. No original HTML executes and no production preview
generator is called. Missing thumbnails retain an honest fallback. All 12
thumbnails on the sampled first HTML page decoded in the browser; four
preselected thumbnails also have independent Pillow decoding and saved hashes in
the [static preview sample](evidence/html-previews/static-preview-sample.json).
This does not establish complete HTML coverage.

At that revision, package formatting, lint, types and production build pass, as
do repository format/lint checks. Its suite passes 31 package tests plus four
checker safety/regression tests, 35 targeted tests in total. The
[new-revision capability report](evidence/format-buttons/capabilities.json)
passes the baseline 35 HTTP cases. Desktop 1440×900 and mobile 390×844 checks
cover Space selection, Apply via Enter, and detail/Back selection retention.
HTML list/detail previews work, including stamp 1505513; the mobile PNG + JPEG +
HTML combination preserves page two and reload. No overflow or active frames
were observed. See
[previous browser observations](evidence/format-buttons/browser-observations.json),
[desktop PNG + JPEG](evidence/format-buttons/desktop-png-jpeg.jpg),
[desktop HTML](evidence/format-buttons/desktop-html.jpg),
[HTML detail](evidence/format-buttons/html-detail.jpg),
[mobile HTML](evidence/format-buttons/mobile-html.jpg),
[mobile combined formats](evidence/format-buttons/mobile-combined.jpg), and
[desktop combined formats](evidence/format-buttons/desktop-combined.jpg).

## Initial proof delivery state

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

The earlier prepared source `31d81df8de44a0357c6aba0f681b7434203fda16` has a
updated local archive: 85,784 bytes, SHA-256
`a02c5c33af3c77010485b71b2e39e68ba54391a1b85890ac0f38baacd27c4a6b`, Fresh build
ID `9daedd9b1ee1b716192c035b1535db9499625722`. All 48 inventory files were
verified after extraction; the Docker context allowlist is included. The
extracted artifact cold-started with a cleared environment and outbound network
permission denied. Its 32 fixture capability cases and source/data-mode headers
pass. See [preparation record](evidence/render-preparation.json) and
[restored check](evidence/capabilities-restored-fixture-31d81df.json). This is
historical local artifact evidence. That artifact served the earlier temporary
public preview and has been superseded by the revision recorded above.
Independent hosting, staged rollback and human acceptance remain open.

The initial `explorer/` package contained one restricted Fresh manifest and
entry point, two page types, one typed read adapter, query normalization,
bounded static raster serving, explicit request allowlists, deterministic
fixtures, focused tests and packaging/capability scripts. The 4 November demo
extension adds the public browsing routes described above. Both retain the pure
stamp-constants leaf and existing logo without inheriting the legacy layout,
full route manifest, wallet/signing/broadcast code, administrative handlers or
backend credentials. Token pages remain unimplemented.

The initial page selects PNG through an explicit redirect, with an explanation
that All formats includes placeholders. This is a useful static-art proof scope,
not approval to exclude tokens from a later browsing release. The live adapter
requests `ident=STAMP,SRC-721` because unrestricted source lists include SRC-20
records whose stamp-detail endpoint returns 404. The source gap and correction
are preserved in [raw evidence](evidence/live/list-detail-contract-gap.md).

## Historical proof checks

- Deno 2.6.9; Fresh 1.7.3; Preact 10.27.2; package lockfile enabled and frozen
  for production/check/test commands.
- Package formatting, lint, type check and production build pass.
- The latest 31 package tests and four hosted checker safety/regression tests
  pass, for 35 targeted tests. Earlier 25-package-test and 29-total-test results
  describe the prior artifacts, before format buttons and HTML thumbnails.
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

The earlier public run is recorded in
[HTTP/2 capabilities](evidence/quick-tunnel/capabilities-http2.json): all 35
HTTP cases pass, including three bounded raster responses, source/live-data
headers, and the existing route/method and HTML/header boundaries. Its five
injected source-parser checks are local checks, separately labelled in that
report. Its served artifact was source
`31d81df8de44a0357c6aba0f681b7434203fda16`, Fresh build ID
`9daedd9b1ee1b716192c035b1535db9499625722`.

Earlier public browser observations cover desktop 1440×900 and mobile 390×844
filter/detail/Back/Forward journeys and oldest-first stamp zero. Those captures
include the earlier QUIC hostname. On the final HTTP/2 hostname, page two and
reload passed at 1280×720. The earlier host's page-two failure remains recorded;
it is not counted as a successful observation. No actual 200% zoom or complete
unfamiliar-human test is claimed.
[Public browser observations](evidence/quick-tunnel/browser-observations.json).

Earlier public captures: [desktop list](evidence/quick-tunnel/desktop-list.jpg),
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

Temporary HTTPS previews enable owner review while their local processes run.
Complete the deployment proof when an independently hosted target meeting the
owner's constraint is established: deploy the exact immutable artifact, repeat
capability/browser/header/performance checks there, demonstrate rollback to a
prior staged artifact, and complete owner plus unfamiliar human task review. The
owner separately authorized the 4 November fixture-based route extension while
those conditions remain unresolved. It does not complete E04. A local
archive/restart is useful evidence but cannot satisfy staged rollback.

The 4–8 engineering-day allowance remains provisional. Evidence timestamps
describe this implementation session; they do not calibrate agent work into paid
engineering days or establish a new release estimate.
