import build from "$fresh/dev.ts";
import config from "./fresh.config.ts";

await build(import.meta.url, "./main.ts", config);
