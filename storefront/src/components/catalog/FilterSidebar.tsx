"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HIDDEN_FACETS } from "@/lib/filters";
import type { Aggregation } from "@/lib/types";

function Facet({
  facet,
  selected,
  onToggle,
}: {
  facet: Aggregation;
  selected: Set<string>;
  onToggle: (code: string, value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const options = expanded ? facet.options : facet.options.slice(0, 6);
  const isColor = facet.attribute_code === "color";

  return (
    <div className="border-b border-gray-100 pb-4">
      <h3 className="mb-2 text-sm font-semibold text-gray-900">{facet.label}</h3>
      <ul className="space-y-1.5">
        {options.map((o) => {
          const checked = selected.has(o.value);
          return (
            <li key={o.value}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                <input
                  type={facet.attribute_code === "price" ? "radio" : "checkbox"}
                  checked={checked}
                  onChange={() => onToggle(facet.attribute_code, o.value)}
                  className="h-4 w-4"
                />
                <span className="flex-1">{o.label}</span>
                <span className="text-xs text-gray-400">{o.count}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {facet.options.length > 6 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-xs font-medium text-indigo-600 hover:underline"
        >
          {expanded ? "Show less" : `+${facet.options.length - 6} more`}
        </button>
      )}
    </div>
  );
}

export default function FilterSidebar({
  aggregations,
  hide = [],
}: {
  aggregations: Aggregation[];
  hide?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const hideSet = new Set([...hide, ...HIDDEN_FACETS]);
  const facets = aggregations.filter(
    (a) => !hideSet.has(a.attribute_code) && a.options.length > 0,
  );

  function selectedFor(code: string): Set<string> {
    return new Set((sp.get(code) ?? "").split(",").filter(Boolean));
  }

  function navigate(params: URLSearchParams) {
    params.delete("page");
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname);
  }

  function toggle(code: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (code === "price") {
      if (params.get("price") === value) params.delete("price");
      else params.set("price", value);
      navigate(params);
      return;
    }
    const sel = selectedFor(code);
    if (sel.has(value)) sel.delete(value);
    else sel.add(value);
    if (sel.size) params.set(code, [...sel].join(","));
    else params.delete(code);
    navigate(params);
  }

  if (!facets.length) return null;

  return (
    <aside className="space-y-4">
      {facets.map((f) => (
        <Facet
          key={f.attribute_code}
          facet={f}
          selected={selectedFor(f.attribute_code)}
          onToggle={toggle}
        />
      ))}
    </aside>
  );
}
