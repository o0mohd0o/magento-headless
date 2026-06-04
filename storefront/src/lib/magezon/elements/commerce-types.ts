/**
 * commerce-types — the element types the commerce adapter handles.
 *
 * Kept in its OWN module (no 'use client') so React Server Components can import
 * the array as real data. Importing a plain value (not a component) from a
 * 'use client' module yields a client-reference proxy on the server, which broke
 * `COMMERCE_TYPES.map(...)` in register-defaults. Components may still come from
 * the client module; only the data lives here.
 */
export const COMMERCE_TYPES = [
  'product_grid',
  'product_list',
  'product_slider',
  'single_product',
  'products',
  'categories',
  'recent_reviews',
] as const;
