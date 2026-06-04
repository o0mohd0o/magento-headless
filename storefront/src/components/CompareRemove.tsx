"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeFromCompareAction } from "@/lib/compare-actions";

export default function CompareRemove({ sku }: { sku: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await removeFromCompareAction(sku);
          router.refresh();
        })
      }
      disabled={pending}
      className="text-xs text-gray-400 hover:text-red-600"
    >
      Remove
    </button>
  );
}
