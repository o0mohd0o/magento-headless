import Link from "next/link";
import type { Metadata } from "next";
import { magentoFetch } from "@/lib/magento";
import { GUEST_ORDER_BY_TOKEN } from "@/lib/queries";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Order confirmed" };

type GuestOrder = {
  number: string;
  status: string;
  email: string;
  total: {
    grand_total: { value: number; currency: string };
    subtotal: { value: number; currency: string };
    total_shipping: { value: number; currency: string };
  };
  items: {
    product_name: string;
    product_sku: string;
    quantity_ordered: number;
    product_sale_price: { value: number; currency: string };
  }[];
  shipping_address?: {
    firstname: string;
    lastname: string;
    street: string[];
    city: string;
    region: string;
    postcode: string;
  } | null;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ number?: string; token?: string }>;
}) {
  const { number, token } = await searchParams;

  let order: GuestOrder | null = null;
  if (token) {
    try {
      const d = await magentoFetch<{ guestOrderByToken: GuestOrder }>(
        GUEST_ORDER_BY_TOKEN,
        { variables: { token } },
      );
      order = d.guestOrderByToken;
    } catch {
      order = null;
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
          ✓
        </div>
        <h1 className="mt-5 text-3xl font-bold text-gray-900">Thank you!</h1>
        <p className="mt-2 text-gray-600">
          Your order{" "}
          <span className="font-semibold text-gray-900">
            #{number ?? order?.number}
          </span>{" "}
          has been placed.
        </p>
      </div>

      {order && (
        <div className="mt-8 rounded-2xl border border-gray-200 p-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span className="font-medium text-gray-900">{order.status}</span>
          </div>
          <ul className="mt-4 divide-y divide-gray-100">
            {order.items.map((it) => (
              <li key={it.product_sku} className="flex justify-between py-2 text-sm">
                <span className="text-gray-700">
                  {it.product_name} × {it.quantity_ordered}
                </span>
                <span className="text-gray-900">
                  {formatMoney(it.product_sale_price)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 border-t border-gray-200 pt-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <dt>Subtotal</dt>
              <dd>{formatMoney(order.total.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-gray-600">
              <dt>Shipping</dt>
              <dd>{formatMoney(order.total.total_shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-1 text-base font-semibold text-gray-900">
              <dt>Total</dt>
              <dd>{formatMoney(order.total.grand_total)}</dd>
            </div>
          </dl>
          {order.shipping_address && (
            <p className="mt-4 text-sm text-gray-500">
              Shipping to {order.shipping_address.firstname}{" "}
              {order.shipping_address.lastname}, {order.shipping_address.street.join(", ")},{" "}
              {order.shipping_address.city}, {order.shipping_address.region}{" "}
              {order.shipping_address.postcode}
            </p>
          )}
        </div>
      )}

      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
        >
          Continue shopping
        </Link>
        <Link
          href="/account"
          className="rounded-full border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
        >
          View account
        </Link>
      </div>
    </div>
  );
}
