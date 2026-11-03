import { createAdapter } from "./adapter.ts";

const mode = Deno.env.get("EXPLORER_DATA_MODE") ?? "live";
if (mode !== "live" && mode !== "fixture") {
  throw new Error("EXPLORER_DATA_MODE must be live or fixture");
}

export const adapter = createAdapter({
  mode,
  ...(mode === "fixture"
    ? {
      fixtureData: JSON.parse(
        Deno.readTextFileSync(
          new URL("../fixtures/stamps.json", import.meta.url),
        ),
      ),
    }
    : {}),
});

export const dataMode = mode;
