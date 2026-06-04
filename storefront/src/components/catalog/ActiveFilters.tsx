"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RESERVED_PARAMS } from "@/lib/filters";
import type { Aggregation } from "@/lib/types";

export default function ActiveFilters({
  aggregations,
  hide = [],
}: {
  aggregations: Aggregation[];
  hide?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const hideSet = new Set(hide);

  const chips: { code: string; value: string; label: string }[] = [];
  for (const [key, val] of sp.entries()) {
    if (RESERVED_PARAMS.has(key) || hideSet.has(key)) continue;
    const agg = aggregations.find((a) => a.attribute_code === key);
    val
      .split(",")
      .filter(Boolean)
      .forEach((v) => {
        const optLabel = agg?.options.find((o) => o.value === v)?.label ?? v;
        chips.push({ code: key, value: v, label: `${agg?.label ?? key}: ${optLabel}` });
      });
  }

  if (!chips.length) return null;

  function remove(code: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (code === "price") {
      params.delete("price");
    } else {
      const rest = (params.get(code) ?? "")
        .split(",")
        .filter((x) => x && x !== value);
      if (rest.length) params.set(code, rest.join(","));
      else params.delete(code);
    }
    params.delete("page");
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname);
  }

  function clearAll() {
    const params = new URLSearchParams();
    const q = sp.get("q");
    if (q) params.set("q", q);
    const s = params.toString();
    router.push(s ? `${pathname}?${s}` : pathname);
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={`${c.code}-${c.value}`}
          onClick={() => remove(c.code, c.value)}
          className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
        >
          {c.label}
          <span aria-hidden>×</span>
        </button>
      ))}
      <button
        onClick={clearAll}
        className="text-xs font-medium text-gray-500 hover:text-red-600"
      >
        Clear all
      </button>
    </div>
  );
}
