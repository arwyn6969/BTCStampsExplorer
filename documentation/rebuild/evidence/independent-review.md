# Independent implementation review

Reviewed 3 November 2026 in the isolated proof checkout based on upstream
`7e3cd554b44302f9c07dc6c8c557ed63a6520294`. This is an independent agent review,
not owner design acceptance or a human usability review.

No remaining P0/P1 issue was identified in the reviewed explorer package. The
review covered the restricted entry point/manifest, route and method allowlist,
JSON precision and response limits, identity validation, query/Back-state
construction, static-media URL restrictions, redirect rejection, raster bounds,
failure states and source-data mapping. No inherited business-write/admin route,
wallet/signing/broadcast import or arbitrary-URL fetch was found.

Four concrete issues were found and corrected during implementation:

| Issue                                                                                                   | Correction and evidence                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Verified creator labels were discarded because only `name` was mapped                                   | `creator_name` now maps to a distinct `creatorName`, preserving artwork-name semantics. Both live detail samples and all 16 captured fixture records pass the source comparison.                                                                                                                                                                                                                                                         |
| Fixture chronology sorted numeric stamp IDs, reversing negative/cursed chronology relative to live data | Fixture ordering now uses raw `tx_index`, with explicit unknown handling and a deterministic fixture-only tie fallback. Negative-ID and missing/tie cases are covered by focused adapter tests. The live source does not guarantee tie order.                                                                                                                                                                                            |
| A Next link at the supported page cap could silently return to page 1                                   | The supported cap was expanded to 1,000,000, the UI disables forward navigation at the cap, and the bound is explained. It does not silently wrap.                                                                                                                                                                                                                                                                                       |
| Unrestricted list results included SRC-20 records whose stamp-detail endpoint returns 404               | Three bounded source reads reproduced the mismatch. The proof list now explicitly requests `ident=STAMP,SRC-721`, constrains fixtures to the same protocols, rejects unexpected live protocols rather than client-filtering pages, labels art-stamp scope and retains an explicit source-not-found state. See [the raw finding](live/list-detail-contract-gap.md). This proof boundary does not settle the later token release decision. |

The final [source-adapter comparison](source-adapter-comparison.json) passed at
12:38:52 UTC. It invokes the actual adapter with injected fetch returning both
saved detail bodies unchanged, and exercises actual fixture listing over all 16
captured records, without network access. It verifies identity, creator and
creator name, MIME/media URL, supply, block/time and normalized boolean flags.
The adapter SHA-256 recorded by that run is:

`4f467b9d0d95dc962e8484848b958bfe623ca1b84d211b702ae1a25bf162885d`

The implementation owner reports that final formatting, lint, type checking,
production build and 25 tests pass. This reviewer directly reran the source
comparison, inspected the concrete changes and reproduced the page-cap defect;
it did not independently rerun every implementation check. The separate
[capability report](capabilities-live.json) describes local production-build
checks, rather than deployed staging checks.

Evidence limits remain explicit. Saved list envelopes use limit 4 while the
implemented adapter requests limit 12; their row mapping is checked through
fixture mode and the unchanged raw detail bodies through live mode. This does
not prove every live list/detail combination, stable offset paging during new
blocks, complete media coverage, indexer correctness or service capacity. Eight
preselected PNGs decoded locally and four HTML originals were intentionally
unsupported; no active originals or generation routes were requested. The
upstream list/detail failure remains documented even after the constrained
protocol rerun succeeds.

This review does not certify a staging deployment, rollback demonstration,
operational access, owner design approval or the required unfamiliar human
reviewer. Those are delivery evidence and acceptance limits, not additional code
defects found by this review. An agent review does not replace human review.
