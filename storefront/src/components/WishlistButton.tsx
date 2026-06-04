"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToWishlistAction } from "@/lib/wishlist-actions";

export default function WishlistButton({ sku }: { sku: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function add() {
    setMsg(null);
    startTransition(async () => {
      const r = await addToWishlistAction(sku);
      if (r.needLogin) {
        router.push("/login");
        return;
      }
      if (r.ok) {
        setAdded(true);
        setMsg("Saved to your wishlist");
      } else {
        setMsg(r.error ?? "Could not save.");
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={add}
        disabled={pending || added}
        className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-400 disabled:opacity-60"
      >
        <span className={added ? "text-red-500" : ""}>{added ? "♥" : "♡"}</span>
        {added ? "Saved" : "Save to wishlist"}
      </button>
      {msg && <span className="text-sm text-gray-500">{msg}</span>}
    </div>
  );
}
