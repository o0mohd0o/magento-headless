"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { magentoFetch } from "./magento";
import {
  PLACE_ORDER,
  SET_BILLING_SAME_AS_SHIPPING,
  SET_GUEST_EMAIL,
  SET_PAYMENT_METHOD,
  SET_SHIPPING_ADDRESS,
  SET_SHIPPING_METHOD,
} from "./queries";
import { GUEST_CART_COOKIE, resolveCartContext } from "./cart-cookies";
import type { AddressInput } from "./types";

export type CheckoutResult = { ok: boolean; error?: string };

function clean(e: unknown): string {
  return (e as Error).message.replace(/^Magento GraphQL (error|HTTP \d+): /, "");
}

export async function setGuestEmailAction(
  email: string,
): Promise<CheckoutResult> {
  const { token, cartId } = await resolveCartContext();
  if (!cartId) return { ok: false, error: "Your cart could not be found." };
  try {
    await magentoFetch(SET_GUEST_EMAIL, { variables: { cartId, email }, token });
    revalidatePath("/checkout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: clean(e) };
  }
}

export async function setShippingAddressAction(
  address: AddressInput,
): Promise<CheckoutResult> {
  const { token, cartId } = await resolveCartContext();
  if (!cartId) return { ok: false, error: "Your cart could not be found." };
  try {
    await magentoFetch(SET_SHIPPING_ADDRESS, {
      variables: { cartId, address },
      token,
    });
    revalidatePath("/checkout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: clean(e) };
  }
}

export async function setShippingMethodAction(
  carrier_code: string,
  method_code: string,
): Promise<CheckoutResult> {
  const { token, cartId } = await resolveCartContext();
  if (!cartId) return { ok: false, error: "Your cart could not be found." };
  try {
    await magentoFetch(SET_SHIPPING_METHOD, {
      variables: { cartId, method: { carrier_code, method_code } },
      token,
    });
    // Set billing = shipping so available_payment_methods populate.
    await magentoFetch(SET_BILLING_SAME_AS_SHIPPING, {
      variables: { cartId },
      token,
    });
    revalidatePath("/checkout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: clean(e) };
  }
}

export async function setPaymentMethodAction(
  code: string,
): Promise<CheckoutResult> {
  const { token, cartId } = await resolveCartContext();
  if (!cartId) return { ok: false, error: "Your cart could not be found." };
  try {
    await magentoFetch(SET_PAYMENT_METHOD, {
      variables: { cartId, code },
      token,
    });
    revalidatePath("/checkout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: clean(e) };
  }
}

export async function placeOrderAction(): Promise<CheckoutResult> {
  const { token, cartId } = await resolveCartContext();
  if (!cartId) return { ok: false, error: "Your cart could not be found." };

  let number: string;
  let orderToken: string;
  try {
    const { placeOrder } = await magentoFetch<{
      placeOrder: {
        orderV2: { number: string; token: string } | null;
        errors: { message: string }[];
      };
    }>(PLACE_ORDER, { variables: { cartId }, token });

    if (placeOrder.errors?.length) {
      return { ok: false, error: placeOrder.errors.map((e) => e.message).join("; ") };
    }
    if (!placeOrder.orderV2) {
      return { ok: false, error: "Order could not be placed. Please review your details." };
    }
    number = placeOrder.orderV2.number;
    orderToken = placeOrder.orderV2.token;
  } catch (e) {
    return { ok: false, error: clean(e) };
  }

  // The cart is consumed; drop the guest cookie so a fresh cart starts next time.
  const store = await cookies();
  store.delete(GUEST_CART_COOKIE);
  revalidatePath("/", "layout");
  redirect(
    `/checkout/success?number=${encodeURIComponent(number)}&token=${encodeURIComponent(orderToken)}`,
  );
}
