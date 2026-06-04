import Link from "next/link";
import type { Metadata } from "next";
import { getOverview } from "@/lib/account";
import { formatMoney } from "@/lib/format";
import NewsletterForm from "@/components/NewsletterForm";

export const metadata: Metadata = { title: "Account" };

export default async function AccountDashboard() {
  const customer = await getOverview();
  if (!customer) return null;

  const orders = customer.orders?.items ?? [];
  const address = customer.addresses?.[0];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Profile
          </h2>
          <p className="mt-2 font-medium text-gray-900">
            {customer.firstname} {customer.lastname}
          </p>
          <p className="text-sm text-gray-500">{customer.email}</p>
          <Link
            href="/account/profile"
            className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline"
          >
            Edit profile →
          </Link>
        </div>
        <div className="rounded-2xl border border-gray-200 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Default address
          </h2>
          {address ? (
            <p className="mt-2 text-sm text-gray-700">
              {address.street?.join(", ")}, {address.city},{" "}
              {address.region?.region_code} {address.postcode}
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-500">No address saved.</p>
          )}
          <Link
            href="/account/addresses"
            className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline"
          >
            Manage addresses →
          </Link>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent orders</h2>
          <Link
            href="/account/orders"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            View all
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-500">You have no orders yet.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr key={o.number} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/account/orders/${o.number}`}
                        className="font-medium text-indigo-600 hover:underline"
                      >
                        #{o.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{o.order_date}</td>
                    <td className="px-4 py-3 text-gray-500">{o.status}</td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {formatMoney(o.total.grand_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Newsletter
        </h2>
        <p className="mb-3 mt-1 text-sm text-gray-500">
          Get product news and offers.
        </p>
        <NewsletterForm />
      </div>
    </div>
  );
}
