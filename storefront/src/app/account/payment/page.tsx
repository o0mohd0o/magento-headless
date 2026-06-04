import type { Metadata } from "next";
import { getPaymentTokens } from "@/lib/payment-tokens";
import SavedCards from "@/components/account/SavedCards";

export const metadata: Metadata = { title: "Payment methods" };

export default async function PaymentPage() {
  const tokens = await getPaymentTokens();
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Saved payment methods
      </h2>
      <SavedCards tokens={tokens} />
    </div>
  );
}
