// Staging/tunnel-only checks. This script never follows redirects or accepts
// production/custom-domain targets. Keep check-capabilities.ts local-only.
import { MEDIA_MAX_BYTES, serveMedia } from "../lib/media.ts";

const EXPECTED_ROUTES = [
  "./routes/_404.tsx",
  "./routes/_500.tsx",
  "./routes/_app.tsx",
  "./routes/_middleware.ts",
  "./routes/explorer.tsx",
  "./routes/index.ts",
  "./routes/search.tsx",
  "./routes/collections.tsx",
  "./routes/collection/index.ts",
  "./routes/collection/[id].tsx",
  "./routes/wallet/[address].tsx",
  "./routes/marketplace.tsx",
  "./routes/activity.tsx",
  "./routes/help.tsx",
  "./routes/media/[asset].ts",
  "./routes/stamp/[id].tsx",
].sort();
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const MAX_RUN_MS = 120_000;
const DEFAULT_VIEW = "/explorer?type=all&format=png&sort=newest&page=1";

export function parseHostedArguments(args: string[]) {
  if (args.length !== 2 && args.length !== 3) {
    throw new Error(
      "Usage: check-hosted-capabilities.ts https://NAME.onrender.com|https://NAME.trycloudflare.com FULL_COMMIT_SHA [live|fixture]",
    );
  }
  const [target, revision, dataMode = "live"] = args;
  if (dataMode !== "live" && dataMode !== "fixture") {
    throw new Error("Expected data mode must be live or fixture");
  }
  let url: URL;
  try {
    url = new URL(target);
  } catch {
    throw new Error(
      "Target must be an explicit HTTPS Render or Quick Tunnel origin",
    );
  }
  if (
    target !== url.origin || url.protocol !== "https:" || url.username ||
    url.password || url.port || url.search || url.hash ||
    !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.(?:onrender|trycloudflare)\.com$/
      .test(url.hostname)
  ) {
    throw new Error(
      "Only an exact https://NAME.onrender.com or https://NAME.trycloudflare.com origin without credentials, port, path, query or fragment is allowed",
    );
  }
  if (!/^[a-f0-9]{40}$/.test(revision)) {
    throw new Error(
      "Expected revision must be a complete lowercase commit SHA",
    );
  }
  const targetKind = url.hostname.endsWith(".trycloudflare.com")
    ? "quick-tunnel" as const
    : "render" as const;
  return {
    target,
    revision,
    targetKind,
    dataMode: dataMode as "live" | "fixture",
  };
}

function securityHeaders(response: Response): Record<string, boolean> {
  const csp = response.headers.get("Content-Security-Policy") ?? "";
  const robots = response.headers.get("X-Robots-Tag") ?? "";
  return {
    csp: csp.includes("default-src 'none'") &&
      csp.includes("frame-ancestors 'none'"),
    noindex: robots.includes("noindex") && robots.includes("nofollow"),
    nosniff: response.headers.get("X-Content-Type-Options") === "nosniff",
    noCookies: response.headers.get("Set-Cookie") === null,
  };
}

