import { test } from "node:test";
import assert from "node:assert/strict";
import { buildProductFilter, buildSort, decodeHtmlEntities } from "./filters.ts";

test("buildProductFilter: category + attribute + price", () => {
  const f = buildProductFilter(
    { color: "49,52", price: "20_30", sort: "x", page: "2" },
    "MjA=",
  );
  assert.deepEqual(f.category_uid, { eq: "MjA=" });
  assert.deepEqual(f.color, { in: ["49", "52"] });
  assert.deepEqual(f.price, { from: "20", to: "30" });
  assert.equal("sort" in f, false);
  assert.equal("page" in f, false);
});

test("buildProductFilter: empty", () => {
  assert.deepEqual(buildProductFilter({}), {});
});

test("buildSort: maps fields/direction", () => {
  assert.deepEqual(buildSort("price_DESC"), { price: "DESC" });
  assert.deepEqual(buildSort("name_ASC"), { name: "ASC" });
  assert.deepEqual(buildSort(""), {});
  assert.deepEqual(buildSort(undefined), {});
});

test("decodeHtmlEntities: named, numeric, and passthrough", () => {
  assert.equal(
    decodeHtmlEntities("Cocona&reg; performance fabric"),
    "Cocona® performance fabric",
  );
  assert.equal(decodeHtmlEntities("Tees &amp; Tanks"), "Tees & Tanks");
  assert.equal(decodeHtmlEntities("&quot;Zip&quot; &apos;Up&apos;"), "\"Zip\" 'Up'");
  assert.equal(decodeHtmlEntities("&#174; &#x2122;"), "® ™");
  assert.equal(decodeHtmlEntities("&frac14; zip"), "¼ zip");
  // unknown/malformed entities pass through untouched
  assert.equal(decodeHtmlEntities("&bogus; &#; A&B"), "&bogus; &#; A&B");
  assert.equal(decodeHtmlEntities("plain label"), "plain label");
});
