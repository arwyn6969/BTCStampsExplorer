import { defineConfig } from "$fresh/server.ts";

const hostname = Deno.env.get("EXPLORER_HOST") ?? "127.0.0.1";
if (!["127.0.0.1", "0.0.0.0"].includes(hostname)) {
  throw new Error("Unsupported EXPLORER_HOST");
}
export default defineConfig({ server: { hostname, port: 8007 } });
