"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setCurrencyAction, setStoreAction } from "@/lib/store-actions";

type Store = { store_code: string; store_name: string };

export default function StoreSwitcherClient({
  stores,
  currencies,
  currentStore,
  currentCurrency,
}: {
  stores: Store[];
  currencies: string[];
  currentStore: string;
  currentCurrency: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function change(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setErr(null);
    startTransition(async () => {
      const r = await fn();
      if (!r.ok) setErr(r.error ?? "Could not switch.");
      else router.refresh();
    });
  }

  const selectClass =
    "rounded-lg border border-gray-300 px-2 py-1 disabled:opacity-60";

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      {stores.length > 1 && (
        <select
          value={currentStore}
          disabled={pending}
          onChange={(e) => change(() => setStoreAction(e.target.value))}
          className={selectClass}
          aria-label="Store view"
        >
          {stores.map((s) => (
            <option key={s.store_code} value={s.store_code}>
              {s.store_name}
            </option>
          ))}
        </select>
      )}
      {currencies.length > 1 && (
        <select
          value={currentCurrency}
          disabled={pending}
          onChange={(e) => change(() => setCurrencyAction(e.target.value))}
          className={selectClass}
          aria-label="Currency"
        >
          {currencies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      )}
      {err && (
        <span role="alert" className="text-xs text-red-600">
          {err}
        </span>
      )}
    </div>
  );
}
