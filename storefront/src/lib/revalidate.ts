import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { productTag, type Tag } from "./revalidate-request";

export { TAGS, productTag, categoryTag } from "./revalidate-request";

/**
 * Cart, customer and session reads are `no-store`, so they never need tag
 * invalidation. What does need refreshing after a cart/session mutation is the
 * client router cache for routes whose RSC payload embeds cart or session
 * state (header badge, /cart, /checkout). Centralised here so the layout-wide
 * purge happens in exactly one place.
 */
export function revalidateCartViews(): void {
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/", "layout");
}

/** Login, logout, register, delete account: everything session-bearing. */
export function revalidateSession(): void {
  revalidatePath("/", "layout");
}

/** Mark cached catalog/CMS data stale (stale-while-revalidate). */
export function revalidateTagStale(tag: Tag | string): void {
  revalidateTag(tag, "max");
}

/** A product's own cached detail read (reviews, stock, price). */
export function revalidateProduct(urlKey: string): void {
  revalidateTag(productTag(urlKey), "max");
}
