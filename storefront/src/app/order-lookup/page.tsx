"use client";

import { useActionState } from "react";
import {
  lookupGuestOrderAction,
  type GuestOrderState,
} from "@/lib/guest-order-actions";
import { formatMoney } from "@/lib/format";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

export default function OrderLookupPage() {
  const [state, action, pending] = useActionState<GuestOrderState, FormData>(
    lookupGuestOrderAction,
    {},
  );
  const order = state.order;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Track your order</h1>
      <p className="mt-2 text-sm text-gray-500">
        Enter your order number and the email + last name used at checkout.
      </p>

      <form action={action} className="mt-6 space-y-3">
        <input name="number" required placeholder="Order number (e.g. 000000005)" className={inputClass} />
        <div className="grid grid-cols-2 gap-3">
          <input name="email" type="email" required placeholder="Email" className={inputClass} />
          <input name="lastname" required placeholder="Last name" className={inputClass} />
        </div>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          disabled={pending}
          className="rounded-full bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700 disabled:bg-gray-300"
        >
          {pending ? "Looking up…" : "Find order"}
        </button>
      </form>

      {order && (
        <div className="mt-8 rounded-2xl border border-gray-200 p-6">
          <div className="flex justify-between">
            <h2 className="font-semibold text-gray-900">Order #{order.number}</h2>
            <span className="text-sm text-gray-500">{order.status}</span>
          </div>
          <p className="text-xs text-gray-400">{order.order_date}</p>
          <ul className="mt-4 divide-y divide-gray-100">
            {order.items.map((it, i) => (
              <li key={i} className="flex justify-between py-2 text-sm">
                <span>
                  {it.product_name} × {it.quantity_ordered}
                </span>
                <span>{formatMoney(it.product_sale_price)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 font-semibold">
            <span>Total</span>
            <span>{formatMoney(order.total.grand_total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
