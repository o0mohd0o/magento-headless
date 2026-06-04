"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reorderAction } from "@/lib/account-actions";

export default function ReorderButton({ number }: { number: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function reorder() {
    setMsg(null);
    startTransition(async () => {
      const r = await reorderAction(number);
      if (r.ok) {
        if (r.error) setMsg(r.error);
        router.push("/cart");
      } else {
        setMsg(r.error ?? "Could not reorder.");
      }
    });
  }

  return (
    <div>
      <button
        onClick={reorder}
        disabled={pending}
        className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:bg-gray-300"
      >
        {pending ? "Adding…" : "Reorder"}
      </button>
      {msg && <p className="mt-2 text-sm text-amber-600">{msg}</p>}
    </div>
  );
}
