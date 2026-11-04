/**
 * Pure checkout helpers: step gating derived from server cart state, and
 * interpretation of the 2.4.9 placeOrder payload. No Next.js imports, so
 * the critical-path branching is unit-testable.
 */
import type { CheckoutAddress, CheckoutCart } from "./types";

export type CheckoutState = {
  /** Guest email set, or customer signed in. */
  emailDone: boolean;
  /** Physical carts need a shipping address + method; virtual carts skip both. */
  shippingRequired: boolean;
  addressDone: boolean;
  methodDone: boolean;
  /** Shipping section complete (or not required). */
  shippingDone: boolean;
  /** A billing address is on the cart (same-as-shipping counts). */
  billingDone: boolean;
  /** Payment methods can be shown. */
  paymentReady: boolean;
  paymentDone: boolean;
  /** Everything but agreements is satisfied. */
  readyToPlace: boolean;
};

export function hasAddress(a?: CheckoutAddress | null): boolean {
  return !!(a && a.street?.length && a.city);
}

export function deriveCheckoutState(
  cart: Pick<
    CheckoutCart,
    | "email"
    | "is_virtual"
    | "shipping_addresses"
    | "billing_address"
    | "selected_payment_method"
  >,
  loggedIn: boolean,
): CheckoutState {
  const addr = cart.shipping_addresses?.[0];
  const emailDone = loggedIn || !!cart.email;
  const shippingRequired = !cart.is_virtual;
  const addressDone = shippingRequired ? hasAddress(addr) : true;
  const methodDone = shippingRequired ? !!addr?.selected_shipping_method : true;
  const shippingDone = addressDone && methodDone;
  const billingDone = hasAddress(cart.billing_address);
  const paymentReady = emailDone && shippingDone && billingDone;
  const paymentDone = !!cart.selected_payment_method;
  return {
    emailDone,
    shippingRequired,
    addressDone,
    methodDone,
    shippingDone,
    billingDone,
    paymentReady,
    paymentDone,
    readyToPlace: paymentReady && paymentDone,
  };
}

export type PlaceOrderPayload = {
  orderV2?: { number: string; token: string } | null;
  errors?: ({ message: string } | null)[] | null;
};

export type PlaceOrderOutcome =
  | { ok: true; number: string; token: string }
  | { ok: false; error: string };

/** Magento 2.4.9 returns `{ orderV2, errors }`; the legacy `order.order_number` is gone. */
export function interpretPlaceOrder(
  p: PlaceOrderPayload | null | undefined,
): PlaceOrderOutcome {
  const errors = (p?.errors ?? []).filter(
    (e): e is { message: string } => !!e?.message,
  );
  if (errors.length) {
    return { ok: false, error: errors.map((e) => e.message).join("; ") };
  }
  if (!p?.orderV2?.number) {
    return {
      ok: false,
      error: "Order could not be placed. Please review your details.",
    };
  }
  return { ok: true, number: p.orderV2.number, token: p.orderV2.token };
}
