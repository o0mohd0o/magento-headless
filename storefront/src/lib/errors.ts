/**
 * Shared Server Action result shapes and GraphQL error normalisation.
 *
 * Every action that is called imperatively (not through useActionState)
 * returns `ActionResult`; useActionState-driven forms return `FormState`.
 * Raw Magento messages never reach the UI without passing through
 * `cleanMessage`, which strips transport prefixes and maps known backend
 * internals to safe user copy.
 *
 * This module is intentionally free of Next.js imports so it can be unit
 * tested with plain `node --test`.
 */

export type ActionResult = { ok: boolean; error?: string };

export type FormState = { ok?: boolean; error?: string; message?: string };

const TRANSPORT_PREFIX = /^Magento GraphQL (error|HTTP \d+): /;

const GENERIC = "Something went wrong. Please try again.";

/** Known backend phrasings -> user-facing copy. Order matters; first match wins. */
const USER_COPY: [RegExp, string][] = [
  [
    /isn't authorized|is not authorized|not authorized|authorization/i,
    "Your session has expired. Please sign in again.",
  ],
  [
    /recaptcha/i,
    "We couldn't verify that you're human. Please try again.",
  ],
  [
    /HTTP 5\d\d|fetch failed|ECONNREFUSED|ENOTFOUND|returned no data/i,
    "The store is temporarily unavailable. Please try again in a moment.",
  ],
];

export function cleanMessage(e: unknown): string {
  const raw =
    e instanceof Error ? e.message : typeof e === "string" ? e : "";
  if (!raw) return GENERIC;
  for (const [pattern, copy] of USER_COPY) {
    if (pattern.test(raw)) return copy;
  }
  const stripped = raw.replace(TRANSPORT_PREFIX, "").trim();
  return stripped || GENERIC;
}

export function fail(e: unknown): ActionResult {
  return { ok: false, error: cleanMessage(e) };
}

export const NO_CART: ActionResult = {
  ok: false,
  error: "Your cart could not be found.",
};

export const SIGN_IN_REQUIRED: ActionResult = {
  ok: false,
  error: "Please sign in.",
};
