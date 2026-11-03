# Explorer staging: prepared Render setup

Prepared 3 November 2026. Staging means a public preview on a separate
`onrender.com` address, where the owner can review the explorer before any
production release. It uses the existing read API and static raster originals.
The existing Stampchain domain and routing stay in place.

**Status: configuration prepared; no Render service or staged deployment is
claimed.** Account access, billing settings, the first Docker build, staged
checks, and rollback remain unverified. No database, disk, secret,
administrative credential, wallet connection, or new backend is required by this
configuration.

## Configuration to review

[explorer/render.yaml](../../explorer/render.yaml) defines one Free Docker web
service in Frankfurt, using the repository root as its build context. Its
environment contains only live-data mode, the listening host, and port 8007.
Docker keeps Deno 2.6.9 and the restricted production command.

The source must be **arwyn6969/BTCStampsExplorer**, branch
**codex/explorer-proof**. The fork's older default `dev` branch is unsuitable;
choose the proof branch explicitly in both the Blueprint setup and service
settings. These fields and manual service deployment are supported by the
[Blueprint reference](https://render.com/docs/blueprint-spec).

Health checks use `/robots.txt`, a local static response that does not call the
API. Render accepts successful HTTP responses and redirects, but a healthy
static route does not prove live integration.
[Health-check behavior](https://render.com/docs/health-checks).

## Before creating the preview

1. Connect the intended Render account and owner GitHub fork. Confirm the
   workspace, payment-method status, current included usage, and service plan in
   the native Render dashboard. Keep compute on **Free** and review the
   workspace's existing subscription independently.
2. Inspect the pipeline spend limit under Workspace Settings → Build Pipeline.
   This limit covers pipeline minutes; it is not a global bandwidth spending
   cap. With a payment method, excess pipeline usage and bandwidth can incur
   charges. Without one, Render documents suspending the relevant free services
   or builds instead. Confirm acceptable account-level cost controls before
   creating anything; this file does not promise an entirely zero-cost account.
   [Pipeline controls](https://render.com/docs/build-pipeline),
   [bandwidth billing](https://render.com/docs/outbound-bandwidth),
   [Free-service limits](https://render.com/docs/free).
3. Confirm the reviewed configuration commit is present on the proof branch. The
   application baseline is `4ff242c9a4d6c27878cfaec5c8d7253fcd8a52bf`; a later
   configuration-only commit should be recorded separately. Inspect its diff
   before selecting that commit for deployment. This preparation does not
   authorize a main merge or domain cutover.

## Create the staging service when access and deployment are authorized

1. In Render, choose **New → Blueprint**, connect the owner fork, and select
   `codex/explorer-proof`. Set **Blueprint Path** to `explorer/render.yaml`.
2. Review the proposed changes: exactly one Free web service, the correct fork
   and branch, Frankfurt, Dockerfile `explorer/Dockerfile`, root build context,
   and no added databases, disks, domains, or secrets. Applying **Deploy
   Blueprint** creates the service and initiates its first deployment; merely
   opening the review does not establish a deployed result.
3. Set the Blueprint's **Auto Sync** to **No**, and confirm the service's
   **Auto-Deploy** remains **Off**. These are separate controls: disabling
   commit-triggered service deploys does not disable automatic Blueprint
   configuration updates. Subsequent changes require a deliberate manual sync or
   deploy.
   [Blueprint setup and sync controls](https://render.com/docs/infrastructure-as-code).
4. Record the actual service URL, service/deploy identifiers, selected commit,
   and build/start logs. Use **Manual Deploy → Deploy a specific commit** for
   subsequent reviewed builds. Keep the Docker command unchanged. The Docker
   build creates a new artifact; record its identity rather than claiming that
   the existing local archive was deployed.
   [Manual commit deployment](https://render.com/docs/deploys#deploying-a-specific-commit).

## Evidence to collect on that hostname

- Verify `/robots.txt` and the default explorer redirect, then demonstrate the
  same filter/sort → stamp detail → Back task at desktop/mobile sizes. Confirm
  both the PNG default and the explicit all-formats view.
- Repeat the route/method, header, rendered-HTML, and media checks represented
  by `explorer/scripts/check-capabilities.ts` against the staged hostname using
  a separate staging check harness. That script is intentionally fixed to
  localhost; its existing passing output is local evidence only.
- Capture the deployed commit, browser results, media decoding/fallbacks,
  sampled source comparison, and performance with device/network/cache
  conditions. Keep failed or interrupted results alongside later corrections.
- Confirm noindex headers and robots exclusion on the live preview. The URL is
  public; noindex does not make it private. Add no custom domain or production
  DNS change.
- Record owner design feedback and an unfamiliar reviewer's task result before
  declaring E04 complete or expanding routes.

Free services idle after 15 minutes and may take about a minute to wake. Measure
that provider wake-up separately from a warm page request. A `/robots.txt`
response while the service is idle can be served by Render without waking the
application; it does not establish a successful cold explorer request.
[Free-service behavior](https://render.com/docs/free).

## Demonstrate staging rollback

Keep two successful, identified staged artifacts: A as the tested rollback
target and B as the current candidate. Record each provider deploy ID and
commit. A restart or rebuild of the same local source is not this demonstration.

With B active, use the service's Deploys page to roll back to A's retained
artifact. Confirm A is live, rerun the core journey and capability checks, and
save the results. Record environment/settings separately because rollback does
not replace every configuration value. Free services retain only their two most
recent previous deploys for rollback, so confirm A remains available before the
exercise. [Render rollback behavior](https://render.com/docs/rollbacks),
[Free rollback retention](https://render.com/docs/free).

If only one artifact has been staged, record rollback as pending. The unchanged
local package remains a separate artifact: SHA-256
`c39b0e79d0078794a4bd47bbd4edf0b9a8f9213d3696f90ac1f56dd4a7dbafef`, 80,847
bytes, application revision `4ff242c9a4d6c27878cfaec5c8d7253fcd8a52bf`, Fresh
build ID `c64f227ca3bee1273bc6b19e1e0a39c313805d75`.

## Validation recorded for this preparation

The fields were checked against Render's official documentation and the
[published Blueprint JSON Schema](https://render.com/schema/render.yaml.json) on
3 November 2026. Local schema validation checks structure only; it cannot verify
fork permissions, account eligibility, cost controls, Docker build success,
service availability, or staging acceptance.

Local validation passed with PyYAML and `jsonschema.Draft202012Validator`, plus
explicit checks for the single Free service, exact owner fork/branch, manual
deploy setting, root context, static health route, and three non-secret
environment values. The downloaded official schema's SHA-256 was
`8a3fb8da6b4f55fe686fbefa790e011d3dd7895f013f355953c572a21ab6494a`.
