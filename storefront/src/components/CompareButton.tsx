"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCompareAction } from "@/lib/compare-actions";

export default function CompareButton({ sku }: { sku: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  function add() {
    startTransition(async () => {
      const r = await addToCompareAction(sku);
      if (r.ok) {
        setAdded(true);
        router.refresh();
      }
    });
  }

  return (
    <button
      onClick={add}
      disabled={pending || added}
      className="text-sm text-gray-500 underline-offset-2 hover:text-indigo-700 hover:underline disabled:opacity-60"
    >
      {added ? "✓ Added to compare" : "Add to compare"}
    </button>
  );
}
