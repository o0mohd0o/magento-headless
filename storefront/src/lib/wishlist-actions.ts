"use server";

import { revalidatePath } from "next/cache";
import { magentoFetch } from "./magento";
import {
  ADD_TO_WISHLIST,
  REMOVE_FROM_WISHLIST,
  WISHLIST_ID,
  WISHLIST_TO_CART,
} from "./queries";
import { getCustomerToken } from "./cart-cookies";

export type WishlistResult = {
  ok: boolean;
  error?: string;
  needLogin?: boolean;
};

function clean(e: unknown): string {
  return (e as Error).message.replace(/^Magento GraphQL (error|HTTP \d+): /, "");
}

async function wishlistId(token: string): Promise<string | null> {
  try {
    const { customer } = await magentoFetch<{
      customer: { wishlists: { id: string }[] };
    }>(WISHLIST_ID, { token });
    return customer.wishlists?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

export async function addToWishlistAction(sku: string): Promise<WishlistResult> {
  const token = await getCustomerToken();
  if (!token) return { ok: false, needLogin: true };
  const wid = await wishlistId(token);
  if (!wid) return { ok: false, error: "No wishlist found." };
  try {
    const { addProductsToWishlist } = await magentoFetch<{
      addProductsToWishlist: { user_errors: { message: string }[] };
    }>(ADD_TO_WISHLIST, { variables: { wishlistId: wid, sku }, token });
    if (addProductsToWishlist.user_errors?.length) {
      return { ok: false, error: addProductsToWishlist.user_errors[0].message };
    }
    revalidatePath("/wishlist");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: clean(e) };
  }
}

export async function removeFromWishlistAction(
  itemId: string,
): Promise<WishlistResult> {
  const token = await getCustomerToken();
  if (!token) return { ok: false, needLogin: true };
  const wid = await wishlistId(token);
  if (!wid) return { ok: false, error: "No wishlist found." };
  try {
    await magentoFetch(REMOVE_FROM_WISHLIST, {
      variables: { wishlistId: wid, itemId },
      token,
    });
    revalidatePath("/wishlist");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: clean(e) };
  }
}

export async function moveWishlistItemToCartAction(
  itemId: string,
): Promise<WishlistResult> {
  const token = await getCustomerToken();
  if (!token) return { ok: false, needLogin: true };
  const wid = await wishlistId(token);
  if (!wid) return { ok: false, error: "No wishlist found." };
  try {
    const { addWishlistItemsToCart } = await magentoFetch<{
      addWishlistItemsToCart: {
        status: boolean;
        add_wishlist_items_to_cart_user_errors: { message: string }[];
      };
    }>(WISHLIST_TO_CART, { variables: { wishlistId: wid, itemId }, token });
    const errs = addWishlistItemsToCart.add_wishlist_items_to_cart_user_errors;
    if (errs?.length) return { ok: false, error: errs[0].message };
    revalidatePath("/wishlist");
    revalidatePath("/cart");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: clean(e) };
  }
}
