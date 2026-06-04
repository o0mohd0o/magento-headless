"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  moveWishlistItemToCartAction,
  removeFromWishlistAction,
} from "@/lib/wishlist-actions";
import { formatMoney } from "@/lib/format";
import type { WishlistItem } from "@/lib/types";

export default function WishlistList({ items }: { items: WishlistItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function move(id: string) {
    setErr(null);
    startTransition(async () => {
      const r = await moveWishlistItemToCartAction(id);
      if (!r.ok) setErr(r.error ?? "Could not add to cart.");
      else router.refresh();
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      await removeFromWishlistAction(id);
      router.refresh();
    });
  }

  return (
    <div>
      {err && <p className="mb-3 text-sm text-red-600">{err}</p>}
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="group">
            <Link
              href={`/product/${item.product.url_key}`}
              className="block overflow-hidden rounded-xl bg-gray-100"
            >
              <div className="relative aspect-square">
                {item.product.small_image?.url && (
                  <Image
                    src={item.product.small_image.url}
                    alt={item.product.name}
                    fill
                    sizes="(max-width:640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
            </Link>
            <h3 className="mt-3 line-clamp-1 text-sm font-medium text-gray-800">
              {item.product.name}
            </h3>
            <p className="text-sm font-semibold text-gray-900">
              {formatMoney(item.product.price_range.minimum_price.final_price)}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={() => move(item.id)}
                disabled={pending}
                className="rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                Add to cart
              </button>
              <button
                onClick={() => remove(item.id)}
                disabled={pending}
                className="text-xs text-gray-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