function htmlChecks(html: string): Record<string, boolean> {
  const sources = [
    ...html.matchAll(/\b(?:src|srcdoc)\s*=\s*["']([^"']*)["']/gi),
  ];
  const methods = [
    ...html.matchAll(/<form\b[^>]*\bmethod\s*=\s*["']([^"']+)["']/gi),
  ];
  return {
    htmlDocument: /<!doctype html>/i.test(html) && /<html\b/i.test(html),
    noGeneratorReferences:
      !/\/api\/v2\/stamp\/[^\s"'<>]*\/preview|[?&](?:amp;)?refresh=/i.test(
        html,
      ),
    noActiveArtworkFrames: !/<(?:iframe|object|embed)\b/i.test(html),
    oneCurrentCatalogChoice: [
      ...html.matchAll(
        /<nav\b[^>]*class="catalog-tabs"[^>]*>([\s\S]*?)<\/nav>/g,
      ),
    ].every((match) =>
      (match[1].match(/aria-current="page"/g) ?? []).length === 1
    ),
    noInlineHandlers: !/\s+on[a-z]+\s*=/i.test(html),
    noJavascriptLinks: !/\bhref\s*=\s*["']\s*javascript:/i.test(html),
    sameOriginSources: sources.every((match) =>
      match[1].startsWith("/") && !match[1].startsWith("//")
    ),
    noWalletControls:
      !/connect\s+wallet|sign\s+(?:transaction|psbt)|broadcast\s+(?:transaction|psbt)/i
        .test(html),
    getOnlyForms: methods.every((match) => match[1].toLowerCase() === "get"),
  };
}

export function discoverMediaAsset(html: string): string | null {
  // Fresh AOT appends its own immutable-build cache key. Accept only that
  // exact optional suffix; the subsequent request uses the canonical asset.
  return /(?:^|[\s<])src\s*=\s*(["'])\/media\/([a-f0-9]{64}\.(?:png|jpg|jpeg|gif|webp))(?:\?__frsh_c=[a-f0-9]{40})?\1/
    .exec(html)?.[2] ?? null;
}

async function boundedBody(response: Response): Promise<Uint8Array> {
  const length = response.headers.get("Content-Length");
  if (
    length !== null &&
    (!/^\d+$/.test(length) || Number(length) > MAX_BODY_BYTES)
  ) {
    await response.body?.cancel();
    throw new Error("Staging response exceeded the body-size bound");
  }
  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new Error("Staging response exceeded the body-size bound");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

interface Report {
  capturedAtUtc: string;
  scope: string;
  target: string | null;
  targetKind: "render" | "quick-tunnel" | null;
  expectedRevision: string | null;
  expectedSource: "live" | "fixture";
  limits: Record<string, number>;
  sourceManifest?: unknown;
  cases: Record<string, unknown>[];
  media?: Record<string, unknown>;
  sourceParser?: Record<string, unknown>;
  pass: boolean;
  error?: string;
}

async function run(args: string[]): Promise<Report> {
  const report: Report = {
    capturedAtUtc: new Date().toISOString(),
    scope: "Target not yet validated; no public requests made",
    target: null,
    targetKind: null,
    expectedRevision: null,
    expectedSource: "live",
    limits: {
      requestTimeoutMs: REQUEST_TIMEOUT_MS,
      runTimeoutMs: MAX_RUN_MS,
      responseBytes: MAX_BODY_BYTES,
    },
    cases: [],
    pass: true,
  };
  try {
    const { target, revision, targetKind, dataMode } = parseHostedArguments(
      args,
    );
    report.expectedSource = dataMode;
    report.target = target;
    report.targetKind = targetKind;
    report.scope = targetKind === "quick-tunnel"
      ? "Temporary public HTTPS Quick Tunnel forwarding the production-built proof on the local Mac; not an independently hosted artifact or E04 staging deployment. Local source manifest/parser checks are labelled separately"
      : "Render staging production-build HTTP evidence; local source manifest/parser checks are labelled separately";
    report.expectedRevision = revision;
    const started = performance.now();
    const manifest = await Deno.readTextFile(
      new URL("../fresh.gen.ts", import.meta.url),
    );
    const routes = [...manifest.matchAll(/^\s*"(\.\/routes\/[^"\n]+)":/gm)]
      .map((match) => match[1]).sort();
    const noIslands = /islands:\s*\{\s*\}/.test(manifest);
    const manifestPass =
      JSON.stringify(routes) === JSON.stringify(EXPECTED_ROUTES) && noIslands;
    report.sourceManifest = {
      scope: "Local source inventory; not remote manifest introspection",
      routes,
      expectedRoutes: EXPECTED_ROUTES,
      noIslands,
      pass: manifestPass,
    };
    if (!manifestPass) {
      throw new Error(
        "Local source manifest does not match the reviewed route allowlist",
      );
    }

    const request = async (
      path: string,
      method: "GET" | "POST",
      expected: number,
      inspectHtml = false,
      expectedLocation?: string,
    ) => {
      const url = new URL(path, target);
      if (url.origin !== target) {
        throw new Error("Request escaped the exact staging origin");
      }
      const remaining = MAX_RUN_MS - (performance.now() - started);
      if (remaining <= 0) {
        throw new Error("Hosted capability check exceeded its run-time bound");
      }
      const at = performance.now();
      const response = await fetch(url, {
        method,
        redirect: "manual",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        signal: AbortSignal.timeout(
          Math.max(1, Math.floor(Math.min(REQUEST_TIMEOUT_MS, remaining))),
        ),
      });
      const bytes = await boundedBody(response);
      const actualRevision = response.headers.get("X-Explorer-Revision");
      const actualSource = response.headers.get("X-Explorer-Data-Mode");
      const text = inspectHtml
        ? new TextDecoder("utf-8", { fatal: true }).decode(bytes)
        : "";
      const checks = {
        status: response.status === expected,
        revision: actualRevision === revision,
        source: actualSource === dataMode,
        ...securityHeaders(response),
        ...(inspectHtml
          ? {
            htmlContentType:
              response.headers.get("Content-Type")?.startsWith("text/html") ===
                true,
            ...htmlChecks(text),
          }
          : {}),
        ...(expectedLocation
          ? {
            redirectLocation:
              response.headers.get("Location") === expectedLocation,
          }
          : {}),
        ...(method === "POST"
          ? {
            methodAllowlist: response.headers.get("Allow") === "GET, HEAD",
          }
          : {}),
      };
      const pass = Object.values(checks).every(Boolean);
      report.pass &&= pass;
      report.cases.push({
        path,
        method,
        expectedStatus: expected,
        actualStatus: response.status,
        durationMs: Math.round(performance.now() - at),
        bodyBytes: bytes.byteLength,
        headers: {
          contentType: response.headers.get("Content-Type"),
          csp: response.headers.get("Content-Security-Policy"),
          robots: response.headers.get("X-Robots-Tag"),
          nosniff: response.headers.get("X-Content-Type-Options"),
          allow: response.headers.get("Allow"),
          location: response.headers.get("Location"),
          revision: actualRevision,
          source: actualSource,
        },
        checks,
        pass,
      });
      // Verify identity before probing excluded routes; stop immediately if
      // the target is a different artifact or unexpectedly exposes a route.
      if (!pass) {
        throw new Error(`Staging capability check failed: ${method} ${path}`);
      }
      return { response, bytes, text };
    };

    await request("/explorer", "GET", 302, false, DEFAULT_VIEW);
    let asset: string | null = null;
    for (
      const path of [
        DEFAULT_VIEW,
        "/explorer?type=all&format=all&sort=newest&page=1",
      ]
    ) {
      const list = await request(path, "GET", 200, true);
      const detail = /href="(\/stamp\/-?\d+(?:\?[^"<>]*)?)"/.exec(list.text)
        ?.[1];
      if (!detail) {
        throw new Error("Explorer has no canonical stamp detail link");
      }
      asset ??= discoverMediaAsset(list.text);
      await request(detail.replaceAll("&amp;", "&"), "GET", 200, true);
    }
    const forbidden = [
      "/api/internal/fee-security",
      "/api/internal/src20Background",
      "/api/src20Background",
      "/api/v2/stamp/0/preview",
      "/api/v2/stamp/0/preview?refresh=true",
      "/api/v2/ecx/broadcast",
      "/api/v2/olga/mint",
      "/api/v2/fairmint/compose",
      "/wallet/proof-capability-check",
      "/tool/stamp",
      "/upload",
      "/admin",
      "/content/proof-capability-check",
    ];
    for (const path of forbidden) {
      await request(path, "GET", 404);
      await request(path, "POST", 405);
    }
    await request("/", "GET", 302, false, "/explorer");
    await request("/collection", "GET", 302, false, "/collections");
    await request("/help", "GET", 200, true);
    for (
      const path of [
        "/search",
        "/search?q=TonyNL",
        "/search?q=1505513",
        "/collections",
        "/marketplace?status=open&page=1",
        "/activity?kind=transfer&page=1",
      ]
    ) {
      await request(path, "GET", dataMode === "fixture" ? 200 : 503, true);
      await request(path, "POST", 405);
    }
    if (dataMode === "fixture") {
      await request("/search?q=" + "a".repeat(101), "GET", 400, true);
      await request("/collection/missing-sample", "GET", 404, true);
      await request("/wallet/not-a-real-profile", "GET", 404, true);
    }
    await request("/explorer", "POST", 405);

    if (!asset) {
      throw new Error(
        "No bounded static raster is advertised by the explorer",
      );
    }
    const media = await request(`/media/${asset}`, "GET", 200);
    const mime = media.response.headers.get("Content-Type")?.split(";")[0];
    const parsed = await serveMedia(
      asset,
      "live",
      (() =>
        Promise.resolve(
          new Response(new Uint8Array(media.bytes).buffer, {
            headers: { "Content-Type": mime ?? "" },
          }),
        )) as typeof fetch,
    );
    const parserPass = parsed.status === 200;
    await parsed.body?.cancel();
    const mediaChecks = {
      rasterMime: ["image/png", "image/jpeg", "image/gif", "image/webp"]
        .includes(mime ?? ""),
      bounded: media.bytes.byteLength > 0 &&
        media.bytes.byteLength <= MEDIA_MAX_BYTES,
      directNavigationSandbox:
        media.response.headers.get("Content-Security-Policy")?.includes(
          "sandbox",
        ) === true,
      sameOriginResource:
        media.response.headers.get("Cross-Origin-Resource-Policy") ===
          "same-origin",
      sourceParserAcceptsServedBytes: parserPass,
    };
    report.media = {
      asset,
      bytes: media.bytes.byteLength,
      checks: mediaChecks,
      pass: Object.values(mediaChecks).every(Boolean),
    };
    report.pass &&= Object.values(mediaChecks).every(Boolean);
    await request(`/media/${"0".repeat(64)}.svg`, "GET", 404);
    await request(
      "/media/https%3A%2F%2Fstampchain.io%2Fapi%2Fv2%2Fstamp%2F0%2Fpreview",
      "GET",
      404,
    );

    const parserCases: { name: string; pass: boolean }[] = [];
    for (
      const [name, response] of [
        [
          "HTML disguised as raster",
          new Response("<html><script>alert(1)</script></html>", {
            headers: { "Content-Type": mime ?? "image/png" },
          }),
        ],
        [
          "Mismatched content type",
          new Response(new Uint8Array(media.bytes).buffer, {
            headers: { "Content-Type": "text/html" },
          }),
        ],
        [
          "Upstream redirect",
          new Response(null, {
            status: 302,
            headers: {
              Location: "https://stampchain.io/api/v2/stamp/0/preview",
            },
          }),
        ],
        [
          "Truncated raster",
          new Response(media.bytes.slice(0, 12), {
            headers: { "Content-Type": mime ?? "image/png" },
          }),
        ],
        [
          "Oversized declared body",
          new Response(new Uint8Array([0]), {
            headers: {
              "Content-Type": mime ?? "image/png",
              "Content-Length": String(MEDIA_MAX_BYTES + 1),
            },
          }),
        ],
      ] as const
    ) {
      const result = await serveMedia(
        asset,
        "live",
        (() => Promise.resolve(response)) as typeof fetch,
      );
      parserCases.push({ name, pass: result.status === 502 });
      await result.body?.cancel();
    }
    report.sourceParser = {
      scope:
        "Local reviewed parser with injected responses; no generator/redirect network requests were made",
      cases: parserCases,
      pass: parserCases.every((item) => item.pass),
    };
    report.pass &&= parserCases.every((item) => item.pass);
  } catch (error) {
    report.pass = false;
    report.error = error instanceof Error ? error.message : String(error);
  }
  return report;
}

if (import.meta.main) {
  const report = await run(Deno.args);
  console.log(JSON.stringify(report, null, 2));
  if (!report.pass) Deno.exit(1);
} else {
  Deno.test("media discovery accepts Fresh AOT keys without accepting arbitrary source URLs", () => {
    const asset = `${"7".repeat(64)}.png`;
    const cache = "a".repeat(40);
    for (
      const markup of [
        `<img src="/media/${asset}" />`,
        `<img src="/media/${asset}?__frsh_c=${cache}" />`,
        `<img src='/media/${asset}?__frsh_c=${cache}' />`,
      ]
    ) {
      if (discoverMediaAsset(markup) !== asset) {
        throw new Error("Canonical raster was not discovered in AOT markup");
      }
    }
    for (
      const markup of [
        `<img src="https://evil.invalid/media/${asset}" />`,
        `<img src="//evil.invalid/media/${asset}" />`,
        `<img src="/media/${asset}?url=https://evil.invalid" />`,
        `<img src="/media/${asset}?__frsh_c=short" />`,
        `<img src="/media/${asset}?__frsh_c=${cache}&refresh=true" />`,
        `<img src="/media/${asset}#fragment" />`,
        `<img data-src="/media/${asset}" />`,
        `<img src="/media/${asset}' />`,
      ]
    ) {
      if (discoverMediaAsset(markup) !== null) {
        throw new Error("Noncanonical media source was accepted");
      }
    }
  });
  Deno.test("checker accepts only exact explicit Render or Quick Tunnel HTTPS origins", () => {
    const sha = "a".repeat(40);
    const good = "https://stampchain-proof-test.onrender.com";
    if (parseHostedArguments([good, sha]).target !== good) {
      throw new Error("Valid origin rejected");
    }
    if (parseHostedArguments([good, sha, "fixture"]).dataMode !== "fixture") {
      throw new Error("Fixture mode mislabelled");
    }
    const tunnel = "https://one-two-three.trycloudflare.com";
    if (parseHostedArguments([tunnel, sha]).targetKind !== "quick-tunnel") {
      throw new Error("Valid tunnel origin rejected or mislabelled");
    }
    if (parseHostedArguments([good, sha]).targetKind !== "render") {
      throw new Error("Render origin mislabelled");
    }
    for (
      const target of [
        "https://stampchain.io",
        "https://dev.stampchain.io",
        "http://proof.onrender.com",
        "https://onrender.com",
        "https://proof.onrender.com.evil.invalid",
        "https://proof.extra.onrender.com",
        "https://proof.onrender.com/",
        "https://proof.onrender.com/path",
        "https://proof.onrender.com?query=1",
        "https://proof.onrender.com#fragment",
        "https://user:password@proof.onrender.com",
        "https://proof.onrender.com:443",
        "https://proof.onrender.com:8443",
        "https://PROOF.onrender.com",
        "https://-proof.onrender.com",
        "https://proof-.onrender.com",
        "https://*.onrender.com",
        "https://proof.onrender.com\n",
        "//proof.onrender.com",
        "http://proof.trycloudflare.com",
        "https://trycloudflare.com",
        "https://proof.trycloudflare.com.evil.invalid",
        "https://proof.extra.trycloudflare.com",
        "https://proof.trycloudflare.com/",
        "https://proof.trycloudflare.com/path",
        "https://proof.trycloudflare.com?query=1",
        "https://proof.trycloudflare.com#fragment",
        "https://user:password@proof.trycloudflare.com",
        "https://proof.trycloudflare.com:443",
        "https://proof.trycloudflare.com:8443",
        "https://PROOF.trycloudflare.com",
        "https://-proof.trycloudflare.com",
        "https://proof-.trycloudflare.com",
        "https://*.trycloudflare.com",
        "https://proof.trycloudflare.com\n",
      ]
    ) {
      let rejected = false;
      try {
        parseHostedArguments([target, sha]);
      } catch {
        rejected = true;
      }
      if (!rejected) throw new Error(`Unsafe target accepted: ${target}`);
    }
  });
  Deno.test("hosted checker requires an explicit target, full revision and valid optional mode", () => {
    const target = "https://proof.onrender.com";
    for (
      const args of [
        [],
        [target],
        [target, "unknown"],
        [target, "e013906"],
        [target, "A".repeat(40)],
        [target, "a".repeat(40), "extra"],
      ]
    ) {
      let rejected = false;
      try {
        parseHostedArguments(args);
      } catch {
        rejected = true;
      }
      if (!rejected) throw new Error("Invalid checker arguments accepted");
    }
  });
  Deno.test("hosted checker rejects advertised and streamed oversized bodies", async () => {
    for (
      const response of [
        new Response("x", {
          headers: { "Content-Length": String(MAX_BODY_BYTES + 1) },
        }),
        new Response(new Uint8Array(MAX_BODY_BYTES + 1)),
      ]
    ) {
      let rejected = false;
      try {
        await boundedBody(response);
      } catch {
        rejected = true;
      }
      if (!rejected) throw new Error("Oversized response accepted");
    }
  });
}
