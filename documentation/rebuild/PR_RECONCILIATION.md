# Review findings matched to GitHub work

Snapshot: 3 November 2026, approximately 11:10 Europe/London. Repository:
[stampchain-io/stampchain.io](https://github.com/stampchain-io/stampchain.io).
Four open PRs and 51 open issues were returned by GitHub at this snapshot.
Statuses can change; re-check heads, reviews, and required checks before
merging.

This reconciliation reads current PR metadata, changed files and relevant code,
open issue bodies, recent merged PRs, workflow results, and the active main
ruleset. It does not treat a PR title, green badge, or issue proposal as proof
that a finding is fixed. Remote branch tests were not independently rerun here.

Local review context: branch `codex/navigation-user-search` at
`f82d3d84f8835f84a41898425d3ff631a88199c4`, with pre-existing uncommitted work.
The upstream main snapshot was `7e3cd554b44302f9c07dc6c8c557ed63a6520294`.

## Open PR decisions

| PR                                                                                                  | Snapshot status                                                                                                              | What it actually covers                                                                                                   | Recommended disposition                                                                                                                        |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| [#1322: earliest stamps within each page](https://github.com/stampchain-io/stampchain.io/pull/1322) | Open, mergeable; required checks successful; no submitted review                                                             | Reverses display order within the server-selected page; handles mixed feed, same-block order, and recent-sales exceptions | Review as a small independent change; verify labels, pagination, and live visual order before merge                                            |
| [#1321: user search from navigation](https://github.com/stampchain-io/stampchain.io/pull/1321)      | Draft, mergeable; required checks successful; no submitted review                                                            | Adds creator/user results, linked wallet rows, stale-response protection, partial-failure handling                        | Finish live data/browser validation and accessibility review, then promote from draft; preserve useful implementation                          |
| [#1319: bitcoinjs-lib package bump](https://github.com/stampchain-io/stampchain.io/pull/1319)       | Open, mergeable; required checks successful; no submitted review                                                             | Changes one package.json version from 7.0.2 to 7.0.4                                                                      | Resolve application/test import-map alignment and lock behavior; do not count this as the Deno runtime upgrade                                 |
| [#1307: Modal fixes](https://github.com/stampchain-io/stampchain.io/pull/1307)                      | Open, conflicted; 144 files, 28 commits, +5,456/-18,097 lines; latest head lacks the required quality/unit/readiness results | A broad tool/modal, wallet, route, trade-PSBT, and MARA-removal migration                                                 | Reconcile/split by behavior, resolve conflicts, rerun required checks and production browser journeys; do not merge as simple cosmetic cleanup |

Pinned heads inspected:

- #1322: `fe0f7a97dc1990f4cb179dedc8a57ad374feb382`
- #1321: `f82d3d84f8835f84a41898425d3ff631a88199c4`
- #1319: `2eb9bee0ae35502255f0f0885a9d9ea7e1b4f677`
- #1307: `85bc069a8773dd7415da3a3152b187ac40d04aac`

#1322 preserves page membership. For example, the newest page `[6,5,4]` renders
`[4,5,6]`, while the next page `[3,2,1]` renders `[1,2,3]`. This is not global
oldest-first pagination. Product copy and tests must express that distinction.

#1321 improves user discovery but does not provide universal block, transaction,
and asset search. Existing click-only asset result rows remain; wallet results
are native links. The title passed to ModalSearchBase is not rendered by that
component. The PR explicitly lacks live MySQL-backed browser verification.

#1319 does not update `deno.json:166` or `tests/deno.json:113`, which still
resolve `bitcoinjs-lib` to `npm:bitcoinjs-lib@7.0.0-rc.0`. Both configs disable
lockfiles. Check actual runtime resolution before calling this dependency work
complete.

## Corrections and qualifications to the initial review

**Main has meaningful merge protection.** The active
[main ruleset 616444](https://github.com/stampchain-io/stampchain.io/rules/616444)
requires one approving review and Quality Checks, Production Readiness Gates,
Security Validation, actionlint, and Unit Tests with Mock Database. The
connected user cannot bypass it. The earlier broad deployment criticism must not
be read as saying main is unprotected or that ordinary PR merges have no checks.

The ruleset does not require the branch to be up to date, dismissal of stale
approvals, approval of the last push, or resolved review threads. Separately,
`.github/workflows/production-deploy.yml` has no implemented validation lookup
in its pre-check job corresponding to its "passed on this commit" comment.
Strengthen the tested-commit/artifact relationship and production-build browser
checks; retain the existing review gates.

**#1307 makes real trade-PSBT contract improvements.** It validates ownership
and uses actual input/output information and seller signing instructions. Its
schema defines zero as the seller fee because the buyer pays later, and defines
estimatedSize as PSBT byte length. The buyer preview supplies buyerFeeSats. Do
not repeat the initial generic placeholder-fee criticism against this revised
contract without accounting for those semantics. Relevant trade tests exist;
they were inspected, not independently executed in this review.

**Recent merged work is useful.**
[#1300](https://github.com/stampchain-io/stampchain.io/pull/1300) improves modal
focus/semantics; #1295-#1299 consolidate page/modal tool implementations;
[#1306](https://github.com/stampchain-io/stampchain.io/pull/1306) addresses
wallet prompt and Tools keyboard behavior;
[#1288](https://github.com/stampchain-io/stampchain.io/pull/1288) improves
fail-closed UTXO protection. These are assets to preserve, not work to redo by
default.

The production regressions described in reverts
[#1308](https://github.com/stampchain-io/stampchain.io/pull/1308) and
[#1310](https://github.com/stampchain-io/stampchain.io/pull/1310) support adding
production-build browser checks. They do not establish individual blame.

## Finding-to-work matrix

Priority: P0 immediate containment/review; P1 correctness, security, or release
reliability; P2 usability, accessibility, performance, or maintainability.
"Related issue" means overlap exists, not that its proposed solution is
adequate.

| ID / priority | Finding and user impact                                                                                                                   | Existing work                                                                                                                                      | Remaining action / closure evidence                                                                                                                                                                                                                                           |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A01 / P0      | Untrusted HTML preview can share application origin with scripts and same-origin iframe permission                                        | Related [#1033](https://github.com/stampchain-io/stampchain.io/issues/1033); survives #1307                                                        | Establish safe content origin/sandbox behavior for embedded and direct views; verify malicious fixtures without accessing real user data                                                                                                                                      |
| A02 / P1      | Admin fee settings POST and shared-background upload lack operation-specific editing authority checks                                     | Related [#166](https://github.com/stampchain-io/stampchain.io/issues/166); survives #1307                                                          | Define verified deployer/issuer, delegated editor or administrator policy; enforce it for the exact tick/action. Holding token units does not automatically grant editing authority. Retain CSRF separately; test unauthorized and legitimate requests before writes          |
| A03 / P1      | Prepared SRC-20 PSBT may outlive edited deployment fields and be signed                                                                   | #1307 retains shared hook; [#1164](https://github.com/stampchain-io/stampchain.io/issues/1164) addresses shared fees, not this invalidation defect | Tie preparation to a complete immutable intent including account and all fields; invalidate stale responses; revalidate at signing                                                                                                                                            |
| A04 / P1      | Fractional recommended fee is rounded; fee-calculator props turn zero decimals into 18 and convert large integers through Number          | Survives #1307; #1164 only related                                                                                                                 | Preserve supported fractional rates and estimation precision; test zero, boundaries, and displayed-versus-constructed values. The inspected submit payload parses the string "0" correctly; this is not evidence that every zero-decimal transaction deploys with 18 decimals |
| A05 / P1      | Cancellation/failure can use success styling; transfer input handling and account-dependent results remain fragile                        | Tool code moves in #1307 without closing all behavior                                                                                              | Explicit submission states, literal-safe token search, and cancellation/account-switch tests                                                                                                                                                                                  |
| A06 / P1      | OpenAPI adapter assumes an object URL and decoded response body, but receives native Request/Response objects                             | No matching fix in four open PRs                                                                                                                   | Parse URL and clone/decode supported responses safely; real Request/Response integration tests must detect schema-invalid data and leave the returned response body intact                                                                                                    |
| A07 / P1      | Rate limiter error recovery can call downstream handler twice                                                                             | No matching fix; isolated reproduction during original review                                                                                      | Guarantee one dispatch; test downstream failure without repeating side effects                                                                                                                                                                                                |
| A08 / P1      | Failed explorer/data fetches can appear as empty results; unavailable market values can appear as zero or wrong period                    | Related [#1100](https://github.com/stampchain-io/stampchain.io/issues/1100); no complete open-PR fix                                               | Distinct data states and correct period labels; missing period stays unavailable; transfers never substituted for sales                                                                                                                                                       |
| A09 / P1      | Integration failure propagation and deploy/test identity need strengthening                                                               | No open-PR fix; existing main ruleset already provides meaningful merge gates                                                                      | Inject known assertion failure to prove CI fails; test production artifact and bind deployment to it                                                                                                                                                                          |
| A10 / P1      | Application/test dependency graphs differ; lockfiles disabled                                                                             | #1319 package.json-only bump is partial                                                                                                            | Align import maps, pin runtime, verify frozen dependency resolution and reproducible build                                                                                                                                                                                    |
| A11 / P1      | Fresh daily regression report needs triage; separate documented MySQL failover-auth risk remains                                          | [#1320](https://github.com/stampchain-io/stampchain.io/issues/1320), [#1208](https://github.com/stampchain-io/stampchain.io/issues/1208)           | Inspect regression artifact before assigning cause; verify driver recovery in an isolated environment                                                                                                                                                                         |
| A12 / P2      | Search coverage, discoverability, accessible result interaction                                                                           | #1321 partially addresses user search                                                                                                              | Finish live verification, native asset links, grouped labels, and clear supported search types                                                                                                                                                                                |
| A13 / P2      | Explorer ordering and filter-state semantics                                                                                              | #1322 addresses within-page order only                                                                                                             | Verify intended paging/sort semantics; encode filter state in URLs; preserve Back/Forward state                                                                                                                                                                               |
| A14 / P2      | Closed drawers/collapsed controls can remain keyboard reachable; duplicated drawer behavior                                               | Related [#843](https://github.com/stampchain-io/stampchain.io/issues/843); #1300 already improved modals                                           | Shared accessible drawer behavior; focus restoration and inert/hidden closed content verified manually                                                                                                                                                                        |
| A15 / P2      | Production performance is not adequately established by current dev/desktop checks; body buffering and incomplete RUM deserve measurement | No complete matching open PR                                                                                                                       | Baseline representative production-build journeys; remove measured bottlenecks; implement usable monitoring                                                                                                                                                                   |
| A16 / P2      | Static-only sitemap dates/coverage, route guidance, and tooling docs need reconciliation                                                  | Framework issue [#924](https://github.com/stampchain-io/stampchain.io/issues/924) is related maintenance, not a prerequisite                       | Route/content inventory; useful metadata; accurate setup/test commands; defer framework migration pending evidence                                                                                                                                                            |
| A17 / P2      | Trade compose response previously had ambiguous fee/size information                                                                      | #1307 materially improves this contract                                                                                                            | Validate seller/buyer semantics and signed-output preservation across supported wallets before accepting                                                                                                                                                                      |
| A18 / P2      | Duplicate terms-control IDs and nested labels could toggle the wrong control                                                              | #1307 addresses these markup defects                                                                                                               | Preserve fix and verify keyboard/click behavior in production browser journeys                                                                                                                                                                                                |

Security findings describe code paths and missing boundaries, not an observed
account compromise. No production exploit or real-value transaction was
attempted. The first audit did not establish field Core Web Vitals or run the
entire suite; local Deno was 2.3.1 while repository guidance requires 2.6.9.
Treat a reproducible supported environment as an implementation gate, not as
completed validation.

Pinned source anchors for the highest-impact findings, at reviewed upstream
main:

- A01:
  [preview sandbox](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/islands/content/stampDetailContent/StampImage.tsx#L829),
  [HTML content URL](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/lib/utils/ui/media/imageUtils.ts#L247),
  [content CSP](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/lib/utils/security/securityHeaders.ts#L178).
- A02:
  [fee-security POST](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/routes/api/internal/fee-security.ts#L110),
  [background upload](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/routes/api/internal/src20Background.ts#L88),
  [background upsert](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/server/database/fileOperations.ts#L11).
- A03:
  [preparation dependencies](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/client/hooks/useSRC20Form.ts#L546),
  [cached PSBT signing](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/client/hooks/useSRC20Form.ts#L787).
- A04:
  [recommended-fee rounding](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/client/hooks/useSRC20Form.ts#L390),
  [fee-calculator values](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/islands/tool/src20/DeployTool.tsx#L651),
  [separate submit parsing](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/client/hooks/useSRC20Form.ts#L824).
- A06:
  [OpenAPI Request handling](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/server/middleware/openapiValidator.ts#L338).
- A07:
  [dispatch inside limiter try/catch](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/server/middleware/rateLimiter.ts#L425).
- A08:
  [explorer error fallback](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/routes/explorer/index.tsx#L582).
- A09:
  [integration exit-code handling](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/.github/workflows/integration-tests.yml#L154),
  [production pre-check](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/.github/workflows/production-deploy.yml#L50).
- A10:
  [application import map](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/deno.json#L166),
  [test import map](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/tests/deno.json#L113).

## Self-review addendum: 3 November 2026

All four PR heads, open/draft states, and mergeability were rechecked and remain
as recorded above. This does not re-run their tests or certify them for merging.
Independent adversarial reviewers confirmed the central findings and identified
these additional acceptance gaps:

- A06 needs both Request and Response adaptation. The
  [caller passes a native Response](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/routes/api/_middleware.ts#L160),
  but the validator takes
  [its body stream as data](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/server/middleware/openapiValidator.ts#L356).
  Correct URL parsing alone would leave response validation broken.
- A02's metadata authority must be defined by product policy. A public holder
  must not gain permission to replace a shared background merely by holding the
  token. Distinguish issuer/deployer authority, delegation, and administrator
  authority from CSRF checks.
- Read-only frontend isolation cannot be inferred from HTTP methods. The legacy
  [preview GET handler](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/routes/api/v2/stamp/%5Bstamp%5D/preview.ts#L1561)
  can render and
  [upload to storage](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/routes/api/v2/stamp/%5Bstamp%5D/preview.ts#L1225).
  This is expected cache-generation behavior, not itself a new vulnerability.
  The proof therefore consumes existing static previews, falls back safely when
  absent, and tests its deployed routes and credential capabilities.

The updated plan also narrows the proof to list/detail/Back, adds product/design
acceptance, leaves token coverage unresolved, and distinguishes frontend
independence from independent data operation. No security exploitation or
production modification was performed during this self-review.

## Why #1307 needs a focused review

At the pinned head, these original findings remain in the moved implementation:

- `client/hooks/useSRC20Form.ts`: rounded fee around line 390; preparation
  dependencies around 546-555 omit deployment supply/limit/decimals/metadata;
  cached PSBT signing around 787 remains.
- `islands/modal/tool/SRC20DeployTool.tsx`: fee-calculator zero-decimal fallback
  and Number conversion around 576-578; same shared form hook. This differs from
  the submit payload, which parses the string "0" correctly.
- `islands/modal/tool/StatusMessages.tsx`: generic success presentation
  around 27.
- `islands/content/stampDetailContent/StampImage.tsx`: scripts plus same-origin
  sandbox permission around 822; content URL handling still reaches the app
  origin; `lib/utils/security/securityHeaders.ts` still uses
  frame-ancestors-only content CSP around 178.
- Internal fee-security and background-upload routes remain; OpenAPI and limiter
  findings remain. CI files are not changed by the PR.

Also reconcile removed standalone routes and how-to content before accepting the
modal-only product model. The PR description mentions `/tool/stamp/trade`, while
the new trade surface is `/dev/otc`; the latter is unlinked but not
access-guarded merely because its path says dev.

Recommended review units: presentation/accessibility; route compatibility;
wallet/transaction contracts; trade flow; MARA retirement. Each needs its own
acceptance criteria. A read-only explorer need not wait for this entire
migration.

## Backlog reconciliation and operational context

Of 51 open issues, 27 had no assignee, 43 had no milestone, and 33 were created
before 2026. These counts suggest a backlog reconciliation exercise, not a
measure of paid effort or competence. Some issues may already be partly
implemented.

- [#1320](https://github.com/stampchain-io/stampchain.io/issues/1320) was opened
  at 08:52 UTC on 3 November. Its
  [daily workflow](https://github.com/stampchain-io/stampchain.io/actions/runs/41606093309)
  reports one critical regression. The workflow status is a confirmed failure;
  the underlying cause is not yet established. The homepage rendered real stamps
  during inspection, so this alone does not establish a total production outage.
- [#885](https://github.com/stampchain-io/stampchain.io/issues/885) may overlap
  merged #1306; re-test the original reproduction and close/update if covered.
- [#1126](https://github.com/stampchain-io/stampchain.io/issues/1126) requests a
  dummy-data mode, while placeholder infrastructure exists. Reconcile acceptance
  instead of implementing a second version automatically.
- [#1208](https://github.com/stampchain-io/stampchain.io/issues/1208) documents
  a MySQL driver authentication problem after restart/failover. The import
  remains mysql 2.12.1. Verify the issue and fix in staging; this is not proof
  of a current outage but matters to explorer reliability.
- New protocol, RGB/UCP, swap, and other expansion proposals are outside the
  first-release scope. Do not count their open status as unfinished core UX.

## Repository strategy

The existing fork is
[arwyn6969/BTCStampsExplorer](https://github.com/arwyn6969/BTCStampsExplorer),
with default branch `dev`; #1321 and #1322 already originate there. The
connected account has admin rights on this fork. Upstream connector permissions
show push but not admin; this describes the connection and does not disprove the
owner's rights through another account or organization role.

Use an isolated implementation branch and separate staging, keep upstream as a
reference, and selectively preserve reviewed fixes. Do not merge the large modal
PR wholesale to start a read-only explorer. Do not replace the production site
or discard the existing system until the replacement demonstrates its agreed
routes, data fidelity, operations, and rollback.

Further strategy review corrected an assumption: these findings do not establish
that a separate frontend application is necessary. The updated plan compares
reuse/isolation of the existing explorer with extraction during E01, inside the
proof allowance. Both must satisfy their stated deployment boundary; a fork is
an ownership/contribution mechanism, not proof that a rewrite is justified.

See [delivery plan](PLAN.md) for the proposed scope, first proof, acceptance
tests, dependencies, and conditional time ranges.

## Final plan challenge: 3 November 2026

The final challenge and two agent reviews found no additional architectural
blocker requiring another general audit. Reuse cost, supported-runtime boot,
read/media contracts, and staging access remain E01 questions, not established
delivery facts.

One concrete probe clarification is now explicit in the plan and handoff:
inspect rendered HTML and browser requests as well as the route manifest. At the
reviewed upstream revision, the
[image helper](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/lib/utils/ui/media/imageUtils.ts#L157),
[preview download](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/islands/content/stampDetailContent/StampImage.tsx#L309),
and
[social-image fallback](https://github.com/stampchain-io/stampchain.io/blob/7e3cd554b44302f9c07dc6c8c557ed63a6520294/routes/stamp/%5Bid%5D.tsx#L306)
reference the legacy preview-generation endpoint. Excluding that route from the
proof server does not remove references to a remote generator. Use static assets
or placeholders and test missing-preview branches without dispatching requests
to the generator.

Remote reads reconfirmed upstream `main` at
`7e3cd554b44302f9c07dc6c8c557ed63a6520294`, owner-fork access, and the fork's
older default `dev` branch at `c5c82e23319fa1859d26bbad5236f73ba4cbc0d0`. Local
Deno remains 2.3.1; repository guidance requires 2.6.9. No PR statuses, checks,
or live data/media observations were refreshed by this final challenge. No
application code, build, or deployment was changed during it. This review record
does not itself authorize implementation or production release.
