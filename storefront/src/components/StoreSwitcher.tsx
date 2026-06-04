import { getAvailableStores, getCurrencies } from "@/lib/store";

/**
 * Store-view + currency switcher. Renders only when the Magento backend exposes
 * more than one store view or currency; inert (renders nothing) on a
 * single-store / single-currency instance.
 */
export default async function StoreSwitcher() {
  const [stores, currencies] = await Promise.all([
    getAvailableStores(),
    getCurrencies(),
  ]);

  if (stores.length <= 1 && currencies.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      {stores.length > 1 && (
        <select
          defaultValue={stores[0].store_code}
          className="rounded-lg border border-gray-300 px-2 py-1"
          aria-label="Store view"
        >
          {stores.map((s) => (
            <option key={s.store_code} value={s.store_code}>
              {s.store_name}
            </option>
          ))}
        </select>
      )}
      {currencies.length > 1 && (
        <select
          defaultValue={currencies[0]}
          className="rounded-lg border border-gray-300 px-2 py-1"
          aria-label="Currency"
        >
          {currencies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
