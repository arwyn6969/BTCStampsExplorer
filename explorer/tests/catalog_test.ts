import {
  deepStrictEqual,
  notStrictEqual,
  strictEqual,
  throws,
} from "node:assert";
import { createCatalog } from "../lib/catalog.ts";

const rawCatalog = JSON.parse(
  Deno.readTextFileSync(new URL("../fixtures/catalog.json", import.meta.url)),
);
const rawStamps = JSON.parse(
  Deno.readTextFileSync(new URL("../fixtures/stamps.json", import.meta.url)),
);

Deno.test("catalog exact search resolves zero, CPID and transaction identifiers", () => {
  const catalog = createCatalog(rawCatalog, rawStamps);
  const first = catalog.stamp("0")!;
  for (const query of ["0", "#0", "stamp 0", first.cpid, first.txHash]) {
    deepStrictEqual(catalog.search(query).stamps.map((stamp) => stamp.id), [
      "0",
    ]);
  }
  strictEqual(first.cpid, "A7337447728884561000");
  strictEqual(catalog.stamp("unknown"), null);
  strictEqual(catalog.search("not-in-the-sample").stamps.length, 0);
  strictEqual(catalog.search(" ").profiles.length, 0);
  strictEqual(catalog.search("a".repeat(101)).profiles.length, 0);
});

Deno.test("public usernames resolve to canonical addresses and captured creations", () => {
  const catalog = createCatalog(rawCatalog, rawStamps);
  const profile = catalog.profile("tonynl")!;
  strictEqual(profile.address, "bc1qnu8rmy42tw2tkr25d4tw6uppmprxlfd49fvepg");
  deepStrictEqual(catalog.profile(profile.address), profile);
  strictEqual(catalog.search("TONY").profiles[0].username, "TonyNL");
  strictEqual(
    catalog.search(profile.address).profiles[0].address,
    profile.address,
  );
  strictEqual(catalog.search("ARWYN").profiles[0].username, "Arwyn");
  deepStrictEqual(catalog.created(profile.address).map((stamp) => stamp.id), [
    "1467163",
    "1457949",
  ]);
  strictEqual(catalog.profile("unknown-user"), null);
});

Deno.test("holdings distinguish unavailable from a known empty demo sample", () => {
  const catalog = createCatalog(rawCatalog, rawStamps);
  strictEqual(catalog.held("Mike in Space"), null);
  strictEqual(catalog.held("unknown-user"), null);
  deepStrictEqual(catalog.held("17hhaQLGEBNMBxruLYEA2aeW473n8YNEZ5"), []);
  strictEqual(catalog.held("TonyNL")![0].quantity, "2");
  strictEqual(catalog.held("stamper.btc")!.length, 14);
});

Deno.test("collection membership references the same captured stamp identities", () => {
  const catalog = createCatalog(rawCatalog, rawStamps);
  strictEqual(catalog.collections("html")[0].id, "html-playground");
  deepStrictEqual(catalog.collection("empty-example")!.stampIds, []);
  strictEqual(catalog.collection("archive-sampler")!.stampIds.length, 16);
  strictEqual(catalog.collectionsForStamp("0").length, 2);
  strictEqual(catalog.collectionsForProfile("Arwyn")[0].id, "pixel-origins");
  strictEqual(catalog.collection("missing"), null);
  for (const collection of catalog.collections()) {
    for (const id of collection.stampIds) {
      strictEqual(catalog.stamp(id)!.id, id);
    }
  }
});

Deno.test("market samples preserve per-unit satoshis and separate sale from transfer", () => {
  const catalog = createCatalog(rawCatalog, rawStamps);
  const listing = catalog.listings({ stampId: "1505513", status: "open" })[0];
  strictEqual(listing.priceSats, "2100");
  strictEqual(listing.available, "3");
  for (const item of catalog.listings({ status: "closed" })) {
    strictEqual(item.status, "closed");
    strictEqual(item.available, "0");
  }
  for (const item of catalog.activity({ kind: "transfer" })) {
    strictEqual(item.kind, "transfer");
    strictEqual(item.priceSats, null);
  }
  strictEqual(
    catalog.activity({ kind: "sale", stampId: "1462443" })[0].priceSats,
    null,
  );
  strictEqual(catalog.activity({ stampId: "missing" }).length, 0);
});

Deno.test("catalog quantities remain exact and returned records cannot mutate source", () => {
  const input = structuredClone(rawCatalog);
  input.profiles[0].holdings[0].quantity = "9007199254740993.00000001";
  input.listings[0].priceSats = "9007199254740993";
  const catalog = createCatalog(input, rawStamps);
  strictEqual(
    catalog.held(input.profiles[0].address)![0].quantity,
    "9007199254740993.00000001",
  );
  strictEqual(catalog.listings()[0].priceSats, "9007199254740993");
  const profile = catalog.profile("TonyNL")!;
  profile.username = "changed";
  strictEqual(catalog.profile("TonyNL")!.username, "TonyNL");
  const stamp = catalog.stamp("0")!;
  stamp.cpid = "changed";
  notStrictEqual(catalog.stamp("0")!.cpid, "changed");
});

Deno.test("catalog rejects unlabelled data, invalid money and dangling references", () => {
  for (
    const mutate of [
      (input: typeof rawCatalog) => input.source = "live",
      (input: typeof rawCatalog) =>
        input.profiles[0].holdings[0].stampId = "missing",
      (input: typeof rawCatalog) =>
        input.collections[0].creatorAddresses[0] = "1UnknownAddress1234567890",
      (input: typeof rawCatalog) => input.collections[0].stampIds.push("0"),
      (input: typeof rawCatalog) => input.listings[0].priceSats = 0.000021,
      (input: typeof rawCatalog) => input.listings[0].available = "-1",
      (input: typeof rawCatalog) => input.listings[0].status = "closed",
      (input: typeof rawCatalog) =>
        input.activity.find((item: { kind: string }) =>
          item.kind === "transfer"
        ).priceSats = "100",
    ]
  ) {
    const input = structuredClone(rawCatalog);
    mutate(input);
    throws(() => createCatalog(input, rawStamps));
  }
});
