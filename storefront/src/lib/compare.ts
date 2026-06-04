import "server-only";
import { cookies } from "next/headers";
import { magentoFetch } from "./magento";
import { COMPARE_PRODUCTS } from "./queries";

export const COMPARE_COOKIE = "compare_skus";
export const COMPARE_MAX = 4;

export type CompareProduct = {
  uid: string;
  sku: string;
  name: string;
  url_key: string;
  stock_status?: string | null;
  small_image?: { url: string; label?: string | null } | null;
  price_range: { minimum_price: { final_price: { value: number; currency: string } } };
  description?: { html: string } | null;
};

export async function getCompareSkus(): Promise<string[]> {
  const v = (await cookies()).get(COMPARE_COOKIE)?.value;
  return v ? v.split(",").filter(Boolean) : [];
}

export async function getCompareCount(): Promise<number> {
  return (await getCompareSkus()).length;
}

export async function getCompareProducts(): Promise<CompareProduct[]> {
  const skus = await getCompareSkus();
  if (!skus.length) return [];
  try {
    const { products } = await magentoFetch<{
      products: { items: CompareProduct[] };
    }>(COMPARE_PRODUCTS, { variables: { skus } });
    const bySku = new Map(products.items.map((p) => [p.sku, p]));
    return skus
      .map((s) => bySku.get(s))
      .filter((p): p is CompareProduct => Boolean(p));
  } catch {
    return [];
  }
}
