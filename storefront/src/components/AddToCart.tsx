"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/lib/actions";
import type { ConfigurableOption } from "@/lib/types";

export default function AddToCart({
  sku,
  options = [],
  inStock = true,
}: {
  sku: string;
  options?: ConfigurableOption[];
  inStock?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // attribute_code -> selected value uid
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  );

  const allSelected = options.every((o) => selected[o.attribute_code]);
  const canAdd = inStock && allSelected && !pending;

  function add() {
    setMsg(null);
    const selectedOptions = options
      .map((o) => selected[o.attribute_code])
      .filter(Boolean);

    startTransition(async () => {
      const res = await addToCartAction({
        sku,
        quantity: 1,
        selectedOptions: selectedOptions.length ? selectedOptions : undefined,
      });
      if (res.ok) {
        setMsg({ type: "ok", text: "✓ Added to your cart" });
        router.refresh();
      } else {
        setMsg({
          type: "err",
          text: res.errors[0]?.message || "Could not add to cart",
        });
      }
    });
  }

  return (
    <div className="space-y-5">
      {options.map((opt) => {
        const isColor = opt.attribute_code === "color";
        return (
          <div key={opt.attribute_code}>
            <div className="mb-2 text-sm font-medium text-gray-700">
              {opt.label}
              {selected[opt.attribute_code] && (
                <span className="ml-2 font-normal text-gray-500">
                  {
                    opt.values.find(
                      (v) => v.uid === selected[opt.attribute_code],
                    )?.label
                  }
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {opt.values.map((v) => {
                const active = selected[opt.attribute_code] === v.uid;
                const swatch = v.swatch_data?.value;
                const isHex = isColor && swatch?.startsWith("#");
                return (
                  <button
                    key={v.uid}
                    type="button"
                    title={v.label}
                    onClick={() =>
                      setSelected((s) => ({
                        ...s,
                        [opt.attribute_code]: v.uid,
                      }))
                    }
                    className={
                      isHex
                        ? `h-9 w-9 rounded-full border-2 ${active ? "border-indigo-600 ring-2 ring-indigo-200" : "border-gray-200"}`
                        : `min-w-9 rounded-md border-2 px-3 py-1.5 text-sm ${active ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"}`
                    }
                    style={isHex ? { backgroundColor: swatch } : undefined}
                  >
                    {isHex ? "" : v.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <button
        onClick={add}
        disabled={!canAdd}
        className="w-full rounded-full bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {pending
          ? "Adding…"
          : !inStock
            ? "Out of stock"
            : options.length && !allSelected
              ? "Select options"
              : "Add to cart"}
      </button>

      {msg && (
        <p
          className={`text-sm ${msg.type === "ok" ? "text-green-600" : "text-red-600"}`}
          role="status"
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
