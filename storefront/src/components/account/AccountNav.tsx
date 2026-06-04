"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/auth";

const links = [
  { href: "/account", label: "Dashboard" },
  { href: "/account/orders", label: "Orders" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/payment", label: "Payment" },
  { href: "/account/profile", label: "Profile" },
];

export default function AccountNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-row gap-2 overflow-x-auto md:flex-col">
      {links.map((l) => {
        const active =
          l.href === "/account"
            ? pathname === "/account"
            : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
      <form action={logoutAction} className="md:mt-4">
        <button
          type="submit"
          className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-red-600"
        >
          Sign out
        </button>
      </form>
    </nav>
  );
}
