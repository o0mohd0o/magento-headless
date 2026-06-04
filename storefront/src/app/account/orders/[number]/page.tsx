import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getOrder } from "@/lib/account";
import { formatMoney } from "@/lib/format";
import ReorderButton from "@/components/account/ReorderButton";
import CancelOrderButton from "@/components/account/CancelOrderButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ number: string }>;
}): Promise<Metadata> {
  const { number } = await params;
  return { title: `Order #${number}` };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const order = await getOrder(number);
  if (!order) notFound();

  const ship = order.shipping_address;

  return (
    <div>
      <div className="mb-1 flex items-center gap-3 text-sm text-gray-500">
        <Link href="/account/orders" className="hover:text-gray-800">
          Orders
        </Link>
        <span>/</span>
        <span>#{order.number}</span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-900">Order #{order.number}</h2>
        <div className="flex items-center gap-2">
          {order.available_actions?.includes("CANCEL") && order.id && (
            <CancelOrderButton orderId={order.id} />
          )}
          <ReorderButton number={order.number} />
        </div>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        {order.order_date} · <span className="font-medium">{order.status}</span>
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 text-center font-medium">Qty</th>
              <th className="px-4 py-3 text-right font-medium">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items.map((it, i) => (
              <tr key={`${it.product_sku}-${i}`}>
                <td className="px-4 py-3 text-gray-900">{it.product_name}</td>
                <td className="px-4 py-3 text-gray-500">{it.product_sku}</td>
                <td className="px-4 py-3 text-center text-gray-600">
                  {it.quantity_ordered}
                </td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {formatMoney(it.product_sale_price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 p-5 text-sm">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Shipping
          </h3>
          {ship ? (
            <address className="not-italic text-gray-700">
              {ship.firstname} {ship.lastname}
              <br />
              {ship.street?.join(", ")}
              <br />
              {ship.city}, {ship.region} {ship.postcode}
              <br />
              {ship.country_code}
              {order.shipping_method ? (
                <>
                  <br />
                  <span className="text-gray-500">via {order.shipping_method}</span>
                </>
              ) : null}
            </address>
          ) : (
            <p className="text-gray-500">No shipping address.</p>
          )}
        </div>
        <div className="rounded-2xl border border-gray-200 p-5 text-sm">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Summary
          </h3>
          <dl className="space-y-1">
            <div className="flex justify-between text-gray-600">
              <dt>Subtotal</dt>
              <dd>{formatMoney(order.total.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-gray-600">
              <dt>Shipping</dt>
              <dd>{formatMoney(order.total.total_shipping)}</dd>
            </div>
            <div className="flex justify-between text-gray-600">
              <dt>Tax</dt>
              <dd>{formatMoney(order.total.total_tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-1 text-base font-semibold text-gray-900">
              <dt>Total</dt>
              <dd>{formatMoney(order.total.grand_total)}</dd>
            </div>
          </dl>
          {order.payment_methods?.length ? (
            <p className="mt-3 text-gray-500">
              Paid via {order.payment_methods.map((p) => p.name).join(", ")}
            </p>
          ) : null}
        </div>
      </div>

      {order.shipments?.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 p-5 text-sm">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Shipments
          </h3>
          {order.shipments.map((s) => (
            <p key={s.number} className="text-gray-700">
              Shipment #{s.number}
              {s.tracking?.length
                ? " — " +
                  s.tracking.map((t) => `${t.title}: ${t.number}`).join(", ")
                : ""}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
