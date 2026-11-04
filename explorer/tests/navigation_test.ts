import { strictEqual } from "node:assert";
import { contextBack, contextBackLabel } from "../lib/navigation.ts";

Deno.test("contextual Back retains public browsing state", () => {
  for (
    const path of [
      "/search?q=TonyNL",
      "/wallet/TonyNL?view=held&page=2",
      "/collections?q=pixel&page=1",
      "/collection/pixel-origins?page=2",
      "/marketplace?status=open&page=1",
      "/activity?kind=transfer&page=1",
    ]
  ) strictEqual(contextBack(path), path);
  strictEqual(contextBackLabel("/search?q=test"), "Back to search");
  strictEqual(contextBackLabel("/wallet/TonyNL"), "Back to profile");
});

Deno.test("contextual Back rejects external and privileged targets", () => {
  for (
    const path of [
      null,
      "//evil.example/search",
      "https://evil.example/search",
      "/\\evil.example/search",
      "/api/v2/stamp/1/preview?refresh=true",
      "/admin",
      "/search?next=https://evil.example",
      "/search?q=" + "a".repeat(101),
      "/search#run",
      "/wallet/../admin",
      "/search\n?q=test",
    ]
  ) strictEqual(contextBack(path), null);
});
