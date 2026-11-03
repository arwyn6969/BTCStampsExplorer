# List/detail protocol mismatch found during integration

Three bounded public GETs were collected on 3 November 2026 at approximately
12:33–12:35 UTC. No credentials, generation, refresh or content routes were
used. Raw response bodies, headers and request timings are saved under these
names:

| Read | Status | Observed result |
| --- | --- | --- |
| `integration-latest-all` | 200 | `type=all`, newest first, limit 1 returns stamp 1507814, `ident: SRC-20`, SVG, CPID `lza2tjlvB2WG2M5xdPTD`, transaction `2611d258d85380ce1fba31912dbf159e87661fce2478d8b0aba404939cf34196`; total 1,509,668 |
| `integration-detail-1507814` | 404 | Direct source GET `/api/v2/stamps/1507814` returns `{error:"Stamp not found",status:"error",code:"NOT_FOUND"}` |
| `integration-latest-art-stamps` | 200 | Same list with explicit `ident=STAMP,SRC-721` returns stamp 1507273, `ident: STAMP`; total 59,655 |

The first two responses reported Cloudflare `DYNAMIC`. The 404 permits a
300-second cache lifetime; internal caching and transient freshness remain
unverified. It is not justified to explain this away as a temporary cache miss.
Directly reproducing the source 404 shows that this case is not caused by the
explorer adapter's number parsing or local route rendering.

There is also a concrete contract mismatch in the reviewed source baseline:

- `routes/api/v2/stamps/index.ts` and `[id].ts` both construct the shared handler
  with type `stamps`.
- In the list branch, `type=all` overrides that default and is passed to the
  controller. With no explicit `ident`, the controller leaves identifiers
  unrestricted (`server/controller/stampController.ts:217`).
- In the detail branch, the handler passes its fixed type `stamps`
  (`routes/handlers/sharedStampHandler.ts:391`), which the controller maps to
  `ident: ["STAMP", "SRC-721"]` (`server/controller/stampController.ts:213`).

The deployed source revision has not been independently matched, so this code
path is an explanation supported by the observed protocol/404 combination, not
a claim of verified production source identity. Calling the same numeric detail
URL again, changing filter state, or retrying media does not supply a token
detail contract.

For the approved two-page stamp proof, use an explicit list protocol constraint
`ident=STAMP,SRC-721` and label the view **All art stamps**. Keep token browsing a
later release-scope decision. This is an explicit proof boundary, not evidence
that the owner approved a stamp-only public release. The constrained list's
first record is 1507273, whose detail and source-data mapping were separately
verified earlier; this does not prove every constrained record resolves.

Preserve the initial failed integration result as evidence. Add a deterministic
source-404 regression: a selected list record may become unavailable at detail;
show an honest unavailable state, keep Retry and the original explorer
filter/sort/page Back link, and never fabricate details from the list or change
the selected stamp silently. A rerun after an explicit protocol-constraint fix
is a new result; it must not replace or relabel the original failure.

Remaining limits: no SRC-20 detail endpoint was verified, the other candidate
release protocols were not audited, and these three reads do not establish
cache behavior, broad pagination fidelity, indexer correctness or availability.
