"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addGroupedAction } from "@/lib/actions";
import { formatMoney } from "@/lib/format";
import type { GroupedItem } from "@/lib/types";

export default function GroupedAddToCart({ items }: { items: GroupedItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [qty, setQty] = useState<Record<string, number>>(() =>
    Object.fromEntries(items.map((i) => [i.product.sku, i.qty || 0])),
  );
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function add() {
    setMsg(null);
    const list = items.map((i) => ({ sku: i.product.sku, quantity: qty[i.product.sku] || 0 }));
    startTransition(async () => {
      const r = await addGroupedAction(list);
      if (r.ok) {
        setMsg({ type: "ok", text: "✓ Added to your cart" });
        router.refresh();
      } else {
        setMsg({ type: "err", text: r.errors[0]?.message ?? "Could not add to cart" });
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
        {items.map((i) => (
          <div key={i.product.sku} className="flex items-center justify-between gap-4 p-3">
            <div>
              <p className="text-sm font-medium text-gray-800">{i.product.name}</p>
              <p className="text-sm text-gray-500">
                {formatMoney(i.product.price_range.minimum_price.final_price)}
              </p>
            </div>
            <input
              type="number"
              min={0}
              value={qty[i.product.sku] ?? 0}
              onChange={(e) =>
                setQty((q) => ({ ...q, [i.product.sku]: Math.max(0, Number(e.target.value)) }))
              }
              className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        ))}
      </div>

      <button
        onClick={add}
        disabled={pending}
        className="w-full rounded-full bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:bg-gray-300"
      >
        {pending ? "Adding…" : "Add to cart"}
      </button>
      {msg && (
        <p className={`text-sm ${msg.type === "ok" ? "text-green-600" : "text-red-600"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
