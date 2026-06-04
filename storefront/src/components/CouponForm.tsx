"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyCouponAction, removeCouponAction } from "@/lib/actions";

export default function CouponForm({ applied }: { applied?: string | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function apply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = String(new FormData(e.currentTarget).get("code") ?? "").trim();
    if (!code) return;
    setErr(null);
    startTransition(async () => {
      const r = await applyCouponAction(code);
      if (r.ok) router.refresh();
      else setErr(r.error ?? "Invalid coupon code.");
    });
  }

  function remove() {
    startTransition(async () => {
      await removeCouponAction();
      router.refresh();
    });
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm">
        <span className="text-green-700">
          Coupon <strong>{applied}</strong> applied
        </span>
        <button
          onClick={remove}
          disabled={pending}
          className="text-gray-500 hover:text-red-600"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={apply} className="flex gap-2">
        <input
          name="code"
          placeholder="Discount code"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button
          disabled={pending}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Apply
        </button>
      </form>
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  );
}
