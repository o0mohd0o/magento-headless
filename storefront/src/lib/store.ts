import "server-only";
import { magentoFetch } from "./magento";
import { AVAILABLE_STORES, CURRENCY, STORE_CONFIG } from "./queries";

export type StoreConfig = {
  store_name: string;
  base_currency_code: string;
  base_media_url: string;
  locale: string;
};

export async function getStoreConfig(): Promise<StoreConfig | null> {
  try {
    const { storeConfig } = await magentoFetch<{ storeConfig: StoreConfig }>(
      STORE_CONFIG,
      { revalidate: 3600, tags: ["store-config"] },
    );
    return storeConfig;
  } catch {
    return null;
  }
}

/** BCP-47-ish lang from Magento locale ("en_US" -> "en"). */
export async function getHtmlLang(): Promise<string> {
  const cfg = await getStoreConfig();
  return cfg?.locale ? cfg.locale.split("_")[0] : "en";
}

export type AvailableStore = {
  store_code: string;
  store_name: string;
  locale: string;
  default_display_currency_code: string;
};

export async function getAvailableStores(): Promise<AvailableStore[]> {
  try {
    const { availableStores } = await magentoFetch<{
      availableStores: AvailableStore[];
    }>(AVAILABLE_STORES, { revalidate: 3600, tags: ["store-config"] });
    return availableStores ?? [];
  } catch {
    return [];
  }
}

export async function getCurrencies(): Promise<string[]> {
  try {
    const { currency } = await magentoFetch<{
      currency: { available_currency_codes: string[] };
    }>(CURRENCY, { revalidate: 3600, tags: ["store-config"] });
    return currency?.available_currency_codes ?? [];
  } catch {
    return [];
  }
}
