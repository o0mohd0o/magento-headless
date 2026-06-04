import "server-only";
import { cookies } from "next/headers";
import { magentoFetch } from "./magento";
import { CUSTOMER_CART_ID } from "./queries";

export const GUEST_CART_COOKIE = "guest_cart_id";
export const CUSTOMER_TOKEN_COOKIE = "customer_token";

export async function getGuestCartId(): Promise<string | null> {
  return (await cookies()).get(GUEST_CART_COOKIE)?.value ?? null;
}

export async function getCustomerToken(): Promise<string | null> {
  return (await cookies()).get(CUSTOMER_TOKEN_COOKIE)?.value ?? null;
}

export type CartContext = { token?: string; cartId: string | null };

/**
 * Resolve the active cart for READS.
 * - Logged-in customer → the customer cart id (customerCart auto-creates it).
 * - Guest → the masked guest cart id cookie (may be null if nothing added).
 */
export async function resolveCartContext(): Promise<CartContext> {
  const token = await getCustomerToken();
  if (token) {
    try {
      const { customerCart } = await magentoFetch<{
        customerCart: { id: string };
      }>(CUSTOMER_CART_ID, { token });
      return { token, cartId: customerCart.id };
    } catch {
      // Expired/invalid token — fall back to guest.
      return { cartId: await getGuestCartId() };
    }
  }
  return { cartId: await getGuestCartId() };
}
