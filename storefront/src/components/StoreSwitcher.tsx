import { getAvailableStores, getCurrencies } from "@/lib/store";
import { getRequestStoreContext } from "@/lib/store-context";
import { STORE_CODE } from "@/lib/magento";
import StoreSwitcherClient from "./StoreSwitcherClient";

/**
 * Store-view + currency switcher. Renders only when the Magento backend exposes
 * more than one store view or currency; inert (renders nothing) on a
 * single-store / single-currency instance. Selections are stored in httpOnly
 * cookies and applied as `Store` / `Content-Currency` headers on every
 * server-side GraphQL call (see lib/magento.ts), which also scopes Next's
 * fetch cache per store/currency.
 */
export default async function StoreSwitcher() {
  const [stores, currencies, ctx] = await Promise.all([
    getAvailableStores(),
    getCurrencies(),
    getRequestStoreContext(),
  ]);

  if (stores.length <= 1 && currencies.length <= 1) return null;

  const currentStore = ctx.store ?? STORE_CODE;
  const currentCurrency =
    ctx.currency ??
    stores.find((s) => s.store_code === currentStore)
      ?.default_display_currency_code ??
    currencies[0] ??
    "";

  return (
    <StoreSwitcherClient
      stores={stores}
      currencies={currencies}
      currentStore={currentStore}
      currentCurrency={currentCurrency}
    />
  );
}
