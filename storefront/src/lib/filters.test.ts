import { test } from "node:test";
import assert from "node:assert/strict";
import { buildProductFilter, buildSort } from "./filters.ts";

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
