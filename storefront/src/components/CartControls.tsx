"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeItemAction, updateItemQtyAction } from "@/lib/actions";

export default function CartControls({
  uid,
  quantity,
}: {
  uid: string;
  quantity: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setQty(q: number) {
    if (q < 1) return;
    startTransition(async () => {
      await updateItemQtyAction(uid, q);
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      await removeItemAction(uid);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-4">
      <div className="inline-flex items-center rounded-full border border-gray-300">
        <button
          onClick={() => setQty(quantity - 1)}
          disabled={pending || quantity <= 1}
          aria-label="Decrease quantity"
          className="px-3 py-1 text-lg leading-none text-gray-600 disabled:opacity-40"
        >
          −
        </button>
        <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
        <button
          onClick={() => setQty(quantity + 1)}
          disabled={pending}
          aria-label="Increase quantity"
          className="px-3 py-1 text-lg leading-none text-gray-600 disabled:opacity-40"
        >
          +
        </button>
      </div>
      <button
        onClick={remove}
        disabled={pending}
        className="text-sm text-gray-500 transition hover:text-red-600 disabled:opacity-40"
      >
        Remove
      </button>
    </div>
  );
}
