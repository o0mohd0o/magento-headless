import "server-only";
import { magentoFetch } from "./magento";
import { CART_QUERY } from "./queries";
import { resolveCartContext } from "./cart-cookies";
import type { Cart } from "./types";

/** Read-only cart fetch for Server Components (header badge, cart page). */
export async function getCart(): Promise<Cart | null> {
  const { token, cartId } = await resolveCartContext();
  if (!cartId) return null;
  try {
    const { cart } = await magentoFetch<{ cart: Cart }>(CART_QUERY, {
      variables: { cartId },
      token,
    });
    return cart;
  } catch {
    return null;
  }
}

export async function getCartCount(): Promise<number> {
  const cart = await getCart();
  return cart?.total_quantity ?? 0;
}
