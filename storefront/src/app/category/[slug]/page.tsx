import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCategoryInfo, getPlp } from "@/lib/catalog";
import ProductGrid from "@/components/ProductGrid";
import FilterSidebar from "@/components/catalog/FilterSidebar";
import SortSelect from "@/components/catalog/SortSelect";
import ActiveFilters from "@/components/catalog/ActiveFilters";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import CmsContent from "@/components/CmsContent";
import type { SearchParamsObj } from "@/lib/filters";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryInfo(slug);
  return {
    title: cat?.name ?? "Category",
    alternates: { canonical: `/category/${slug}` },
  };
}

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

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParamsObj>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const cat = await getCategoryInfo(slug);
  if (!cat) notFound();

  const page = Math.max(1, parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1);
  const plp = await getPlp({ categoryUid: cat.uid, params: sp, page });
  const children = (cat.children ?? []).filter((c) => (c.product_count ?? 0) > 0);
  const totalPages = plp.pageInfo.total_pages;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: cat.name, url: `/category/${slug}` },
        ]}
      />
      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-800">
          Home
        </Link>{" "}
        / <span className="text-gray-700">{cat.name}</span>
      </nav>
      <h1 className="text-3xl font-bold text-gray-900">{cat.name}</h1>

      {cat.description ? (
        <div className="mt-3 max-w-3xl text-sm">
          <CmsContent html={cat.description} />
        </div>
      ) : null}

      {children.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {children.map((c) => (
            <Link
              key={c.uid}
              href={`/category/${c.url_key}`}
              className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm text-gray-700 transition hover:border-indigo-400 hover:text-indigo-700"
            >
              {c.name}
              <span className="ml-1.5 text-gray-400">{c.product_count}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <FilterSidebar aggregations={plp.aggregations} hide={["category_uid"]} />

        <div className="min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">{plp.totalCount} products</p>
            <SortSelect />
          </div>
          <ActiveFilters aggregations={plp.aggregations} hide={["category_uid"]} />

          {plp.items.length > 0 ? (
            <ProductGrid products={plp.items} />
          ) : (
            <p className="text-gray-500">No products match these filters.</p>
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
    </div>
  );
}
