# Observed public read and media contract

Collected 3 November 2026, approximately 12:05 UTC, for source baseline
`7e3cd554b44302f9c07dc6c8c557ed63a6520294`. These are observations of the
public service, not proof that its deployed source equals that baseline.

The selection was recorded in [sampling-plan.json](sampling-plan.json) before
requests. All four rows from each of three strata were retained: newest classic
raster, oldest classic raster, and newest classic HTML/SVG candidates. The
result has 12 unique stamps: eight PNG and four HTML. JPEG, GIF, WebP and SVG
coverage was not established by these returned records; the sample is stratified
and deliberately small, and cannot estimate whole-site format prevalence.

Seven public API GETs and eight existing raster-file GETs were made, serially,
without credentials, retries, redirects, generation, refresh or content-route
requests. Each request had a 5-second connection timeout, 15-second total curl
timeout, a 2 MiB curl body limit and an OS file-size limit. Saved JSON is the
decoded body; HTTP Content-Length may describe compressed bytes instead.
Request metadata contains exact URLs, UTC time, status, timing and body SHA-256;
headers and raw bodies are adjacent. [sample-manifest.json](sample-manifest.json)
records selection, media checks, comparisons and request summaries.

## API shape and identifiers

All successful API reads returned HTTP 200 and JSON with `API-Version: 2.3` and
`X-API-Version-Used: 2.3` after requesting `API-Version: 2.3`. A separate repeated
`X-API-Version: v2.2.7` header was also present; it is not a reliable description
of the selected response shape.

- List: `{ data: Stamp[], last_block, metadata, page, limit, totalPages, total }`.
- Detail: `{ last_block, data: { stamp: Stamp } }`.
- Observed invalid page `page=0`: HTTP 400 with
  `{ error: "Invalid page parameter", status: "error", code: "BAD_REQUEST" }`.

Rows contain `stamp`, `cpid`, `tx_hash`, `creator`, nullable `creator_name`,
`block_index`, `tx_index`, ISO `block_time`, `ident`, `stamp_url`,
`stamp_mimetype`, `supply`, `locked`, `divisible`, nullable `keyburn`,
`file_size_bytes`, `stamp_hash`, `file_hash` and optional market enrichment.
Detail additionally includes `stamp_base64`; the explorer should ignore this
field and reject oversized responses while streaming rather than trusting it.

Stamp number **0** and transaction index **0** are real. Do not use truthiness
as their validity check. `cpid` is an A-prefixed string containing digits beyond
JavaScript's integer precision; preserve the string. Hashes and creator
addresses remain strings. Observed `supply` values are small JSON numbers, so
this sample does not prove upstream fidelity for quantities beyond the safe
integer range. An adapter must retain safe decimal strings and reject unsafe
numeric values rather than inventing precision.

List `locked`/`divisible` flags are numeric 0/1; the matching detail uses boolean
false/true. Normalize only accepted boolean/0/1 representations; `keyburn: null`
remains unavailable. Newer rows have `market_data: null` and an explanatory
message. Older rows contain both snake-case `market_data` and camel-case
`marketData`, including genuine zero volume, null prices and `outdated` cache
status. Do not coerce absent enrichment or null prices to zero. No trading or
volume feature is required by the two-page proof.

## Filter, sort, pagination and freshness

The explicit lowercase `filetype=png,jpg,gif,webp` filter returned only PNG rows;
`filetype=html,svg` returned only HTML rows. This demonstrates these sample
responses, not every enum member or compound-filter contract. All calls used
`type=classic`; other type filters remain unverified.

With the same raster filter and `limit=4`, DESC page 1 returned
`[1507273,1467205,1467163,1457949]`; page 2 returned
`[1384307,1384306,1384305,1383565]`. The two pages were disjoint, each had
descending transaction indexes, and both reported total 24,634 / 6,159 pages.
ASC page 1 returned stamps `[0,1,2,3]` with ascending transaction indexes and the
same raster total. HTML/SVG candidates reported total 882 / 221 pages. Page
membership comes from the server; reversing a rendered page is not global ASC
pagination. There is no snapshot or cursor observed. Offset-page stability as
new stamps arrive, complete missing/duplicate detection, and arbitrary filter
combinations remain unproved.

