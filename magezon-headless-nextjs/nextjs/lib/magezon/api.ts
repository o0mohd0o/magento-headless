/**
 * api.ts — GraphQL helpers for fetching Magezon content from the
 * QasrAlawani_MagezonHeadless module.
 *
 * Framework-agnostic fetch (works in Next.js Server Components, route handlers,
 * getServerSideProps, etc.). Set MAGENTO_GRAPHQL_URL in your env. Replace the
 * thin `gqlFetch` with your project's Apollo/urql client if you already have one.
 */
import type { MagezonContent } from './types';

const ENDPOINT = process.env.MAGENTO_GRAPHQL_URL || process.env.NEXT_PUBLIC_MAGENTO_GRAPHQL_URL || '';

export const MAGEZON_CONTENT_QUERY = /* GraphQL */ `
  query MagezonContent($identifier: String!, $type: MagezonContentType) {
    magezonContent(identifier: $identifier, type: $type) {
      identifier
      title
      has_pagebuilder
      profile_json
      media_base_url
      raw_html
    }
  }
`;

interface GqlResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

async function gqlFetch<T>(
  query: string,
  variables: Record<string, unknown>,
  init?: RequestInit & { storeCode?: string },
): Promise<T> {
  if (!ENDPOINT) {
    throw new Error('MAGENTO_GRAPHQL_URL is not set.');
  }
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (init?.storeCode) headers.Store = init.storeCode;

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    // Cache CMS content at the data layer; tune per your ISR/revalidate strategy.
    next: { revalidate: 300 },
    ...init,
  });

  const json = (await res.json()) as GqlResponse<T>;
  if (json.errors?.length) {
    throw new Error(`GraphQL error: ${json.errors.map((e) => e.message).join('; ')}`);
  }
  if (!json.data) throw new Error('GraphQL returned no data.');
  return json.data;
}

export async function fetchMagezonContent(
  identifier: string,
  type: 'CMS_PAGE' | 'CMS_BLOCK' = 'CMS_PAGE',
  opts?: { storeCode?: string },
): Promise<MagezonContent> {
  const data = await gqlFetch<{ magezonContent: MagezonContent }>(
    MAGEZON_CONTENT_QUERY,
    { identifier, type },
    { storeCode: opts?.storeCode },
  );
  return data.magezonContent;
}

export const MAGEZON_PREVIEW_QUERY = /* GraphQL */ `
  query MagezonPreview($builderId: String!) {
    magezonPreview(builder_id: $builderId) {
      has_pagebuilder
      profile_json
      media_base_url
      updated_at
    }
  }
`;

/**
 * Live preview fetch — used by the /magezon-preview page, which polls it so
 * editors see their builder changes rendered by the real components. Runs in the
 * browser, so it uses NEXT_PUBLIC_MAGENTO_GRAPHQL_URL and never caches.
 */
export async function fetchMagezonPreview(
  builderId: string,
  opts?: { storeCode?: string; signal?: AbortSignal },
): Promise<MagezonContent> {
  const endpoint =
    process.env.NEXT_PUBLIC_MAGENTO_GRAPHQL_URL || process.env.MAGENTO_GRAPHQL_URL || '';
  if (!endpoint) throw new Error('NEXT_PUBLIC_MAGENTO_GRAPHQL_URL is not set.');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts?.storeCode) headers.Store = opts.storeCode;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: MAGEZON_PREVIEW_QUERY, variables: { builderId } }),
    cache: 'no-store',
    signal: opts?.signal,
  });
  const json = (await res.json()) as GqlResponse<{ magezonPreview: MagezonContent }>;
  if (json.errors?.length) {
    throw new Error(`GraphQL error: ${json.errors.map((e) => e.message).join('; ')}`);
  }
  if (!json.data) throw new Error('GraphQL returned no data.');
  return json.data.magezonPreview;
}

/* ------------------------------------------------------------------------ *
 * Commerce — products() / categoryList() for the Magezon product elements.
 * Used by the default commerce adapter (override with MagezonCommerceProvider).
 * ------------------------------------------------------------------------ */

export interface MagezonProduct {
  uid: string;
  sku: string;
  name: string;
  url_key: string;
  url: string; // resolved storefront path
  image: { url: string; label: string } | null;
  price: { value: number; currency: string } | null;
  regularPrice: { value: number; currency: string } | null;
}

export interface MagezonCategory {
  uid: string;
  name: string;
  url: string;
  image: string | null;
  productCount: number;
}

