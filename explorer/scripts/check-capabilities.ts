// Read-only HTTP checks against the local proof server only.
const BASE = "http://127.0.0.1:8007";
const expectedRoutes = [
  "./routes/_404.tsx",
  "./routes/_500.tsx",
  "./routes/_app.tsx",
  "./routes/_middleware.ts",
  "./routes/explorer.tsx",
  "./routes/media/[asset].ts",
  "./routes/stamp/[id].tsx",
].sort();
const report: {
  capturedAtUtc: string;
  scope: string;
  target: string;
  manifest?: unknown;
  cases: Record<string, unknown>[];
  pass: boolean;
  error?: string;
} = {
  capturedAtUtc: new Date().toISOString(),
  scope:
    "Local production-build checks; this does not establish a staging deployment",
  target: BASE,
  cases: [],
  pass: true,
};

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
  const sourceAttributes = [
    ...html.matchAll(/\b(?:src|srcdoc)\s*=\s*["']([^"']*)["']/gi),
  ];
  const methods = [
    ...html.matchAll(/<form\b[^>]*\bmethod\s*=\s*["']([^"']+)["']/gi),
  ];
  return {
    noGeneratorReferences:
      !/\/api\/v2\/stamp\/[^\s"'<>]*\/preview|[?&](?:amp;)?refresh=/i.test(
        html,
      ),
    noActiveArtworkFrames: !/<(?:iframe|object|embed)\b/i.test(html),
    noInlineHandlers: !/\s+on[a-z]+\s*=/i.test(html),
    noJavascriptLinks: !/\bhref\s*=\s*["']\s*javascript:/i.test(html),
    sameOriginSources: sourceAttributes.every((match) =>
      match[1].startsWith("/") && !match[1].startsWith("//")
    ),
    noWalletControls:
      !/connect\s+wallet|sign\s+(?:transaction|psbt)|broadcast\s+(?:transaction|psbt)/i
        .test(html),
    getOnlyForms: methods.every((match) => match[1].toLowerCase() === "get"),
  };
}

async function request(
  path: string,
  method: "GET" | "POST",
  expected: number,
  inspectHtml = false,
  expectedLocation?: string,
): Promise<string> {
  const url = new URL(path, BASE);
  if (url.origin !== BASE) throw new Error("Nonlocal check rejected");
  const response = await fetch(url, {
    method,
    redirect: "manual",
    credentials: "omit",
    signal: AbortSignal.timeout(10_000),
  });
  const body = await response.text();
  const checks = {
    status: response.status === expected,
    ...securityHeaders(response),
    ...(inspectHtml ? htmlChecks(body) : {}),
    ...(expectedLocation
      ? {
        redirectLocation: response.headers.get("Location") === expectedLocation,
      }
      : {}),
    ...(method === "POST"
      ? { methodAllowlist: response.headers.get("Allow") === "GET, HEAD" }
      : {}),
  };
  const pass = Object.values(checks).every(Boolean);
  report.pass &&= pass;
  report.cases.push({
    path,
    method,
    expectedStatus: expected,
    actualStatus: response.status,
    headers: {
      contentType: response.headers.get("Content-Type"),
      csp: response.headers.get("Content-Security-Policy"),
      robots: response.headers.get("X-Robots-Tag"),
      nosniff: response.headers.get("X-Content-Type-Options"),
      allow: response.headers.get("Allow"),
      location: response.headers.get("Location"),
    },
    checks,
    pass,
  });
  return body;
}

try {
  const manifest = await Deno.readTextFile(
    new URL("../fresh.gen.ts", import.meta.url),
  );
  const routes = [...manifest.matchAll(/^\s*"(\.\/routes\/[^"\n]+)":/gm)]
    .map((match) => match[1]).sort();
  const manifestPass =
    JSON.stringify(routes) === JSON.stringify(expectedRoutes) &&
    /islands:\s*\{\s*\}/.test(manifest);
  report.manifest = {
    routes,
    expectedRoutes,
    noIslands: /islands:\s*\{\s*\}/.test(manifest),
    pass: manifestPass,
  };
  report.pass &&= manifestPass;

  const defaultView = "/explorer?type=all&format=png&sort=newest&page=1";
  await request("/explorer", "GET", 302, false, defaultView);
  for (
    const path of [
      defaultView,
      "/explorer?type=all&format=all&sort=newest&page=1",
    ]
  ) {
    const list = await request(path, "GET", 200, true);
    const detail = /href="(\/stamp\/-?\d+(?:\?[^"<>]*)?)"/.exec(list)?.[1];
    if (!detail) throw new Error("Explorer has no canonical stamp detail link");
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
  await request("/explorer", "POST", 405);
} catch (error) {
  report.pass = false;
  report.error = error instanceof Error ? error.message : String(error);
}

console.log(JSON.stringify(report, null, 2));
if (!report.pass) Deno.exit(1);
