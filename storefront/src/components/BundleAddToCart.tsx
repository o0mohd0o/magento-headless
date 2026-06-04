"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/lib/actions";
import type { BundleItem } from "@/lib/types";

export default function BundleAddToCart({
  sku,
  items,
}: {
  sku: string;
  items: BundleItem[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Record<number, string[]>>({});
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function toggle(item: BundleItem, uid: string) {
    const single = item.type === "radio" || item.type === "select";
    setSelected((s) => {
      if (single) return { ...s, [item.option_id]: [uid] };
      const cur = new Set(s[item.option_id] ?? []);
      cur.has(uid) ? cur.delete(uid) : cur.add(uid);
      return { ...s, [item.option_id]: [...cur] };
    });
  }

  const requiredOk = items
    .filter((i) => i.required)
    .every((i) => (selected[i.option_id] ?? []).length > 0);

  function add() {
    setMsg(null);
    const selectedOptions = Object.values(selected).flat();
    startTransition(async () => {
      const r = await addToCartAction({ sku, quantity: 1, selectedOptions });
      if (r.ok) {
        setMsg({ type: "ok", text: "✓ Added to your cart" });
        router.refresh();
      } else {
        setMsg({ type: "err", text: r.errors[0]?.message ?? "Could not add to cart" });
      }
    });
  }

  return (
    <div className="space-y-5">
      {items.map((item) => {
        const single = item.type === "radio" || item.type === "select";
        return (
          <div key={item.option_id}>
            <div className="mb-2 text-sm font-medium text-gray-700">
              {item.title}
              {item.required && <span className="ml-1 text-red-500">*</span>}
            </div>
            <div className="space-y-1.5">
              {item.options.map((o) => {
                const checked = (selected[item.option_id] ?? []).includes(o.uid);
                return (
                  <label
                    key={o.uid}
                    className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
                  >
                    <input
                      type={single ? "radio" : "checkbox"}
                      name={`bundle-${item.option_id}`}
                      checked={checked}
                      onChange={() => toggle(item, o.uid)}
                    />
                    <span>
                      {o.quantity} × {o.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      <button
        onClick={add}
        disabled={!requiredOk || pending}
        className="w-full rounded-full bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {pending ? "Adding…" : requiredOk ? "Add to cart" : "Select options"}
      </button>
      {msg && (
        <p className={`text-sm ${msg.type === "ok" ? "text-green-600" : "text-red-600"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