Source inspection at the baseline shows `getPaginationParams` defaulting to
500 for this path, maximum 1,000, and `page >= 1`; the explorer must always set
a small explicit integer limit/page. These limits were not stress-tested.
`validateSortDirection` accepts ASC/DESC case-insensitively and defaults to DESC.
The controller defaults the ordering column to `tx_index`.

All sampled responses advertised `last_block: 974385`. No independent tip or
indexer health endpoint was checked. `metadata.cacheStatus` was `unknown`, and
`metadata.source: cached` accompanies BTC-price metadata; it must not be
presented as verified indexer provenance or freshness. Older market enrichment
had a 1 November timestamp and `outdated` status. API response cache directives
combined `immutable, max-age=31536000` and `max-age=86400` with differing stale
windows; their duplication prevents a clear freshness promise. Cloudflare
reported DYNAMIC for the sampled API requests. Record retrieval time and
reported indexed block separately, with freshness unknown.

Rate-limit headers advertised a limit of 100 and remaining 99. The reset value
looked like a millisecond timestamp; neither its unit nor the quota's scope or
enforcement was established. These are not a service agreement. Data-service
ownership, sustained capacity, permission, ongoing costs, support and cache
invalidation behavior still require operational confirmation.

## Existing raster media

All eight preselected PNG URLs returned HTTP 200, `image/png`, no redirects,
valid PNG signatures and successful full decoding with Pillow 12.1.1. They are
5×5 through 84×84 pixels; downloaded bodies were 79–1,202 bytes. Their existing
`https://stampchain.io/stamps/<64-hex>.png` URLs were used directly. The proof
may proxy only an allowlisted HTTPS stamp URL with strict type, signature,
dimensions and response-size bounds; it must not proxy arbitrary URLs.

The four HTML records were intentionally unsupported and their originals were
not requested or executed. No static previews were verified for them. Their
safe presentation is an explicit placeholder, not an automatic call to the
legacy preview endpoint. No missing raster asset happened to appear in this
sample; missing/redirect/invalid-body fallbacks still require controlled
fixtures. These checks do not prove browser rendering or broad media coverage.

CDN bodies are not byte-identical to API base64 originals. For stamp 1507273,
the source describes 517 bytes and the served PNG has 227 bytes, with identical
24×24 decoded RGBA pixels. For stamp 0 the source describes 85 bytes and the
served PNG has 79 bytes: RGB values beneath four fully transparent pixels
differ, while composition over both black and white is identical. Both have
the expected 5×5 dimensions. Do not require served byte size or checksum to
equal the original metadata without an explicit content-transformation contract.

Across the full selection, eight raster files are verified and four active
originals are intentionally unsupported (8/12 versus 4/12). This ratio belongs
only to this deliberately stratified sample. Whether the browsing experience
with those placeholders is acceptable requires the owner's design review.

## Source-data comparison and reproducibility

The two matching detail reads, stamps 1507273 and 0, exactly match their list
rows on stamp, CPID, transaction hash, creator/name, media URL/MIME, block/index,
time and supply. Both locked/divisible flags match after normalization.
`sample-manifest.json` records each comparison. This establishes sample mapping
fidelity, not independent chain or indexer correctness.

`collect_sample.py lists`, `details`, and `media` reproduce the bounded public
reads; they overwrite the corresponding evidence files and may select different
records when the service changes. `analyze_sample.py` is an offline inspection
using Pillow; it verifies existing bodies and regenerates the manifest without
network access. Source-to-implemented-adapter comparison remains a separate
check after the adapter is available. The timings are single request samples,
not repeated performance measurements or hosting-capacity evidence.
