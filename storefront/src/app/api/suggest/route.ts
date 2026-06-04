import { NextResponse } from "next/server";
import { magentoFetch } from "@/lib/magento";
import { SEARCH_PRODUCTS } from "@/lib/queries";
import type { Product } from "@/lib/types";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ items: [] });
  try {
    const { products } = await magentoFetch<{ products: { items: Product[] } }>(
      SEARCH_PRODUCTS,
      { variables: { q, pageSize: 6, currentPage: 1 }, revalidate: 60 },
    );
    return NextResponse.json({
      items: products.items.map((p) => ({
        name: p.name,
        url_key: p.url_key,
        image: p.small_image?.url ?? null,
        price: p.price_range.minimum_price.final_price,
      })),
    });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
