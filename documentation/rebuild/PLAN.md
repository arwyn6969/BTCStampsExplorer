# Explorer renewal: delivery plan

Status: proposed implementation plan, revised after adversarial self-review. No
rebuild, production change, merge, or new fork has been performed by this
review. Prepared 3 November 2026. The owner selected **explorer and browsing
first**. Detailed evidence is in [PR reconciliation](PR_RECONCILIATION.md).
Revised 3 November 2026 after a further strategy challenge: test reuse versus
extraction before selecting the implementation, compare the result with today's
user journey, and decide at the proof cap. This is a decision-ready plan, not
proof of delivery feasibility. The detailed gates below support one bounded
experiment; they are not additional discovery projects.

## Recommendation

Deliver a better explorer under the owner's release control, reusing working
data services and code wherever that reduces delivery and maintenance cost. An
independently deployable read-only surface remains the preferred target; whether
it needs a separate application has not been established. Compare a minimal
isolation of the existing explorer with an extracted frontend before committing
to a long-lived architectural split.

The previous recommendation committed to a separate frontend too early. Verified
defects establish a need for improvement, not that a rewrite is the cheapest
solution. Preserve working protocol knowledge, identifiers, data adapters, and
useful recent fixes. Repair urgent risks in the existing application on a
separate track. A complete wallet/tooling rewrite, database rewrite, or
framework migration is not a prerequisite for a better explorer.

