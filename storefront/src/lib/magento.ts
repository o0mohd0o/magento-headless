import "server-only";

const ENDPOINT = process.env.MAGENTO_GRAPHQL_URL ?? "https://magento.test/graphql";
const STORE = process.env.MAGENTO_STORE_CODE ?? "default";

export type MagentoFetchOptions = {
  variables?: Record<string, unknown>;
  /** Customer bearer token for authenticated calls (optional). */
  token?: string;
  /** Seconds for Next's fetch cache. Omit for always-fresh (no-store). */
  revalidate?: number;
  /** Cache tags for on-demand revalidation. */
  tags?: string[];
  /** Override the Store view header. */
  store?: string;
  /** reCAPTCHA token -> X-ReCaptcha header (when the backend has reCAPTCHA on). */
  recaptchaToken?: string;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

/**
 * Server-only GraphQL transport to Magento.
 * Reads happen in React Server Components (server-to-server, no CORS).
 */
export async function magentoFetch<T>(
  query: string,
  opts: MagentoFetchOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Store: opts.store ?? STORE,
  };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts.recaptchaToken) headers["X-ReCaptcha"] = opts.recaptchaToken;

  const useCache = typeof opts.revalidate === "number";

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables: opts.variables ?? {} }),
    ...(useCache
      ? { next: { revalidate: opts.revalidate, tags: opts.tags } }
      : { cache: "no-store" }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Magento GraphQL HTTP ${res.status}: ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error(
      `Magento GraphQL error: ${json.errors.map((e) => e.message).join("; ")}`,
    );
  }
  if (!json.data) throw new Error("Magento GraphQL returned no data");
  return json.data;
}

export const STORE_CODE = STORE;
