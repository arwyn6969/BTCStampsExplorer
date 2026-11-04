import { deepStrictEqual, strictEqual } from "node:assert";
import {
  MAX_PAGE,
  parseQuery,
  queryString,
  selectedFormats,
  withPage,
} from "../lib/query.ts";

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
        format: "svg",
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

Deno.test("format checkboxes and comma URLs produce one deterministic selection", () => {
  const repeated = parseQuery(
    new URLSearchParams(
      "format=jpg&format=png&format=jpeg&format=jpg&sort=oldest&page=4",
    ),
  );
  strictEqual(repeated.format, "png,jpg");
  deepStrictEqual(selectedFormats(repeated.format), ["png", "jpg"]);
  strictEqual(
    queryString(repeated),
    "?type=all&format=png,jpg&sort=oldest&page=4",
  );
  const copied = parseQuery(new URLSearchParams(queryString(repeated)));
  deepStrictEqual(copied, repeated);
  strictEqual(withPage(copied, 5).format, "png,jpg");
  strictEqual(
    parseQuery(new URLSearchParams("format=html,png&format=WEBP")).format,
    "png,webp,html",
  );
  strictEqual(
    parseQuery(new URLSearchParams("format=png&format=all")).format,
    "all",
  );
  deepStrictEqual(selectedFormats("all"), []);
});
