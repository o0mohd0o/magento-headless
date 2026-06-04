import Image from "next/image";
import { formatMoney } from "@/lib/format";
import CouponForm from "@/components/CouponForm";
import type { CheckoutCart } from "@/lib/types";

export default function OrderSummary({ cart }: { cart: CheckoutCart }) {
  const shipping = cart.shipping_addresses?.[0]?.selected_shipping_method;
  const discounts = cart.prices.discounts ?? [];
  const taxes = cart.prices.applied_taxes ?? [];

  return (
    <div className="h-fit rounded-2xl border border-gray-200 bg-gray-50 p-6">
      <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>

      <ul className="mt-4 space-y-3">
        {cart.items.map((item) => (
          <li key={item.uid} className="flex gap-3">
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {item.product.small_image?.url && (
                <Image
                  src={item.product.small_image.url}
                  alt={item.product.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              )}
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-700 px-1 text-xs text-white">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 text-sm">
              <p className="font-medium text-gray-800">{item.product.name}</p>
              {item.configurable_options?.length ? (
                <p className="text-xs text-gray-500">
                  {item.configurable_options
                    .map((o) => `${o.option_label}: ${o.value_label}`)
                    .join(", ")}
                </p>
              ) : null}
            </div>
            <div className="text-sm font-medium text-gray-900">
              {formatMoney(item.prices.row_total)}
            </div>
          </li>
        ))}
      </ul>

      <dl className="mt-5 space-y-2 border-t border-gray-200 pt-4 text-sm">
        <div className="flex justify-between text-gray-600">
          <dt>Subtotal</dt>
          <dd>{formatMoney(cart.prices.subtotal_excluding_tax)}</dd>
        </div>
        {shipping && (
          <div className="flex justify-between text-gray-600">
            <dt>Shipping ({shipping.carrier_title})</dt>
            <dd>{formatMoney(shipping.amount)}</dd>
          </div>
        )}
        {discounts.map((d, i) => (
          <div key={i} className="flex justify-between text-green-600">
            <dt>{d.label}</dt>
            <dd>-{formatMoney(d.amount)}</dd>
          </div>
        ))}
        {taxes.map((t, i) => (
          <div key={i} className="flex justify-between text-gray-600">
            <dt>{t.label || "Tax"}</dt>
            <dd>{formatMoney(t.amount)}</dd>
          </div>
        ))}
        <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold text-gray-900">
          <dt>Total</dt>
          <dd>{formatMoney(cart.prices.grand_total)}</dd>
        </div>
      </dl>

      <div className="mt-5 border-t border-gray-200 pt-4">
        <CouponForm applied={cart.applied_coupons?.[0]?.code} />
      </div>
    </div>
  );
}
