import Link from "next/link";
import type { Metadata } from "next";
import { getPlp } from "@/lib/catalog";
import ProductGrid from "@/components/ProductGrid";
import FilterSidebar from "@/components/catalog/FilterSidebar";
import SortSelect from "@/components/catalog/SortSelect";
import ActiveFilters from "@/components/catalog/ActiveFilters";
import type { SearchParamsObj } from "@/lib/filters";

export const metadata: Metadata = { title: "Search" };

function pageHref(sp: SearchParamsObj, page: number): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page" || v == null) continue;
    if (Array.isArray(v)) v.forEach((x) => p.append(k, x));
    else p.set(k, v);
  }
  p.set("page", String(page));
  return `?${p.toString()}`;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsObj>;
}) {
  const sp = await searchParams;
  const query = (typeof sp.q === "string" ? sp.q : "").trim();
  const page = Math.max(1, parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1);

  const plp = query
    ? await getPlp({ search: query, params: sp, page })
    : null;
  const totalPages = plp?.pageInfo.total_pages ?? 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">
        {query ? (
          <>
            Results for <span className="text-indigo-600">“{query}”</span>
          </>
        ) : (
          "Search"
        )}
      </h1>

      {!query ? (
        <p className="mt-4 text-gray-500">
          Type a query in the search box to find products.
        </p>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
          <FilterSidebar aggregations={plp!.aggregations} />
          <div className="min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">{plp!.totalCount} results</p>
              <SortSelect />
            </div>
            <ActiveFilters aggregations={plp!.aggregations} />
            {plp!.items.length > 0 ? (
              <ProductGrid products={plp!.items} />
            ) : (
              <p className="text-gray-500">No products found.</p>
            )}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={pageHref(sp, page - 1)}
                    className="rounded-full border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    ← Prev
                  </Link>
                )}
                <span className="px-3 text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={pageHref(sp, page + 1)}
                    className="rounded-full border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Next →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
