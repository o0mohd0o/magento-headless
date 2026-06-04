import Link from "next/link";
import NewsletterForm from "./NewsletterForm";
import StoreSwitcher from "./StoreSwitcher";

const links = [
  { href: "/page/about-us", label: "About us" },
  { href: "/page/customer-service", label: "Customer Service" },
  { href: "/contact", label: "Contact us" },
  {
    href: "/page/privacy-policy-cookie-restriction-mode",
    label: "Privacy Policy",
  },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-lg font-bold text-gray-900">
              Luma<span className="text-indigo-600">·</span>headless
            </p>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              A headless storefront — Magento Open Source 2.4.9 backend, Next.js
              frontend.
            </p>
          </div>
          <nav className="flex flex-col gap-2 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-gray-600 hover:text-indigo-700"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-900">
              Newsletter
            </p>
            <NewsletterForm />
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Catalog &amp; cart served live over Magento GraphQL.
          </p>
          <StoreSwitcher />
        </div>
      </div>
    </footer>
  );
}
