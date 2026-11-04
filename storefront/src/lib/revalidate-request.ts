/**
 * Validation for the on-demand revalidation webhook body. Pure so it can be
 * unit tested; the route handler in app/api/revalidate does the Next calls.
 */

/** Cache tag taxonomy. Reads tag with these; writes and the webhook invalidate them. */
export const TAGS = {
  catalog: "catalog",
  nav: "nav",
  cms: "cms",
  storeConfig: "store-config",
  countries: "countries",
  reviewsMeta: "reviews-meta",
} as const;

export type Tag = (typeof TAGS)[keyof typeof TAGS];

export const productTag = (urlKey: string) => `product:${urlKey}`;
export const categoryTag = (uid: string) => `category:${uid}`;

const STATIC_TAGS = new Set<string>(Object.values(TAGS));
const SCOPED_TAG = /^(product|category):[A-Za-z0-9_=\-.]{1,200}$/;
const PATH = /^\/[A-Za-z0-9_\-./%[\]]*$/;

export type RevalidateRequest = { tags: string[]; paths: string[] };

export type ParseResult =
  | { ok: true; value: RevalidateRequest }
  | { ok: false; error: string };

export function isAllowedTag(tag: string): boolean {
  return STATIC_TAGS.has(tag) || SCOPED_TAG.test(tag);
}

export function parseRevalidateBody(body: unknown): ParseResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Body must be a JSON object." };
  }
  const b = body as { tags?: unknown; paths?: unknown };
  const tags = Array.isArray(b.tags) ? b.tags : [];
  const paths = Array.isArray(b.paths) ? b.paths : [];
  if (!tags.length && !paths.length) {
    return { ok: false, error: "Provide at least one tag or path." };
  }
  if (tags.length + paths.length > 50) {
    return { ok: false, error: "Too many entries (max 50)." };
  }
  for (const t of tags) {
    if (typeof t !== "string" || !isAllowedTag(t)) {
      return { ok: false, error: `Unknown tag: ${String(t)}` };
    }
  }
  for (const p of paths) {
    if (typeof p !== "string" || !PATH.test(p)) {
      return { ok: false, error: `Invalid path: ${String(p)}` };
    }
  }
  return {
    ok: true,
    value: { tags: tags as string[], paths: paths as string[] },
  };
}

/** Constant-time-ish comparison for the bearer secret. */
export function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided || provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
