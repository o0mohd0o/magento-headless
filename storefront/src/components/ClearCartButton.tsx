"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { clearCartAction } from "@/lib/actions";

export default function ClearCartButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => {
        if (!window.confirm("Remove all items from your cart?")) return;
        startTransition(async () => {
          await clearCartAction();
          router.refresh();
        });
      }}
      disabled={pending}
      className="text-sm text-gray-500 hover:text-red-600 disabled:opacity-50"
    >
      Clear cart
    </button>
  );
}
