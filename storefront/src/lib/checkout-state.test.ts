import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveCheckoutState, interpretPlaceOrder } from "./checkout-state.ts";

const addr = {
  firstname: "A",
  lastname: "B",
  street: ["1 Main St"],
  city: "Austin",
  postcode: "78701",
  telephone: "555",
  country: { code: "US" },
};
const method = { carrier_code: "flatrate", method_code: "flatrate", carrier_title: "Flat", method_title: "Fixed", amount: { value: 5, currency: "USD" } };

test("guest with no email: nothing beyond contact is ready", () => {
  const s = deriveCheckoutState(
    { email: null, is_virtual: false, shipping_addresses: [], billing_address: null, selected_payment_method: null },
    false,
  );
  assert.equal(s.emailDone, false);
  assert.equal(s.shippingRequired, true);
  assert.equal(s.paymentReady, false);
  assert.equal(s.readyToPlace, false);
});

test("signed-in customer counts as email done", () => {
  const s = deriveCheckoutState(
    { email: null, is_virtual: false, shipping_addresses: [], billing_address: null, selected_payment_method: null },
    true,
  );
  assert.equal(s.emailDone, true);
  assert.equal(s.addressDone, false);
});

test("physical cart: address without method is not shipping-done", () => {
  const s = deriveCheckoutState(
    { email: "a@b.c", is_virtual: false, shipping_addresses: [{ ...addr }], billing_address: null, selected_payment_method: null },
    false,
  );
  assert.equal(s.addressDone, true);
  assert.equal(s.methodDone, false);
  assert.equal(s.shippingDone, false);
  assert.equal(s.paymentReady, false);
});

test("physical cart: method + same-as-shipping billing unlocks payment", () => {
  const s = deriveCheckoutState(
    {
      email: "a@b.c",
      is_virtual: false,
      shipping_addresses: [{ ...addr, selected_shipping_method: method }],
      billing_address: { ...addr },
      selected_payment_method: null,
    },
    false,
  );
  assert.equal(s.shippingDone, true);
  assert.equal(s.billingDone, true);
  assert.equal(s.paymentReady, true);
  assert.equal(s.readyToPlace, false);
});

test("virtual cart: skips shipping, still needs a billing address", () => {
  const noBilling = deriveCheckoutState(
    { email: "a@b.c", is_virtual: true, shipping_addresses: [], billing_address: null, selected_payment_method: null },
    false,
  );
  assert.equal(noBilling.shippingRequired, false);
  assert.equal(noBilling.shippingDone, true);
  assert.equal(noBilling.paymentReady, false);

  const withBilling = deriveCheckoutState(
    { email: "a@b.c", is_virtual: true, shipping_addresses: [], billing_address: { ...addr }, selected_payment_method: { code: "checkmo", title: "Check" } },
    false,
  );
  assert.equal(withBilling.paymentReady, true);
  assert.equal(withBilling.readyToPlace, true);
});

test("interpretPlaceOrder: 2.4.9 orderV2 success shape", () => {
  assert.deepEqual(
    interpretPlaceOrder({ orderV2: { number: "000000042", token: "tok" }, errors: [] }),
    { ok: true, number: "000000042", token: "tok" },
  );
});

test("interpretPlaceOrder: errors[] wins over orderV2", () => {
  const r = interpretPlaceOrder({
    orderV2: null,
    errors: [{ message: "Some addresses can't be used" }, null, { message: "Payment missing" }],
  });
  assert.deepEqual(r, { ok: false, error: "Some addresses can't be used; Payment missing" });
});

test("interpretPlaceOrder: null payload / missing orderV2 is a failure, not a crash", () => {
  assert.equal(interpretPlaceOrder(null).ok, false);
  assert.equal(interpretPlaceOrder({ orderV2: null, errors: null }).ok, false);
  assert.equal(interpretPlaceOrder({ orderV2: { number: "", token: "" } }).ok, false);
});
