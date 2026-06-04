"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AddressForm from "./AddressForm";
import {
  placeOrderAction,
  setGuestEmailAction,
  setPaymentMethodAction,
  setShippingAddressAction,
  setShippingMethodAction,
} from "@/lib/checkout-actions";
import { formatMoney } from "@/lib/format";
import type { AddressInput, CheckoutCart, Country } from "@/lib/types";

function Step({
  n,
  title,
  done,
  children,
}: {
  n: number;
  title: string;
  done?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 p-6">
      <div className="mb-4 flex items-center gap-3">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
            done ? "bg-green-100 text-green-700" : "bg-indigo-600 text-white"
          }`}
        >
          {done ? "✓" : n}
        </span>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

type Agreement = {
  agreement_id: number;
  name: string;
  content: string;
  mode: string;
  is_html: boolean;
};

export default function CheckoutFlow({
  cart,
  countries,
  loggedIn,
  agreements = [],
}: {
  cart: CheckoutCart;
  countries: Country[];
  loggedIn: boolean;
  agreements?: Agreement[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [editAddr, setEditAddr] = useState(false);
  const [agreed, setAgreed] = useState<Set<number>>(new Set());

  const addr = cart.shipping_addresses?.[0];
  const emailDone = loggedIn || !!cart.email;
  const addressDone = !!(addr && addr.street?.length && addr.city);
  const methodDone = !!addr?.selected_shipping_method;
  const paymentDone = !!cart.selected_payment_method;
  const agreementsOk = agreements.every((a) => agreed.has(a.agreement_id));
  const canPlace =
    emailDone && addressDone && methodDone && paymentDone && agreementsOk;

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) {
    setErr(null);
    startTransition(async () => {
      const r = await fn();
      if (!r.ok) setErr(r.error ?? "Something went wrong.");
      else {
        after?.();
        router.refresh();
      }
    });
  }

  function submitEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    run(() => setGuestEmailAction(email));
  }

  function submitAddress(a: AddressInput) {
    run(() => setShippingAddressAction(a), () => setEditAddr(false));
  }

  function place() {
    setErr(null);
    startTransition(async () => {
      const r = await placeOrderAction();
      if (r && !r.ok) setErr(r.error ?? "Could not place order.");
      // success redirects server-side
    });
  }

  const methods = addr?.available_shipping_methods?.filter((m) => m.available) ?? [];
  const payments = cart.available_payment_methods ?? [];

  let step = 1;

  return (
    <div className="space-y-5">
      {/* 1. Contact */}
      <Step n={step++} title="Contact" done={emailDone}>
        {emailDone ? (
          <p className="text-sm text-gray-600">
            {loggedIn ? "Signed in" : cart.email}
          </p>
        ) : (
          <form onSubmit={submitEmail} className="flex flex-wrap gap-3">
            <input
              name="email"
              type="email"
              required
              placeholder="Email address"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
            <button
              disabled={pending}
              className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-gray-300"
            >
              Continue
            </button>
          </form>
        )}
      </Step>

      {/* 2. Shipping address */}
      {emailDone && (
        <Step n={step++} title="Shipping address" done={addressDone && !editAddr}>
          {addressDone && !editAddr ? (
            <div className="flex items-start justify-between text-sm text-gray-700">
              <address className="not-italic">
                {addr?.firstname} {addr?.lastname}
                <br />
                {addr?.street?.join(", ")}
                <br />
                {addr?.city}
                {addr?.region?.label ? `, ${addr.region.label}` : ""} {addr?.postcode}
                <br />
                {addr?.country?.code} · {addr?.telephone}
              </address>
              <button
                onClick={() => setEditAddr(true)}
                className="text-sm font-medium text-indigo-600 hover:underline"
              >
                Edit
              </button>
            </div>
          ) : (
            <AddressForm
              countries={countries}
              pending={pending}
              error={err}
              onSubmit={submitAddress}
            />
          )}
        </Step>
      )}

      {/* 3. Delivery method */}
      {addressDone && !editAddr && (
        <Step n={step++} title="Delivery method" done={methodDone}>
          {methods.length === 0 ? (
            <p className="text-sm text-gray-500">
              No shipping methods available for this address.
            </p>
          ) : (
            <div className="space-y-2">
              {methods.map((m) => {
                const selected =
                  addr?.selected_shipping_method?.carrier_code === m.carrier_code &&
                  addr?.selected_shipping_method?.method_code === m.method_code;
                return (
                  <label
                    key={`${m.carrier_code}-${m.method_code}`}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border-2 px-4 py-3 text-sm ${
                      selected ? "border-indigo-600 bg-indigo-50" : "border-gray-200"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="ship"
                        checked={selected}
                        onChange={() =>
                          run(() => setShippingMethodAction(m.carrier_code, m.method_code))
                        }
                        disabled={pending}
                      />
                      <span>
                        {m.carrier_title} — {m.method_title}
                      </span>
                    </span>
                    <span className="font-medium">{formatMoney(m.amount)}</span>
                  </label>
                );
              })}
            </div>
          )}
        </Step>
      )}

      {/* 4. Payment */}
      {methodDone && (
        <Step n={step++} title="Payment" done={paymentDone}>
          {payments.length === 0 ? (
            <p className="text-sm text-gray-500">No payment methods available.</p>
          ) : (
            <div className="space-y-2">
              {payments.map((pm) => {
                const selected = cart.selected_payment_method?.code === pm.code;
                return (
                  <label
                    key={pm.code}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3 text-sm ${
                      selected ? "border-indigo-600 bg-indigo-50" : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="pay"
                      checked={selected}
                      onChange={() => run(() => setPaymentMethodAction(pm.code))}
                      disabled={pending}
                    />
                    <span>{pm.title}</span>
                  </label>
                );
              })}
            </div>
          )}
        </Step>
      )}

      {agreements.length > 0 && (
        <div className="space-y-2 rounded-xl border border-gray-200 p-4">
          {agreements.map((a) => (
            <label
              key={a.agreement_id}
              className="flex items-start gap-2 text-sm text-gray-600"
            >
              <input
                type="checkbox"
                checked={agreed.has(a.agreement_id)}
                onChange={() =>
                  setAgreed((s) => {
                    const n = new Set(s);
                    n.has(a.agreement_id)
                      ? n.delete(a.agreement_id)
                      : n.add(a.agreement_id);
                    return n;
                  })
                }
                className="mt-0.5"
              />
              <span>{a.name}</span>
            </label>
          ))}
        </div>
      )}

      {err && <p className="text-sm text-red-600">{err}</p>}

      <button
        onClick={place}
        disabled={!canPlace || pending}
        className="w-full rounded-full bg-gray-900 px-6 py-3.5 font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {pending ? "Working…" : "Place order"}
      </button>
      <p className="text-center text-xs text-gray-400">
        Offline demo checkout — no real payment is taken.
      </p>
    </div>
  );
}
