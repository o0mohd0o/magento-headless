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
      variables: {
        search: search || null,
        filter: Object.keys(filter).length ? filter : null,
        // Magento rejects a null sort — default to catalog position.
        sort: Object.keys(sort).length ? sort : { position: "ASC" },
        pageSize,
        currentPage: page,
      },
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
  } catch {
    return {
      items: [],
      totalCount: 0,
      pageInfo: { current_page: 1, total_pages: 1 },
      aggregations: [],
    };
  }
}
