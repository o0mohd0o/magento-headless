import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCustomerToken } from "@/lib/cart-cookies";
import { getWishlist } from "@/lib/wishlist";
import WishlistList from "@/components/WishlistList";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const token = await getCustomerToken();
  if (!token) redirect("/login");

  const wishlist = await getWishlist();
  const items = wishlist?.items ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Your wishlist</h1>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">Your wishlist is empty.</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <WishlistList items={items} />
      )}
    </div>
  );
}
