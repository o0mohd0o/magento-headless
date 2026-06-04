import Link from "next/link";
import type { Metadata } from "next";
import { getOrders } from "@/lib/account";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const current = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const { items, totalPages, currentPage } = await getOrders(current);

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Order history</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">You have no orders yet.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Order #</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((o) => (
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

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <Link
              href={`/account/orders?page=${currentPage - 1}`}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              ← Prev
            </Link>
          )}
          <span className="px-3 text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={`/account/orders?page=${currentPage + 1}`}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
