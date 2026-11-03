import { deepStrictEqual, strictEqual } from "node:assert";
import { MAX_PAGE, parseQuery, queryString, withPage } from "../lib/query.ts";

Deno.test("query state round-trips every supported list control", () => {
  const query = {
    type: "posh",
    format: "webp",
    sort: "oldest",
    page: 8,
  } as const;
  const serialized = queryString(query);
  strictEqual(serialized, "?type=posh&format=webp&sort=oldest&page=8");
  deepStrictEqual(parseQuery(new URLSearchParams(serialized)), query);
  deepStrictEqual(withPage(query, 9), { ...query, page: 9 });
  strictEqual(query.page, 8);
});

Deno.test("query state bounds invalid input and drops unknown fields", () => {
  for (
    const page of ["0", "-1", "1.5", "Infinity", "1000001", "99999999", "1e3"]
  ) {
    const query = parseQuery(
      new URLSearchParams({
        page,
        type: "../admin",
        format: "html",
        sort: "RANDOM",
        refresh: "true",
      }),
    );
    deepStrictEqual(query, {
      type: "all",
      format: "all",
      sort: "newest",
      page: 1,
    });
    strictEqual(queryString(query).includes("refresh"), false);
  }
  strictEqual(
    parseQuery(new URLSearchParams(`page=${MAX_PAGE}`)).page,
    MAX_PAGE,
  );
  strictEqual(parseQuery(new URLSearchParams(`page=${MAX_PAGE + 1}`)).page, 1);
  strictEqual(
    withPage(parseQuery(new URLSearchParams("page=100000")), 100001).page,
    100001,
  );
});
