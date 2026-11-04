import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isAllowedTag,
  parseRevalidateBody,
  productTag,
  secretMatches,
} from "./revalidate-request.ts";

test("isAllowedTag: taxonomy and scoped tags only", () => {
  assert.equal(isAllowedTag("catalog"), true);
  assert.equal(isAllowedTag("store-config"), true);
  assert.equal(isAllowedTag(productTag("radiant-tee")), true);
  assert.equal(isAllowedTag("category:MjA="), true);
  assert.equal(isAllowedTag("cart"), false);
  assert.equal(isAllowedTag("product:"), false);
  assert.equal(isAllowedTag("product:has space"), false);
});

test("parseRevalidateBody: accepts tags and paths", () => {
  const r = parseRevalidateBody({ tags: ["cms"], paths: ["/page/about-us"] });
  assert.deepEqual(r, { ok: true, value: { tags: ["cms"], paths: ["/page/about-us"] } });
});

test("parseRevalidateBody: rejects empty, unknown tags, bad paths, non-objects", () => {
  assert.equal(parseRevalidateBody({}).ok, false);
  assert.equal(parseRevalidateBody(null).ok, false);
  assert.equal(parseRevalidateBody("catalog").ok, false);
  assert.equal(parseRevalidateBody({ tags: ["cart"] }).ok, false);
  assert.equal(parseRevalidateBody({ paths: ["page"] }).ok, false);
  assert.equal(parseRevalidateBody({ paths: ["/a?b=c"] }).ok, false);
  assert.equal(parseRevalidateBody({ tags: Array(51).fill("cms") }).ok, false);
});

test("secretMatches: exact match only", () => {
  assert.equal(secretMatches("abc", "abc"), true);
  assert.equal(secretMatches("abd", "abc"), false);
  assert.equal(secretMatches("ab", "abc"), false);
  assert.equal(secretMatches(null, "abc"), false);
});
