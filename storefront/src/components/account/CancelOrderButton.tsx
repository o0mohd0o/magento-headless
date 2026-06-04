"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelOrderAction } from "@/lib/account-actions";

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function cancel() {
    const reason = window.prompt("Reason for cancellation?", "Changed my mind");
    if (reason === null) return;
    setErr(null);
    startTransition(async () => {
      const r = await cancelOrderAction(orderId, reason || "Other");
      if (r.ok) router.refresh();
      else setErr(r.error ?? "Could not cancel.");
    });
  }

  return (
    <div>
      <button
        onClick={cancel}
        disabled={pending}
        className="rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
      >
        {pending ? "Cancelling…" : "Cancel order"}
      </button>
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  );
}
