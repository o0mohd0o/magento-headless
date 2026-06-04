import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  getCheckoutAgreements,
  getCheckoutCart,
  getCountries,
} from "@/lib/checkout";
import CheckoutFlow from "@/components/checkout/CheckoutFlow";
import OrderSummary from "@/components/checkout/OrderSummary";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [{ cart, loggedIn }, countries, agreements] = await Promise.all([
    getCheckoutCart(),
    getCountries(),
    getCheckoutAgreements(),
  ]);

  if (!cart || !cart.items?.length) redirect("/cart");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Checkout</h1>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CheckoutFlow
            cart={cart}
            countries={countries}
            loggedIn={loggedIn}
            agreements={agreements}
          />
        </div>
        <OrderSummary cart={cart} />
      </div>
    </div>
  );
}
