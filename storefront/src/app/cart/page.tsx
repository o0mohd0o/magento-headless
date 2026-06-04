import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getCart } from "@/lib/cart-data";
import { formatMoney } from "@/lib/format";
import CartControls from "@/components/CartControls";
import CouponForm from "@/components/CouponForm";
import ClearCartButton from "@/components/ClearCartButton";

export const metadata: Metadata = { title: "Your Cart" };

export default async function CartPage() {
  const cart = await getCart();
  const items = cart?.items ?? [];

  if (!items.length) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="mt-2 text-gray-500">
          Add some products from the catalog to get started.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Your cart</h1>
        <ClearCartButton />
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <ul className="divide-y divide-gray-200 lg:col-span-2">
          {items.map((item) => (
            <li key={item.uid} className="flex gap-4 py-5">
              <Link
                href={`/product/${item.product.url_key}`}
                className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100"
              >
                {item.product.small_image?.url && (
                  <Image
                    src={item.product.small_image.url}
                    alt={item.product.small_image.label || item.product.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                )}
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link
                      href={`/product/${item.product.url_key}`}
                      className="font-medium text-gray-900 hover:text-indigo-700"
                    >
                      {item.product.name}
                    </Link>
                    {item.configurable_options?.length ? (
                      <p className="mt-0.5 text-sm text-gray-500">
                        {item.configurable_options
                          .map((o) => `${o.option_label}: ${o.value_label}`)
                          .join(", ")}
                      </p>
                    ) : null}
                    <p className="mt-0.5 text-sm text-gray-400">
                      {formatMoney(item.prices.price)} each
                    </p>
                  </div>
                  <div className="text-right font-semibold text-gray-900">
                    {formatMoney(item.prices.row_total)}
                  </div>
                </div>

                <div className="mt-auto pt-3">
                  <CartControls uid={item.uid} quantity={item.quantity} />
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            {cart?.prices.subtotal_excluding_tax && (
              <div className="flex justify-between text-gray-600">
                <dt>Subtotal</dt>
                <dd>{formatMoney(cart.prices.subtotal_excluding_tax)}</dd>
              </div>
            )}
            {cart?.prices.discounts?.map((d, i) => (
              <div key={i} className="flex justify-between text-green-600">
                <dt>{d.label}</dt>
                <dd>-{formatMoney(d.amount)}</dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-semibold text-gray-900">
              <dt>Total</dt>
              <dd>{formatMoney(cart?.prices.grand_total)}</dd>
            </div>
          </dl>

          <div className="mt-4">
            <CouponForm applied={cart?.applied_coupons?.[0]?.code} />
          </div>
          <Link
            href="/checkout"
            className="mt-6 block w-full rounded-full bg-gray-900 px-6 py-3 text-center font-medium text-white transition hover:bg-gray-700"
          >
            Proceed to checkout
          </Link>
          <p className="mt-3 text-center text-xs text-gray-400">
            Guest cart persisted in Magento via a masked cart id.
          </p>
        </div>
      </div>
    </div>
  );
}
