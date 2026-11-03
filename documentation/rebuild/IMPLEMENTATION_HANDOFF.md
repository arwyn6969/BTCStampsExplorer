# Explorer proof: implementation handoff

Prepared 3 November 2026 after adversarial plan and strategy review. This file
is a brief for the next implementation chat, not evidence that the owner has
already approved implementation or production release. The owner's latest
request was to challenge the plan again before implementation.

## Read before editing

- [Revised delivery plan](PLAN.md)
- [Findings and PR reconciliation](PR_RECONCILIATION.md)
- The repository's AGENTS.md and applicable local instructions.

The actual application repository is:

`/Users/arwynhughes/Documents/ChatGPT/Stampchain/stampchain.io`

Its parent directory also contains a Git repository. Confirm the correct root;
do not accidentally implement in or create a worktree from the parent
repository. The current application checkout has unrelated modified/untracked
files. Keep them intact and work in a suitable isolated checkout from a reviewed
upstream revision. Use a `codex/` branch when creating a branch.

These planning documents are currently untracked. A clean worktree based on main
will not automatically include them. Read/copy only the three documents from
this absolute source directory into the implementation checkout, verify their
contents, and include them with the implementation's documented baseline. Do not
copy the whole dirty checkout or unrelated changes to transfer the brief. If
running remotely, transfer the documents explicitly; local paths alone are not
available in a cloud environment.

## Authorized scope to establish in the next chat

When the owner approves the proof, implement E01-E04 only:

> Explorer list -> filter/sort -> stamp detail -> Back with state preserved.

Start with E01's 1-2-day option check inside the existing proof allowance.
Compare reuse of existing explorer code with an extracted frontend; do not
assume a new application is the best choice. Prefer reuse at similar effort if
the actual deployment boundary can be met. Do not build two polished apps or two
pipelines. Record the observed baseline, a small build/import probe, data/media
contracts, remaining changes and maintenance implications, then select the
approach.

Two page types, one verified read adapter, existing safely served raster
originals or verified static previews with fallbacks, fixtures, and a sampled
live dataset. Address/creator pages, search, collections, and token coverage are
later milestones. The proof must include a reviewable desktop/mobile design,
production-build browser verification, read-only capability checks, and a
staging evidence bundle where hosting access is available. A local fixture demo
is useful progress but is not staging proof.

E01 must record runtime/build/cold-start viability, endpoint availability,
pagination and freshness contracts, data/media ownership, quotas, costs, and
hosting access. Do not silently create a replacement backend or indexer to
bypass missing access. Use the owner fork `arwyn6969/BTCStampsExplorer` for the
proposed independent development track; verify permissions and baseline before
any push. The current local `origin` points to upstream
`stampchain-io/stampchain.io`, not that fork. The fork provides owner-controlled
development in either implementation approach; it is not a commitment to
permanent product divergence.

Baseline the same filter/detail/Back task on today's site and the prototype.
Measure completion, wrong turns and preserved state with the owner and one
unfamiliar reviewer; report timing as directional evidence. One short review and
a bounded correction pass belong inside the proof allowance. Check a small
preselected sample of media and record missing/unsupported coverage honestly.
The plan contains the live one-record API/HEAD observations already collected;
they do not establish complete coverage, rendering, freshness or service
capacity.

## Boundaries

- No wallet connection, signing, broadcast, business-write/admin routes,
  production mutation, main merge, or production cutover in the proof.
- Do not inherit the legacy preview-generation GET route. Consume existing
  safely served raster originals or verified static previews and use
  placeholders; no unnecessary storage-write or administrative credentials in
  the explorer.
- Inspect rendered HTML and browser requests during the reuse/media probes.
  Existing image helpers, preview downloads, and social-image metadata fallbacks
  reference the generation endpoint. Remove local and remote references; test
  missing-preview cases with safe fixtures and intercept forbidden requests
  before dispatch. Restricting the deployed route manifest alone is
  insufficient.
- `DENO_ROLE=web` still imports the full route manifest. Prove a restricted
  entry point, manifest, layout and production package; for a remote-read
  adapter, cold-start without database, Redis, AWS-write or administrative
  credentials. A new page inside the full legacy application does not make the
  server read-only.
- Keep the existing-site safety workstream separate. Inspect its dependency on
  the proof before treating any legacy repair as a blocker or included scope.
- A live sample validates adapter fidelity, not complete indexer correctness.
- The owner chose explorer/browsing first, not stamp-only release scope. Leave
  stamps versus stamps-and-existing-SRC-20 as a later release decision.
- Keep the 4-8 engineering-day allowance provisional; it is not a guarantee of
  elapsed chat time or resolution of external dependencies. Report concrete
  evidence and blockers, and re-estimate after the proof.

## Deliverable

Keep evidence proportional: E01 produces the comparison/decision record and
probes, E02/E03 the working slice and relevant checks, and E04 the full staging
bundle. Do not require a separate deployment for every small ticket.

Return the source revision, exact code changes, checks actually run, desktop and
mobile captures, source-data comparison, deployed route/capability evidence,
performance samples, staging URL if deployed, and known limitations. Demonstrate
simple rollback to a known staging artifact. Record owner design feedback and
independent review before expanding routes. Do not mark the proof complete if
live integration or staging is blocked. At the cap, record continue, bounded
scope change, or stop/re-scope based on the evidence. Do not use another general
audit as a substitute for a blocked or unsuccessful proof.

## Suggested chat setup

Use a new implementation chat in this application project with an isolated
worktree. Keep the audit chat as a decision record. New context is a workflow
choice, not a guarantee of better code; the handoff and checks provide
continuity.

Suggested builder: GPT-6.1 Sol with High reasoning, if available in the picker.
Use GPT-6 Astra with High reasoning for an independent architecture/security
review of concrete changes. These are workload recommendations, not measured
performance results for this repository. Model selection does not replace tests,
browser inspection, or human review of transaction-sensitive changes.

Sources consulted on 3 November 2026:
[OpenAI model selection](https://developers.openai.com/api/docs/guides/model-selection),
[reasoning guidance](https://developers.openai.com/api/docs/guides/reasoning),
and
[Codex worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees).
