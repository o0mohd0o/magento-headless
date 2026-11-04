"use server";

import { cookies } from "next/headers";
import { getAvailableStores, getCurrencies } from "./store";
import { CURRENCY_COOKIE, STORE_COOKIE, sanitizeCode } from "./store-context";
import { revalidateSession } from "./revalidate";
import type { ActionResult } from "./errors";

const COOKIE = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 365,
};

/** Switch store view. Validated against availableStores so only real codes stick. */
export async function setStoreAction(code: string): Promise<ActionResult> {
  const clean = sanitizeCode(code);
  const stores = await getAvailableStores();
  if (!clean || !stores.some((s) => s.store_code === clean)) {
    return { ok: false, error: "Unknown store view." };
  }
  const jar = await cookies();
  jar.set(STORE_COOKIE, clean, COOKIE);
  // A store view implies its own default currency; drop any explicit override.
  jar.delete(CURRENCY_COOKIE);
  revalidateSession();
  return { ok: true };
}

/** Switch display currency. Validated against the store's allowed currencies. */
export async function setCurrencyAction(code: string): Promise<ActionResult> {
  const clean = sanitizeCode(code);
  const currencies = await getCurrencies();
  if (!clean || !currencies.includes(clean)) {
    return { ok: false, error: "Unknown currency." };
  }
  (await cookies()).set(CURRENCY_COOKIE, clean, COOKIE);
  revalidateSession();
  return { ok: true };
}
