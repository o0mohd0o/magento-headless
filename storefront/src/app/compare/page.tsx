import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getCompareProducts } from "@/lib/compare";
import { formatMoney } from "@/lib/format";
import CompareRemove from "@/components/CompareRemove";

export const metadata: Metadata = { title: "Compare" };

const strip = (html?: string | null) =>
  (html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export default async function ComparePage() {
  const items = await getCompareProducts();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Compare products</h1>
        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">
            You haven’t added any products to compare yet — use “Add to compare”
            on a product page.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
          >
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  const rows: { label: string; render: (p: (typeof items)[number]) => React.ReactNode }[] = [
    {
      label: "Price",
      render: (p) => formatMoney(p.price_range.minimum_price.final_price),
    },
    {
      label: "Availability",
      render: (p) =>
        p.stock_status === "OUT_OF_STOCK" ? (
          <span className="text-red-500">Out of stock</span>
        ) : (
          <span className="text-green-600">In stock</span>
        ),
    },
    { label: "SKU", render: (p) => p.sku },
    {
      label: "Description",
      render: (p) => (
        <span className="text-gray-600">{strip(p.description?.html).slice(0, 200)}</span>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Compare products</h1>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-32 p-3" />
              {items.map((p) => (
                <th key={p.sku} className="border-b border-gray-200 p-3 text-left align-top">
                  <Link href={`/product/${p.url_key}`} className="block">
                    <div className="relative mb-2 aspect-square w-28 overflow-hidden rounded-lg bg-gray-100">
                      {p.small_image?.url && (
                        <Image
                          src={p.small_image.url}
                          alt={p.name}
                          fill
                          sizes="112px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <span className="font-medium text-gray-900">{p.name}</span>
                  </Link>
                  <div className="mt-1">
                    <CompareRemove sku={p.sku} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="odd:bg-gray-50">
                <td className="p-3 font-medium text-gray-500">{row.label}</td>
                {items.map((p) => (
                  <td key={p.sku} className="p-3 align-top text-gray-700">
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
