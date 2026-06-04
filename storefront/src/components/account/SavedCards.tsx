"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePaymentTokenAction } from "@/lib/payment-token-actions";
import type { PaymentToken } from "@/lib/payment-tokens";

export default function SavedCards({ tokens }: { tokens: PaymentToken[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (tokens.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        You have no saved payment methods. Cards you save during checkout with an
        online gateway will appear here.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200">
      {tokens.map((t) => {
        let label = `${t.payment_method_code} · ${t.type}`;
        try {
          const d = JSON.parse(t.details);
          if (d.maskedCC) label = `•••• ${d.maskedCC} (exp ${d.expirationDate ?? "?"})`;
        } catch {
          /* keep default */
        }
        return (
          <li key={t.public_hash} className="flex items-center justify-between p-4 text-sm">
            <span className="text-gray-800">{label}</span>
            <button
              onClick={() =>
                startTransition(async () => {
                  await deletePaymentTokenAction(t.public_hash);
                  router.refresh();
                })
              }
              disabled={pending}
              className="text-gray-400 hover:text-red-600"
            >
              Remove
            </button>
          </li>
        );
      })}
    </ul>
  );
}