Use the existing owner-controlled fork,
[arwyn6969/BTCStampsExplorer](https://github.com/arwyn6969/BTCStampsExplorer).
Its default branch is `dev`; start an implementation branch from an explicitly
reviewed upstream `main` commit, not from that default without inspection. The
upstream baseline examined was `7e3cd554b44302f9c07dc6c8c557ed63a6520294`.
Refresh this baseline before starting.

A fork provides source control, not independent database access, preview
hosting, deployment credentials, API capacity, backups, or operational support.
Those dependencies must be established before promising an independent launch.
The target is independent frontend deployment using shared data services;
independent operation of the data/indexer is a different, unestimated project.
Repository ownership is separate from architecture: the fork can host small
upstream-compatible changes or an extracted app. It need not become a permanent
product divergence.

## Execution and decision gates

| Gate                            | Evidence produced                                                                                                           | Decision                                                                                               |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| E01: baseline and option check  | Current task baseline, small contract/media sample, dependency map, build viability, and reuse-versus-extraction comparison | Select the least costly approach that satisfies the deployment boundary; record unverified assumptions |
| E02-E03: working two-page slice | One design on desktop/mobile, fixtures and live records, safe existing previews, recorded comparison with today's journey   | Fix bounded issues within the proof allowance; do not add routes                                       |
| E04: deployed proof             | Exact staged revision, capability checks, task results, media coverage, actual effort, and simple rollback evidence         | Continue, change the scope with a bounded allowance, or stop/re-scope                                  |
| After proof: release commitment | Owner-selected route set, verified remaining contracts, operational owner, and estimate built from remaining tickets        | Agree a release commitment only for that scope                                                         |

The first 1-2 focused engineering days belong to E01 and are included in the
existing 4-8-day proof allowance. They are not an additional project. Do not
build two polished applications or two hosting pipelines to select an approach.

## Reuse versus extraction: first decision

There are verified reuse seams at reviewed upstream commit
`7e3cd554b44302f9c07dc6c8c557ed63a6520294`:

- [ExplorerContent accepts data through props](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/islands/content/ExplorerContent.tsx#L13).
- [The explorer composes its header and content separately](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/routes/explorer/index.tsx#L642).
- [Stamp loading](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/routes/stamp/%5Bid%5D.tsx#L60)
  is separate from
  [page rendering](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/routes/stamp/%5Bid%5D.tsx#L265).
- [The app supports bypassing its shared layout](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/routes/_app.tsx#L33).

There is also coupling: the
[stamp card imports its purchase tool](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/islands/card/StampCard.tsx#L9),
the app mounts shared modals, and the full route manifest exposes business-write
and admin handlers. The cost of removing these dependencies is unmeasured.

| Candidate                                   | What E01 must establish                                                                                                                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A: renew and isolate existing explorer code | How much can be reused with a lean layout and restricted build/runtime entry point, which imports still pull in unrelated capabilities, and whether the production build can enforce the boundary |
| B: extract a thin frontend over read APIs   | Availability of the required API and static-media contracts, adapter work, deployment setup, lost behavior, and ongoing maintenance obligations                                                   |

Start with a small reuse/import/build probe. Run a minimal extraction probe only
to answer a concrete blocker. Use the same proposed UI and sample records for
both; do not compare a polished new mockup with an unmodified old interface.
Record observed work, remaining changes, data fidelity, deployment control,
operational cost dependencies, and responsibility for keeping upstream fixes.
Unknowns remain unknown; do not invent numerical scores to select a winner.

Prefer reuse if both satisfy the requirements at similar effort. Choose
extraction if measured coupling, deployment restrictions, or maintenance costs
justify it. If neither can satisfy the boundary inside the allowance, return a
specific blocker and a smaller option. Improving a route inside the full legacy
server does not make that server read-only. Such an incremental production fix
is a legitimate alternative scope, but must be labelled and assessed as such; it
cannot be reported as completion of the isolated explorer proof.

## Decisions and boundaries

Confirmed by the owner:

- Prioritize explorer and browsing for an independent first release.
- Reconcile the review with existing PRs and issues before duplicating work.
- Prefer demonstrable delivery and a streamlined plan over a speculative
  promise.

Recommended scope assumptions, to be tested during the first milestone:

- The technical proof focuses on stamp browsing. The owner has not yet chosen
  whether release one also includes existing SRC-20 token browsing. Read-only
  token browsing does not require wallet connection or transaction tools.
- Preserve canonical stamp, collection, and address URLs where practicable.
- Keep the current data/indexing services behind a small typed read adapter.
- Start by evaluating the existing Deno/Fresh stack for the proof. Verify its
  runtime and deployment viability in E01. A framework change needs an evidenced
  benefit and a separate estimate; it is not an aesthetic choice.
- Staging is separate from production. A release decision follows acceptance
  evidence and an operational handover.

## Candidate release inventory

These are proposed surfaces, not an owner-approved feature contract. E01 records
the intended audience and primary tasks. Final route coverage is settled after
the proof demonstrates data access and the owner has reviewed the design.

| Surface                | First release behavior                                                                                    | Acceptance boundary                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Landing and explorer   | Clear entry to stamps, recent activity, filtering, sorting, pagination                                    | State is encoded in URLs and survives Back, Forward, reload, and sharing          |
| Search                 | Exact stamp identifiers and address lookup; creator/name discovery conditional on verified service access | Native links, keyboard access, stale responses discarded, partial failure visible |
| Stamp detail           | Identity, creator, provenance, media, available listing/activity data                                     | Canonical values match source records; unavailable data is not zero               |
| Public address/creator | Read-only identity, created/held stamps where supported by the existing service                           | No connection prompt; pagination and missing data handled explicitly              |
| Collections            | Collection index and detail with stamp browsing                                                           | Reuse existing data contracts; no collection creation or management               |
| Marketplace browsing   | Available listings integrated into stamp browsing/detail                                                  | No purchase, listing, signing, or settlement controls in this release             |
| Help and status        | Short explanations, useful errors, data freshness/source information                                      | Unsupported actions are explained; no misleading disabled action funnels          |

Existing routes include `/explorer`, `/stamp/[id]`, `/wallet/[address]`,
`/collection`, `/collection/[id]`, and `/marketplace`. Preserve or deliberately
map these during the route inventory; do not silently break inbound links. The
read-only public address page need not inherit wallet-connection machinery.

Unresolved release choice: stamp-focused browsing versus stamps plus existing
SRC-20 token browsing. The narrower estimate assumes stamp-focused browsing;
token coverage needs additional contracts, screens, and QA. Do not describe this
as a new protocol or silently exclude it based on the owner's broad priority.

Deferred from the proof and proposed browsing release: wallet connection,
signing, trading actions, minting, sending, deployment, uploads, authoring,
account management, new protocols, and a replacement indexer. Full portfolio
valuation and dedicated block/transaction pages also need separate scoping.
Activity/provenance rows must still expose the actual operation and transaction
identifier, parties, block/time, and source-supported status, with a working
link to an agreed existing detail service where native detail pages are
deferred.

Creator-name search depends on the endpoint introduced by draft #1321. Its
deployment on the intended data service has not been established. Require a
verified read contract or approved data integration before including it; exact
stamp/address lookup can ship independently. Apply the same contract check to
collection coverage and listing/activity enrichment. A PR frontend alone does
not supply its backend.

## Product and deployment decisions

Within E01/E02, produce representative desktop/mobile list and detail screens
using realistic content. Record primary audience/tasks, navigation, art-grid
versus activity-table hierarchy, and visible search scope. Before changing the
interface, record the current journey: filter a representative set, open a known
stamp, identify its creator/provenance, and return. Record completion, wrong
turns, elapsed time, and lost state. Repeat the same task on the prototype with
the owner and a reviewer unfamiliar with its implementation.

Pass when both can complete the task without coaching, identify the correct
information, and recover the same filter/sort/page state. Ask what is clickable,
what the view contains, and what information is unavailable. Resolve issues that
block the task or materially mislead before expanding routes. Record timings as
directional evidence, not statistically proven improvement. If a human reviewer
is unavailable, record that limitation; an agent review does not replace it.
Allow one short review and a bounded correction pass within the proof allowance.
This is a working prototype, not a prolonged design project.

The proof uses an isolated staging hostname with no production cutover and is
excluded from search indexing. Before a public release, choose one destination:

- A separate site can preserve path shapes, but needs its own canonical-domain
  policy and clear links to the existing service.
- A replacement on the existing domain needs verified control of its routing, a
  redirect/compatibility map, a cutover plan, and rollback. Preserving paths on
  a different hostname does not preserve the original canonical URLs.

E01 records the data service owner, permission/access arrangements, endpoint and
pagination contracts, quotas, cache/freshness behavior, expected hosting/service
costs, and support responsibility. A successful sample proves connectivity, not
service continuity. Mark unknown dependencies explicitly. Prefer existing read
APIs; direct database access requires a separate least-privilege integration.

Maintain a compact read-contract checklist for candidate release capabilities:
exact lookup, public-address holdings, collections, and existing SRC-20 browsing
if it is under consideration. Check representative responses and
pagination/error semantics without building those screens. Do not extrapolate a
successful stamp proof into a verified complete explorer. Release estimates
cover only the contracts established, with unresolved dependencies identified
separately.

## Architecture to prove

### Evidence collected during the strategy check

Bounded live read checks on 3 November 2026:

| Check                                                                                                                                                                 | Observed result                                                                              | What remains unproved                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| [Stamp list, limit 1](https://stampchain.io/api/v2/stamps?limit=1&page=1&sortBy=DESC&type=classic) and [matching detail](https://stampchain.io/api/v2/stamps/1507273) | Both GET 200 JSON; stamp 1507273, CPID A1301847304853164300 and transaction identifier agree | Pagination/filter completeness, sustained access, capacity, freshness, and the other candidate release contracts |
| Advertised [native raster file](https://stampchain.io/stamps/7046278a4bda05c7dd3063dd10607800cbb92ba6f8c7c41f49bd985edee6bbed.png)                                    | HEAD 200, Content-Type image/png, Content-Length 227                                         | Body/signature validation, image decoding, browser rendering, and representative coverage                        |
| [Preview URL derived from source defaults](https://stampchain.io/stamps/previews/1507273.png)                                                                         | HEAD 404 for this exact URL                                                                  | Actual production preview host/key configuration and global coverage; one miss proves neither                    |

No rendering/generation or refresh endpoint was called. List/detail responses
advertised API version 2.3; some flags used numeric versus boolean
representations and detail included a base64 field. The adapter must normalize
the chosen fields explicitly and bound response size. The observed cache
metadata does not establish freshness, so do not infer a current indexed state
from HTTP success alone.

### Proposed implementation boundaries

1. A small route/UI layer with consistent typography, spacing, navigation,
   cards, tables, filters, and error states. Use server rendering for
   browse/detail pages and limited client interaction for filtering/search.
2. A typed read adapter around existing APIs or approved server-side read
   services. Validate boundary data, retain integer precision, and represent
   unavailable, stale, loading, empty, and failed states separately.
3. URL-owned query state for search, filters, sorting, and pagination. Define
   the meaning of newest/oldest globally and the visual order within each page.
4. A media boundary: consume existing safely served raster originals or verified
   static previews for the proof. Interactive untrusted content requires an
   independently assessed origin/sandbox design. Copying the existing iframe
   setup is not acceptance. Read-only browsing can still expose active content.
5. Read-only server credentials where necessary and an explicit route/method
   allowlist. Hiding wallet buttons does not remove inherited write endpoints.
   Exclude signing/broadcast capability and mutation/admin routes from the
   deployment; address/transaction parsing libraries may legitimately remain.
6. Reproducible production builds, immutable deployment identifiers, browser
   journey tests, server logs, and measured performance. The deployment must be
   traceable to the exact tested revision and support rollback.

Consume and preserve existing API v2 read contracts and established identifiers;
this does not mean exposing the legacy mutation API in the explorer deployment.
Do not invent missing market data: transfers are not trades, and 7-day volume is
not 24-hour volume. Pin the proof's runtime/dependency versions and align its
application/test resolutions. Record inherited build/test failures separately;
repairing the entire legacy dependency graph is not a hidden proof prerequisite.

The current `DENO_ROLE=web` setting is not a restricted route profile: `main.ts`
still imports and starts the complete generated manifest. E01 must prove the
selected entry point, manifest, lean layout, and production packaging. For the
preferred remote-read-API approach, cold-start without database, Redis,
AWS-write, or administrative credentials. Environment flags and hidden buttons
do not establish isolation.

Read-only means no user/business mutations, signing, or broadcasting. GET-only
is insufficient: the legacy preview endpoint can generate and upload files on a
cache miss or refresh. The proof consumes pre-existing static previews or safely
served native raster files, and uses a placeholder if absent. Check trusted
media origin, content type, decoding and resource bounds; a filename or HEAD
header alone does not validate safe image handling. It does not invoke
generation/refresh routes. Future derived-preview/cache writes require a
separately scoped service and credentials. Normal logging/caching is not itself
a business mutation.

Include rendered HTML and browser requests in the E01 reuse probe and E03 media
checks. Existing stamp components reference the generation endpoint through
image helpers, preview downloads, and social-image metadata fallbacks. Remove
those references from the proof, including remote URLs. A restricted route
manifest alone does not prove that the frontend avoids the legacy generator.

## Workstream A: existing-site safety and reliability

These remain relevant even if a new explorer is built. Each item requires a
small reviewable change with a regression test; none is marked fixed here.

| Order     | Work item                                                    | Evidence needed to close                                                                                                                 |
| --------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Immediate | Triage daily regression issue #1320                          | Inspect the failed report, reproduce the failing assertion, and distinguish schema, latency, and infrastructure causes                   |
| P0        | Contain potentially unsafe active artwork origins            | A malicious fixture cannot access parent application state or escape the intended content boundary; direct content navigation is covered |
| P1        | Enforce administrator and shared-metadata editing authority  | Unauthorized requests fail before writes; verified issuer/deployer or delegated editor policy is bound to the exact tick and operation   |
| P1        | Bind transaction preview/signing to current form and account | Editing any transaction field or changing account invalidates the prepared transaction; stale async responses cannot restore it          |
| P1        | Correct numeric and fee handling                             | Fractional fees, zero decimals, large integers, cancellation, and failures have explicit tested behavior                                 |
| P1        | Fix middleware and validation reliability                    | One downstream invocation per request; native Request/Response validation detects invalid data without consuming the returned body       |
| P1        | Make CI failure and release identity trustworthy             | An intentional assertion failure makes the check fail; the released artifact corresponds to the tested commit                            |

Related issues and PR overlap are linked in the reconciliation document. Safety
work involving transaction construction needs independent protocol/wallet
review. No real-value transaction is required or authorized by this plan.

Workstream A has no assigned delivery owner or validated budget in this plan and
is not included in the explorer estimate. Triage and scope it separately. Legacy
transaction/upload repairs do not automatically block a properly isolated
explorer. Unsafe media origins, inherited administrative routes/credentials, or
data failures actually affecting the explorer do block its relevant acceptance.
If one person handles both tracks, their time allocation changes the calendar.

For shared token metadata, define editing authority as a verified
deployer/issuer, delegated editor, or administrator according to the product
policy. Owning some units of a token must not automatically authorize changing
its shared background. Bind authorization to the exact tick and operation;
retain CSRF as a separate check. Middleware repair must cover native Request and
Response adaptation, including validation without consuming or corrupting the
returned response body.

## Workstream B: bounded staging proof

Deliver this complete journey:

> Explorer -> filter/sort -> stamp detail -> Back to the same explorer state.

The mandatory proof contains two page types, one read adapter, verified existing
static media, deterministic fixtures, and sampled live records. Address/creator
pages are later work, not a requirement of the capped proof. This is a browsing
and integration proof; search needs its own E05 acceptance before claiming that
the complete discovery experience has been validated.

| Ticket | Deliverable                                                  | Pass condition                                                                                                                                                        |
| ------ | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E01    | Baseline, option comparison, product brief and contracts     | In the first 1-2 days of the proof allowance, evidence build/boot viability, read/media access and reuse/extraction tradeoffs; record unknowns and select an approach |
| E02    | Fixture-backed list/detail/Back journey and design direction | Production build supports URL state, responsive layout, keyboard use and failure states; desktop/mobile design is reviewable                                          |
| E03    | Live read adapter and verified existing static media         | Normalize sampled source fields, bound responses, verify media availability and safe fallback; no generation routes or active app-origin content                      |
| E04    | Staging production build and evidence bundle                 | Deployed commit, route/capability checks, browser journey, screenshots, performance samples and simple rollback to a known staging artifact are demonstrated          |

Proof acceptance:

- No missing or duplicate entries in controlled paging cases. Per-page visual
  ordering and server page selection have documented meanings.
- A copied URL reproduces the view; Back/Forward restores state.
- Navigation uses links with useful labels. Errors remain distinguishable from
  legitimate empty results.
- API timeout, invalid identifier, missing media, and retry are exercised.
- The core journey works at narrow mobile and desktop sizes, with keyboard-only
  use and 200% zoom. Long identifiers do not make essential controls unusable.
- Automated accessibility checks are supplemented by manual focus/keyboard
  checks.
- Required fixtures cover a valid zero versus an unavailable value, tiny numeric
  values, integers beyond JavaScript's safe integer range, partial source
  failure, stale/indexer-delayed data, and missing/unsupported media. Exercise
  these where fields are displayed or adapted; do not add market screens just to
  test them. One failed enrichment must not erase an otherwise valid page.
  Activity work later also requires repeated operations for the same asset to
  stay distinct.
- Data checks establish mapping fidelity to sampled source records, not an
  independent audit of the indexer or chain history. Record source and
  freshness.
- Choose a small stratified media sample before judging the prototype, rather
  than selecting only working images: for example 12 records spanning recent and
  older stamps, ordinary raster assets and problematic/interactive formats.
  Report available static assets, missing assets and intentionally unsupported
  types separately. Confirm the observed coverage is acceptable for the intended
  browsing release. Working placeholders alone do not prove an image-led product
  is useful. Poor coverage triggers a narrower advertised scope or a separately
  budgeted safe preview service, not silent use of a generation endpoint.
- Production-build performance is measured repeatedly with a recorded device and
  network profile. Proposed initial lab targets are LCP <= 2.5 seconds and CLS
  <= 0.1 on agreed pages; these are targets, not measurements of today's site.
  Record backend latency separately. Field percentile claims require field data.
  Compare like-for-like production builds and record cold/warm cache conditions;
  do not turn the proof into a general performance-optimization project.
- The built and staged route/method inventory excludes user mutation, admin,
  signing, broadcasting, and preview-generation routes. Negative tests prove
  inherited write/admin paths are unavailable; the deployment has no unnecessary
  database, storage-write, or administrative credentials.
- Rendered HTML, social-image metadata, media fallbacks, download links, and
  browser requests contain no preview-generation or refresh URLs, including
  references to the existing service. Exercise missing-preview cases with safe
  fixtures and intercept forbidden requests before dispatch.
- Safe fixtures verify that HTML/SVG originals, redirects, fallback URLs, and
  direct content navigation cannot execute with explorer-origin privileges.
  Check deployed headers and the production build, not only iframe markup.
- Demonstrate the reviewed desktop/mobile design; record unresolved owner or
  usability feedback instead of declaring success from passing tests alone.

A static mockup alone does not pass. An API response without the working browser
journey does not pass. If data access or a reproducible environment cannot be
established within the capped proof effort, report the blocker and revise scope
before authorizing more spend or making a launch commitment.

At the proof cap, make one recorded decision:

- **Continue:** the deployed core task works, the design is accepted, the
  capability boundary passes, and data/media access supports the selected scope.
  Build the next estimate from remaining tickets and observed effort.
- **Change:** name one concrete failing condition, a bounded corrective
  allowance, and the scope it displaces. A changed requirement is not silently
  added work.
- **Stop/re-scope:** data, media, deployment, or design prevents a useful result
  within the cap. Deliver the code, evidence, and specific blocker; do not
  replace a failed proof with another open-ended audit or declare a fixture demo
  complete.

## Workstream C: complete the first release after the proof

| Order | Deliverable                                                | Dependency / acceptance                                                                                        |
| ----- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| E05   | Search and URL-state completion                            | Exact lookup first; reuse #1321 only with verified creator-search service; accessible links and explicit scope |
| E06   | Address and collection browsing, subject to route decision | Contract fixtures, paging, empty/error states and sampled live verification                                    |
| E07   | Listing/activity views and content polish                  | Proven source fields, explicit missing data, no unsupported trading-volume claims                              |
| E08   | Route compatibility, metadata, sitemap, accessibility      | Chosen hostname/cutover policy; route map, canonical metadata, meaningful dates and mobile/manual review       |
| E09   | Release hardening and operations                           | Production-build browser checks, monitoring, cache/failure behavior, deployment identity, rollback             |
| E10   | Owner acceptance and handover                              | Agreed journeys demonstrated, known defects recorded, operational owners and access confirmed                  |

E05 search acceptance additionally requires native result links, useful group
and result labels, stale-response protection, and a visible partial-failure
state. Search is outside the bounded two-page browsing proof. Start with exact
identifiers, then add name discovery only after its service dependency passes.

Transaction tooling and new protocols become a separate project after this
release is accepted. Use shared transaction contracts, a deterministic state
machine, and wallet-specific validation there; visual reuse alone will not solve
correctness.

## Time and cost control

These are low-confidence budgeting ranges before the proof, not a delivery
promise or an estimate calibrated to this agent's measured throughput. They
assume one experienced engineer available for 30-35 focused hours/week, roughly
4-8 hours/week of design/QA support, owner decisions within one working day, and
usable existing data/hosting services. AI assistance is part of the workflow,
not an assumption of unattended continuous engineering. Access delays are
additional. The proof's 4-8 engineering days are an investigation/build
allowance, not a guarantee that external dependencies will be resolved within
that time. Report a short progress checkpoint after the first two focused days;
re-scope if the baseline is blocked.

| Milestone                           | Planning allowance                                                                         | Commitment gate                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Reconciliation and scoped plan      | Delivered by this review                                                                   | Inspect these documents; no code delivery claimed                                  |
| Working staging proof               | Capped investigation/build allowance of 4-8 engineering days, usually 1-2 working weeks    | Dependency delay can prevent completion; report evidence and re-estimate           |
| Stamp-focused release candidate     | Approximately 4-7 further weeks after proof; rough 6-10 weeks overall                      | Low-confidence range, excluding Workstream A; settle design and routes after proof |
| Broader stamps-and-tokens candidate | Approximately 6-10 further weeks after proof, depending on chosen token/portfolio coverage | Low-confidence alternative, not an approved scope; estimate data contracts and QA  |
| Full tooling/platform replacement   | Not estimated; earlier 3-5 month figure is withdrawn as a decision basis                   | Requires separate wallet, protocol, migration and operations discovery             |

These workstreams share people unless explicitly staffed separately; safety work
can extend the explorer calendar. Do not add these rows as sequential mandatory
phases: the broader explorer is an alternative scope, and full tooling is later.
At half-time availability, calendar duration rises substantially. No currency
budget is defensible without an agreed rate and staffing allocation.

Do not rely on the earlier 3-5 month full-platform figure for approval or
payment; there is no bottom-up estimate for that project. Retain it only as
historical context and estimate separately if the owner later selects that
scope.

Use a capped proof contract/timebox first. Re-estimate after two small accepted
deliveries. Keep only one or two implementation items in progress. Any scope
addition must name what moves out or how the estimate changes.

## Delivery evidence and contractor review

Keep evidence proportional. E01 delivers its baseline/decision record and small
probes; E02/E03 deliver the working slice and relevant checks. Collect the full
staging, browser, media, capability, performance, and rollback evidence bundle
once at E04, then for release milestones. Do not demand a separate deployment or
full audit for every small ticket. Record code revision, actual effort, known
limitations, and completed/tested/blocked work rather than an unsupported
percentage done. Name one implementation owner, one reviewer, and one person
responsible for release/operations before accepting a release commitment.

Do not infer billing fairness or competence from issue age, line count, or a
snapshot of defects. Establish the contracted scope, promised dates, accepted
changes, dependencies, and actual deployed revisions. Credit working domain
integration, data services, tests, and operational work. Recent merged PRs show
real development; the remaining problems justify better acceptance criteria.

Before changing the delivery relationship, assemble a handover inventory:

- Repository and organization administration; source/license rights as recorded.
- Hosting, CI, DNS, certificates, and release permissions.
- Database/indexer/API ownership, credentials, quotas, backup and restore
  process.
- Media/preview infrastructure, storage, logs, monitoring, and service costs.
- Known incidents, outstanding work, deployment runbooks, and rollback
  ownership.

Keep the current contributor available as a protocol/data reviewer or handover
partner where useful. The evidence supports a narrower product direction and
milestone-based delivery; it does not establish that their work was valueless.
No contractor contact or external issue/comment has been sent by this review.

## Immediate sequence

1. Review #1320 and prioritize the safety findings without waiting for a
   rebuild.
2. Review the two small owner-fork PRs independently; do not make them wait for
   the 144-file modal migration. Re-test before merging.
3. Run E01 inside the proof allowance: record the current task, verify
   data/media and staging dependencies, and select reuse versus extraction from
   evidence.
4. Implement the E02-E04 two-page proof in an isolated checkout based on the
   agreed upstream revision. Keep unrelated current work intact.
5. Review its working design and evidence; choose stamp-only versus token scope,
   public destination, and remaining route coverage before a release commitment.

The current checkout contains unrelated uncommitted work. This review added only
planning documents and has not altered those files. No merge, branch creation,
deployment, production switch, or transaction is implied by these documents.
