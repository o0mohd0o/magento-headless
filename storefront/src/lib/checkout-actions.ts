"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { magentoFetch } from "./magento";
import {
  PLACE_ORDER,
  SET_BILLING_ADDRESS,
  SET_BILLING_SAME_AS_SHIPPING,
  SET_GUEST_EMAIL,
  SET_PAYMENT_METHOD,
  SET_SHIPPING_ADDRESS,
  SET_SHIPPING_METHOD,
} from "./queries";
import { GUEST_CART_COOKIE, resolveCartContext } from "./cart-cookies";
import { NO_CART, fail, type ActionResult } from "./errors";
import { interpretPlaceOrder, type PlaceOrderPayload } from "./checkout-state";
import { revalidateCartViews } from "./revalidate";
import type { AddressInput } from "./types";

export type CheckoutResult = ActionResult;

function refreshCheckout() {
  revalidatePath("/checkout");
}

export async function setGuestEmailAction(email: string): Promise<CheckoutResult> {
  const { token, cartId } = await resolveCartContext();
  if (!cartId) return NO_CART;
  try {
    await magentoFetch(SET_GUEST_EMAIL, { variables: { cartId, email }, token });
    refreshCheckout();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function setShippingAddressAction(
  address: AddressInput,
): Promise<CheckoutResult> {
  const { token, cartId } = await resolveCartContext();
  if (!cartId) return NO_CART;
  try {
    await magentoFetch(SET_SHIPPING_ADDRESS, {
      variables: { cartId, address },
      token,
    });
    refreshCheckout();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/**
 * Select a shipping method. Unless the shopper already entered a separate
 * billing address, billing is set to "same as shipping" here so that
 * available_payment_methods populate.
 */
export async function setShippingMethodAction(
  carrier_code: string,
  method_code: string,
  opts: { keepBilling?: boolean } = {},
): Promise<CheckoutResult> {
  const { token, cartId } = await resolveCartContext();
  if (!cartId) return NO_CART;
  try {
    await magentoFetch(SET_SHIPPING_METHOD, {
      variables: { cartId, method: { carrier_code, method_code } },
      token,
    });
    if (!opts.keepBilling) {
      await magentoFetch(SET_BILLING_SAME_AS_SHIPPING, {
        variables: { cartId },
        token,
      });
    }
    refreshCheckout();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Explicit billing address: required for virtual carts, optional otherwise. */
export async function setBillingAddressAction(
  address: AddressInput,
): Promise<CheckoutResult> {
  const { token, cartId } = await resolveCartContext();
  if (!cartId) return NO_CART;
  try {
    await magentoFetch(SET_BILLING_ADDRESS, {
      variables: { cartId, address },
      token,
    });
    refreshCheckout();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function setBillingSameAsShippingAction(): Promise<CheckoutResult> {
  const { token, cartId } = await resolveCartContext();
  if (!cartId) return NO_CART;
  try {
    await magentoFetch(SET_BILLING_SAME_AS_SHIPPING, { variables: { cartId }, token });
    refreshCheckout();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function setPaymentMethodAction(code: string): Promise<CheckoutResult> {
  const { token, cartId } = await resolveCartContext();
  if (!cartId) return NO_CART;
  try {
    await magentoFetch(SET_PAYMENT_METHOD, { variables: { cartId, code }, token });
    refreshCheckout();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/**
 * Place the order. `recaptchaToken` is forwarded as X-ReCaptcha when the
 * backend has reCAPTCHA enabled for PLACE_ORDER; undefined otherwise.
 * On success the guest cart cookie is dropped and the shopper is redirected,
 * so the Promise only resolves on failure.
 */
export async function placeOrderAction(
  recaptchaToken?: string,
): Promise<CheckoutResult> {
  const { token, cartId } = await resolveCartContext();
  if (!cartId) return NO_CART;

  let outcome: ReturnType<typeof interpretPlaceOrder>;
  try {
    const { placeOrder } = await magentoFetch<{ placeOrder: PlaceOrderPayload }>(
      PLACE_ORDER,
      { variables: { cartId }, token, recaptchaToken },
    );
    outcome = interpretPlaceOrder(placeOrder);
  } catch (e) {
    return fail(e);
  }
  if (!outcome.ok) return outcome;

  // The cart is consumed; drop the guest cookie so a fresh cart starts next time.
  (await cookies()).delete(GUEST_CART_COOKIE);
  revalidateCartViews();
  redirect(
    `/checkout/success?number=${encodeURIComponent(outcome.number)}&token=${encodeURIComponent(outcome.token)}`,
  );
}
