import { createAdapter } from "./adapter.ts";
import { createCatalog } from "./catalog.ts";

// This review build defaults to fixed demo data; no database is used.
const mode = Deno.env.get("EXPLORER_DATA_MODE") ?? "fixture";
if (mode !== "live" && mode !== "fixture") {
  throw new Error("EXPLORER_DATA_MODE must be live or fixture");
}
const fixtureData = JSON.parse(Deno.readTextFileSync(
  new URL("../fixtures/stamps.json", import.meta.url),
));
export const catalog = createCatalog(
  JSON.parse(Deno.readTextFileSync(
    new URL("../fixtures/catalog.json", import.meta.url),
  )),
  fixtureData,
);
export const adapter = createAdapter({
  mode,
  ...(mode === "fixture" ? { fixtureData } : {}),
});
export const dataMode = mode;
