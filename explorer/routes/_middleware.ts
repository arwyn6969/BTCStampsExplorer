import type { MiddlewareHandlerContext } from "$fresh/server.ts";

const sourceRevision = Deno.env.get("EXPLORER_REVISION") ?? "unknown";
const revision = /^[a-f0-9]{40}$/.test(sourceRevision)
  ? sourceRevision
  : "unknown";
const dataMode = Deno.env.get("EXPLORER_DATA_MODE") ?? "live";

const routes = [
  /^\/explorer\/?$/,
  /^\/stamp\/[^/]+\/?$/,
  /^\/media\/[a-f0-9]{64}\.(?:png|jpg|jpeg|gif|webp)$/,
  /^\/media\/preview-(?:0|[1-9]\d{0,15}|-[1-9]\d{0,15})\.png$/,
  /^\/(?:style\.css|app\.js|logo\.svg|robots\.txt)$/,
  /^\/_frsh\/[a-zA-Z0-9_./-]+$/,
];

export async function handler(req: Request, ctx: MiddlewareHandlerContext) {
  let response: Response;
  const path = new URL(req.url).pathname;
  if (req.method !== "GET" && req.method !== "HEAD") {
    response = new Response("Method not allowed", {
      status: 405,
      headers: { Allow: "GET, HEAD" },
    });
  } else if (!routes.some((route) => route.test(path))) {
    response = new Response("Not found", { status: 404 });
  } else {
    response = await ctx.next();
  }
  response.headers.set(
    "Content-Security-Policy",
    response.headers.get("content-type")?.startsWith("image/")
      ? "sandbox; default-src 'none'; frame-ancestors 'none'"
      : "default-src 'none'; img-src 'self'; style-src 'self'; script-src 'self'; connect-src 'none'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'",
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Explorer-Revision", revision);
  response.headers.set("X-Explorer-Data-Mode", dataMode);
  return response;
}
