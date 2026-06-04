import "server-only";
import { magentoFetch } from "./magento";
import { WISHLIST } from "./queries";
import { getCustomerToken } from "./cart-cookies";
import type { Wishlist } from "./types";

export async function getWishlist(): Promise<Wishlist | null> {
  const token = await getCustomerToken();
  if (!token) return null;
  try {
    const { customer } = await magentoFetch<{
      customer: {
        wishlists: {
          id: string;
          items_count: number;
          items_v2: { items: Wishlist["items"] };
        }[];
      };
    }>(WISHLIST, { token });
    const wl = customer.wishlists?.[0];
    if (!wl) return null;
    return {
      id: wl.id,
      items_count: wl.items_count,
      items: wl.items_v2?.items ?? [],
    };
  } catch {
    return null;
  }
}
