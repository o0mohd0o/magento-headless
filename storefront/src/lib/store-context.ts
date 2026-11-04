import "server-only";
import { cookies } from "next/headers";

export const STORE_COOKIE = "store_code";
export const CURRENCY_COOKIE = "currency_code";

const CODE = /^[A-Za-z0-9_-]{1,32}$/;

export type StoreContext = { store?: string; currency?: string };

/** Accept only safe header-ready codes; anything else is ignored. */
export function sanitizeCode(v: string | undefined | null): string | undefined {
  return v && CODE.test(v) ? v : undefined;
}

/**
 * Store view + display currency chosen by the shopper (StoreSwitcher cookies).
 * Returns {} when no request scope is available (build-time sitemap/robots) or
 * when nothing was chosen, so callers fall back to the env defaults.
 */
export async function getRequestStoreContext(): Promise<StoreContext> {
  try {
    const jar = await cookies();
    return {
      store: sanitizeCode(jar.get(STORE_COOKIE)?.value),
      currency: sanitizeCode(jar.get(CURRENCY_COOKIE)?.value),
    };
  } catch {
    return {};
  }
}
