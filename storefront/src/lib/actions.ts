"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { magentoFetch } from "./magento";
import {
  ADD_PRODUCTS_TO_CART,
  APPLY_COUPON,
  CLEAR_CART,
  CREATE_GUEST_CART,
  CUSTOMER_CART_ID,
  REMOVE_COUPON,
  REMOVE_ITEM_FROM_CART,
  UPDATE_CART_ITEMS,
} from "./queries";
import {
  GUEST_CART_COOKIE,
  getCustomerToken,
  getGuestCartId,
  resolveCartContext,
} from "./cart-cookies";
import type { UserError } from "./types";

type WritableCart = { token?: string; cartId: string };

/** Resolve (creating if necessary) a cart we can mutate. */
async function getWritableCart(): Promise<WritableCart> {
  const token = await getCustomerToken();
  if (token) {
    const { customerCart } = await magentoFetch<{
      customerCart: { id: string };
    }>(CUSTOMER_CART_ID, { token });
    return { token, cartId: customerCart.id };
  }

  const existing = await getGuestCartId();
  if (existing) return { cartId: existing };

  const { createGuestCart } = await magentoFetch<{
    createGuestCart: { cart: { id: string } };
  }>(CREATE_GUEST_CART);
  const id = createGuestCart.cart.id;
  const store = await cookies();
  store.set(GUEST_CART_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
  return { cartId: id };
}

export type AddToCartInput = {
  sku: string;
  quantity?: number;
  selectedOptions?: string[];
};

export type AddToCartResult = { ok: boolean; errors: UserError[] };

export async function addToCartAction(
  input: AddToCartInput,
): Promise<AddToCartResult> {
  try {
    const { token, cartId } = await getWritableCart();
    const cartItem: Record<string, unknown> = {
      sku: input.sku,
      quantity: input.quantity ?? 1,
    };
    if (input.selectedOptions?.length) {
      cartItem.selected_options = input.selectedOptions;
    }

    const { addProductsToCart } = await magentoFetch<{
      addProductsToCart: { user_errors: UserError[] };
    }>(ADD_PRODUCTS_TO_CART, {
      variables: { cartId, cartItems: [cartItem] },
      token,
    });

    revalidatePath("/", "layout");
    revalidatePath("/cart");
    return {
      ok: addProductsToCart.user_errors.length === 0,
      errors: addProductsToCart.user_errors,
    };
  } catch (e) {
    return {
      ok: false,
      errors: [{ code: "EXCEPTION", message: (e as Error).message }],
    };
  }
}

export async function addGroupedAction(
  items: { sku: string; quantity: number }[],
): Promise<AddToCartResult> {
  const valid = items.filter((i) => i.quantity > 0);
  if (!valid.length) {
    return { ok: false, errors: [{ code: "EMPTY", message: "Choose a quantity for at least one item." }] };
  }
  try {
    const { token, cartId } = await getWritableCart();
    const { addProductsToCart } = await magentoFetch<{
      addProductsToCart: { user_errors: UserError[] };
    }>(ADD_PRODUCTS_TO_CART, {
      variables: {
        cartId,
        cartItems: valid.map((i) => ({ sku: i.sku, quantity: i.quantity })),
      },
      token,
    });
    revalidatePath("/", "layout");
    revalidatePath("/cart");
    return {
      ok: addProductsToCart.user_errors.length === 0,
      errors: addProductsToCart.user_errors,
    };
  } catch (e) {
    return { ok: false, errors: [{ code: "EXCEPTION", message: (e as Error).message }] };
  }
}

export async function updateItemQtyAction(uid: string, quantity: number) {
  const { token, cartId } = await getWritableCart();
  await magentoFetch(UPDATE_CART_ITEMS, {
    variables: { cartId, items: [{ cart_item_uid: uid, quantity }] },
    token,
  });
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function removeItemAction(uid: string) {
  const { token, cartId } = await getWritableCart();
  await magentoFetch(REMOVE_ITEM_FROM_CART, {
    variables: { cartId, uid },
    token,
  });
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function clearCartAction(): Promise<void> {
  const { token, cartId } = await resolveCartContext();
  if (!cartId) return;
  try {
    await magentoFetch(CLEAR_CART, { variables: { cartId }, token });
  } catch {
    // ignore
  }
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function applyCouponAction(
  code: string,
): Promise<{ ok: boolean; error?: string }> {
  const { token, cartId } = await resolveCartContext();
  if (!cartId) return { ok: false, error: "Your cart could not be found." };
  try {
    await magentoFetch(APPLY_COUPON, { variables: { cartId, code }, token });
    revalidatePath("/cart");
    revalidatePath("/checkout");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: (e as Error).message.replace(/^Magento GraphQL (error|HTTP \d+): /, ""),
    };
  }
}

export async function removeCouponAction(): Promise<{
  ok: boolean;
  error?: string;
}> {
  const { token, cartId } = await resolveCartContext();
  if (!cartId) return { ok: false, error: "Your cart could not be found." };
  try {
    await magentoFetch(REMOVE_COUPON, { variables: { cartId }, token });
    revalidatePath("/cart");
    revalidatePath("/checkout");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: (e as Error).message.replace(/^Magento GraphQL (error|HTTP \d+): /, ""),
    };
  }
}
