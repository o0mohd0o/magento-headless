import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanMessage, fail } from "./errors.ts";

test("cleanMessage: strips the transport prefix", () => {
  assert.equal(
    cleanMessage(new Error("Magento GraphQL error: The coupon code isn't valid.")),
    "The coupon code isn't valid.",
  );
});

test("cleanMessage: maps auth failures to a session message", () => {
  assert.equal(
    cleanMessage(new Error("Magento GraphQL error: The current customer isn't authorized.")),
    "Your session has expired. Please sign in again.",
  );
});

test("cleanMessage: maps HTTP 5xx and network errors to a store-unavailable message", () => {
  const copy = "The store is temporarily unavailable. Please try again in a moment.";
  assert.equal(cleanMessage(new Error("Magento GraphQL HTTP 502: <html>")), copy);
  assert.equal(cleanMessage(new TypeError("fetch failed")), copy);
});

test("cleanMessage: reCAPTCHA failures get user copy", () => {
  assert.equal(
    cleanMessage(new Error("Magento GraphQL error: ReCaptcha validation failed, please try again")),
    "We couldn't verify that you're human. Please try again.",
  );
});

test("cleanMessage: never returns an empty string", () => {
  assert.equal(cleanMessage(new Error("")), "Something went wrong. Please try again.");
  assert.equal(cleanMessage(undefined), "Something went wrong. Please try again.");
  assert.equal(cleanMessage("Magento GraphQL error: "), "Something went wrong. Please try again.");
});

test("fail: wraps into the shared ActionResult shape", () => {
  assert.deepEqual(fail(new Error("Magento GraphQL error: Nope")), { ok: false, error: "Nope" });
});
