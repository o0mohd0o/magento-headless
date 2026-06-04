import Link from "next/link";
import { magentoFetch } from "@/lib/magento";
import { TOP_NAV, HEADER_SESSION } from "@/lib/queries";
import { getCartCount } from "@/lib/cart-data";
import { getCustomerToken } from "@/lib/cart-cookies";
import { getCompareCount } from "@/lib/compare";
import SearchBox from "@/components/SearchBox";
import type { Category } from "@/lib/types";

export default async function Header() {
  let categories: Category[] = [];
  try {
    const data = await magentoFetch<{ categoryList: Category[] }>(TOP_NAV, {
      revalidate: 300,
      tags: ["nav"],
    });
    categories = (data.categoryList ?? []).filter((c) => c.include_in_menu !== 0);
  } catch {
    categories = [];
  }

  const token = await getCustomerToken();
  let firstname: string | null = null;
  let count = 0;
  let wishlistCount = 0;

  if (token) {
    try {
      const d = await magentoFetch<{
        customer: { firstname: string; wishlists: { items_count: number }[] } | null;
        customerCart: { total_quantity: number };
      }>(HEADER_SESSION, { token });
      firstname = d.customer?.firstname ?? null;
      wishlistCount = d.customer?.wishlists?.[0]?.items_count ?? 0;
      count = d.customerCart?.total_quantity ?? 0;
    } catch {
      firstname = null;
    }
  } else {
    count = await getCartCount();
  }
  const loggedIn = token !== null;
  const compareCount = await getCompareCount();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
        <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
          Luma<span className="text-indigo-600">·</span>headless
        </Link>

        <nav className="hidden flex-1 items-center gap-5 md:flex">
          {categories.map((c) => (
            <Link
              key={c.uid}
              href={`/category/${c.url_key}`}
              className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden md:block">
          <SearchBox />
        </div>

        <Link
          href="/compare"
          className="hidden text-sm font-medium text-gray-600 transition hover:text-gray-900 sm:inline"
        >
          Compare{compareCount > 0 ? ` (${compareCount})` : ""}
        </Link>
        {loggedIn && (
          <Link
            href="/wishlist"
            className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            ♥ {wishlistCount}
          </Link>
        )}

        {loggedIn ? (
          <Link
            href="/account"
            className="text-sm font-medium text-gray-700 transition hover:text-indigo-700"
          >
            {firstname ? `Hi, ${firstname}` : "Account"}
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium text-gray-700 transition hover:text-indigo-700"
          >
            Sign in
          </Link>
        )}

        <Link
          href="/cart"
          className="relative inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-gray-700"
        >
          <span>Cart</span>
          {count > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1.5 text-xs">
              {count}
            </span>
          )}
        </Link>
      </div>

      <nav className="flex items-center gap-4 overflow-x-auto px-4 pb-2 md:hidden">
        {categories.map((c) => (
          <Link
            key={c.uid}
            href={`/category/${c.url_key}`}
            className="whitespace-nowrap text-sm text-gray-600"
          >
            {c.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}