const PRODUCTS_QUERY = /* GraphQL */ `
  query MagezonProducts($filter: ProductAttributeFilterInput!, $pageSize: Int!, $sort: ProductAttributeSortInput) {
    products(filter: $filter, pageSize: $pageSize, sort: $sort) {
      items {
        uid sku name url_key
        url_rewrites { url }
        small_image { url label }
        price_range {
          minimum_price {
            final_price { value currency }
            regular_price { value currency }
          }
        }
      }
    }
  }
`;

const CATEGORIES_QUERY = /* GraphQL */ `
  query MagezonCategories($ids: [String!]!) {
    categoryList(filters: { ids: { in: $ids } }) {
      uid name url_path url_key image product_count
    }
  }
`;

/** Minimal client-side GraphQL POST (no Next.js cache opts) for browser components. */
async function clientGql<T>(query: string, variables: Record<string, unknown>, storeCode?: string): Promise<T> {
  const endpoint = process.env.NEXT_PUBLIC_MAGENTO_GRAPHQL_URL || process.env.MAGENTO_GRAPHQL_URL || '';
  if (!endpoint) throw new Error('NEXT_PUBLIC_MAGENTO_GRAPHQL_URL is not set.');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (storeCode) headers.Store = storeCode;
  const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify({ query, variables }) });
  const json = (await res.json()) as GqlResponse<T>;
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('; '));
  if (!json.data) throw new Error('GraphQL returned no data.');
  return json.data;
}

interface RawProduct {
  uid: string;
  sku: string;
  name: string;
  url_key: string;
  url_rewrites?: Array<{ url: string }>;
  small_image?: { url: string; label: string } | null;
  price_range?: {
    minimum_price?: {
      final_price?: { value: number; currency: string };
      regular_price?: { value: number; currency: string };
    };
  };
}

function mapProduct(p: RawProduct): MagezonProduct {
  const rewrite = p.url_rewrites?.[0]?.url;
  return {
    uid: p.uid,
    sku: p.sku,
    name: p.name,
    url_key: p.url_key,
    url: rewrite ? `/${rewrite.replace(/^\/+/, '')}` : `/${p.url_key}`,
    image: p.small_image ? { url: p.small_image.url, label: p.small_image.label || p.name } : null,
    price: p.price_range?.minimum_price?.final_price ?? null,
    regularPrice: p.price_range?.minimum_price?.regular_price ?? null,
  };
}

/**
 * Fetch products for a Magezon product element.
 * Supply `skus` (specific products, order preserved) and/or `categoryId`. `sort`
 * is a ProductAttributeSortInput object, e.g. { position: "ASC" }.
 */
export async function fetchProducts(
  args: { skus?: string[]; categoryId?: string; pageSize?: number; sort?: Record<string, string>; storeCode?: string },
): Promise<MagezonProduct[]> {
  const filter: Record<string, unknown> = {};
  if (args.skus && args.skus.length) filter.sku = { in: args.skus };
  if (args.categoryId) filter.category_id = { eq: String(args.categoryId) };
  if (!Object.keys(filter).length) return []; // condition-based selection needs host logic

  const data = await clientGql<{ products: { items: RawProduct[] } }>(
    PRODUCTS_QUERY,
    { filter, pageSize: args.pageSize && args.pageSize > 0 ? args.pageSize : 20, sort: args.sort ?? null },
    args.storeCode,
  );
  let items = (data.products?.items ?? []).map(mapProduct);

  // Preserve the builder's explicit SKU order (products() ignores `in` ordering).
  if (args.skus && args.skus.length) {
    const order = new Map(args.skus.map((s, i) => [s, i]));
    items = items.slice().sort((a, b) => (order.get(a.sku) ?? 1e9) - (order.get(b.sku) ?? 1e9));
  }
  return items;
}

interface RawCategory {
  uid: string;
  name: string;
  url_path?: string;
  url_key?: string;
  image?: string | null;
  product_count?: number;
}

export async function fetchCategories(ids: string[], storeCode?: string): Promise<MagezonCategory[]> {
  if (!ids.length) return [];
  const data = await clientGql<{ categoryList: RawCategory[] }>(CATEGORIES_QUERY, { ids }, storeCode);
  return (data.categoryList ?? []).map((c) => ({
    uid: c.uid,
    name: c.name,
    url: `/${(c.url_path || c.url_key || '').replace(/^\/+/, '')}`,
    image: c.image ?? null,
    productCount: c.product_count ?? 0,
  }));
}
