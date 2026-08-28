import "server-only";
import { magentoFetch } from "./magento";
import { CATEGORY_INFO, PLP_PRODUCTS } from "./queries";
import {
  buildProductFilter,
  buildSort,
  decodeHtmlEntities,
  type SearchParamsObj,
} from "./filters";
import type { Aggregation, Category, PageInfo, Product } from "./types";

export type CategoryInfo = Category & {
  description?: string | null;
  children?: (Category & { product_count?: number | null })[] | null;
};

export async function getCategoryInfo(
  urlKey: string,
): Promise<CategoryInfo | null> {
  try {
    const { categoryList } = await magentoFetch<{ categoryList: CategoryInfo[] }>(
      CATEGORY_INFO,
      { variables: { urlKey }, revalidate: 300, tags: ["catalog"] },
    );
    return categoryList?.[0] ?? null;
  } catch {
    return null;
  }
}

export type PlpResult = {
  items: Product[];
  totalCount: number;
  pageInfo: PageInfo;
  aggregations: Aggregation[];
};

/**
 * Build PLP variables, omitting anything empty.
 *
 * Magento's products resolver throws a generic "Internal server error" when a
 * nullable argument is supplied as an EXPLICIT null; leaving the variable out
 * entirely is the supported way to say "not provided". Category pages always
 * carry a filter, which is why only search hit this. `position` sorting also
 * needs a category context, so search falls back to relevance.
 */
function buildPlpVariables(o: {
  search?: string;
  filter: Record<string, unknown>;
  sort: Record<string, "ASC" | "DESC">;
  pageSize: number;
  page: number;
}): Record<string, unknown> {
  const vars: Record<string, unknown> = {
    pageSize: o.pageSize,
    currentPage: o.page,
  };
  if (o.search) vars.search = o.search;
  if (Object.keys(o.filter).length) vars.filter = o.filter;
  if (Object.keys(o.sort).length) vars.sort = o.sort;
  else vars.sort = o.search ? { relevance: "DESC" } : { position: "ASC" };
  return vars;
}

export async function getPlp(opts: {
  categoryUid?: string;
  search?: string;
  params: SearchParamsObj;
  page: number;
  pageSize?: number;
}): Promise<PlpResult> {
  const { categoryUid, search, params, page, pageSize = 12 } = opts;
  const filter = buildProductFilter(params, categoryUid);
  const sort = buildSort(typeof params.sort === "string" ? params.sort : undefined);

  try {
    const { products } = await magentoFetch<{
      products: {
        total_count: number;
        page_info: PageInfo;
        aggregations: Aggregation[];
        items: Product[];
      };
    }>(PLP_PRODUCTS, {
      variables: buildPlpVariables({ search, filter, sort, pageSize, page }),
      revalidate: 60,
      tags: ["catalog"],
    });
    return {
      items: products.items,
      totalCount: products.total_count,
      pageInfo: products.page_info,
      // Facet labels come back HTML-encoded ("Cocona&reg; …") — decode once
      // here so every consumer (sidebar, active-filter chips) renders clean.
      aggregations: (products.aggregations ?? []).map((agg) => ({
        ...agg,
        label: decodeHtmlEntities(agg.label),
        options: agg.options.map((o) => ({
          ...o,
          label: decodeHtmlEntities(o.label),
        })),
      })),
    };
  } catch (e) {
    // Never swallow silently — a failure here renders an empty catalogue.
    console.error("getPlp failed", { search, categoryUid, page }, e);
    return {
      items: [],
      totalCount: 0,
      pageInfo: { current_page: 1, total_pages: 1 },
      aggregations: [],
    };
  }
}
