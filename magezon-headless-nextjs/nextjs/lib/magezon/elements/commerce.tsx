/**
 * commerce.tsx — renders Magezon's PRODUCT/CATEGORY elements.
 *
 * Magezon product elements carry SELECTION CRITERIA (skus, category, sort, limit,
 * columns), not product data — on the monolith a PHP block runs a collection at
 * render time. Here the default adapter fetches the same data from Magento's
 * standard storefront GraphQL (`products` / `categoryList`) and renders default
 * cards in grid / list / slider layouts.
 *
 * Two ways to customize:
 *   1. Keep the default fetch but restyle — override per type with your own card:
 *        registerElement('product_grid', MyProductGrid)
 *   2. Replace data + rendering wholesale via context:
 *        <MagezonCommerceProvider renderer={(criteria, el) => <MyGrid .../>}>
 *
 * Needs NEXT_PUBLIC_MAGENTO_GRAPHQL_URL. `condition`-based selection (Magento
 * rule conditions) can't be expressed via `products()` filters — supply those
 * through the provider.
 */
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { MagezonElement, MagezonElementProps } from '../types';
import { bool, str } from '../media';
import { fetchProducts, fetchCategories } from '../api';
import type { MagezonProduct, MagezonCategory } from '../api';

/* ----------------------------- criteria ------------------------------ */

export interface ProductSelectionCriteria {
  type: string;
  source: string; // 'skus' | 'category' | 'condition'
  skus: string[];
  categoryId: string;
  categoryIds: string[];
  conditionsEncoded: string;
  limit: number;
  sort: Record<string, string> | undefined;
  columns: number;
  title: string;
}

function splitList(v: unknown): string[] {
  const s = str(v);
  return s ? s.split(/[\s,]+/).filter(Boolean) : [];
}

function mapSort(sortBy: string): Record<string, string> | undefined {
  switch (sortBy) {
    case 'price':
    case 'price_asc':
      return { price: 'ASC' };
    case 'price_desc':
      return { price: 'DESC' };
    case 'name':
      return { name: 'ASC' };
    case 'newest':
    case 'created_at':
      return { created_at: 'DESC' };
    case 'position':
      return { position: 'ASC' };
    default:
      return undefined;
  }
}

export function readCriteria(element: MagezonElement): ProductSelectionCriteria {
  const skus =
    splitList(element.product_ids).length
      ? splitList(element.product_ids)
      : splitList(element.skus).length
        ? splitList(element.skus)
        : splitList(element.product_sku).length
          ? splitList(element.product_sku)
          : splitList(element.product);
  const categoryIds = splitList(element.category_ids).length
    ? splitList(element.category_ids)
    : splitList(element.categories).length
      ? splitList(element.categories)
      : splitList(element.category_id);

  return {
    type: element.type,
    source: str(element.data_source) || str(element.source) || (skus.length ? 'skus' : categoryIds.length ? 'category' : 'condition'),
    skus,
    categoryId: categoryIds[0] || '',
    categoryIds,
    conditionsEncoded: str(element.conditions_encoded) || str(element.conditions),
    limit: Number(str(element.limit) || str(element.product_count) || '0') || 0,
    sort: mapSort(str(element.sort_by) || str(element.order_by)),
    columns:
      Number(str(element.columns) || str(element.owl_item_xl) || str(element.item_xl) || '') || 4,
    title: str(element.title),
  };
}

/* ----------------------------- provider ------------------------------ */

export type CommerceRenderer = (criteria: ProductSelectionCriteria, element: MagezonElement) => React.ReactNode;
const CommerceContext = createContext<CommerceRenderer | null>(null);

export function MagezonCommerceProvider({ renderer, children }: { renderer: CommerceRenderer; children: React.ReactNode }) {
  return <CommerceContext.Provider value={renderer}>{children}</CommerceContext.Provider>;
}

const isDev = process.env.NODE_ENV !== 'production';

/* ----------------------------- cards --------------------------------- */

function money(p: { value: number; currency: string } | null): string {
  if (!p) return '';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: p.currency }).format(p.value);
  } catch {
    return `${p.value} ${p.currency}`;
  }
}

function ProductCard({ product, layout }: { product: MagezonProduct; layout: 'grid' | 'list' | 'slider' }) {
  const onSale = product.regularPrice && product.price && product.regularPrice.value > product.price.value;
  const row = layout === 'list';
  return (
    <a
      href={product.url}
      className="mgz-product-item"
      style={{
        display: 'flex',
        flexDirection: row ? 'row' : 'column',
        gap: row ? 16 : 8,
        textDecoration: 'none',
        color: 'inherit',
        alignItems: row ? 'center' : 'stretch',
      }}
    >
      {product.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image.url}
          alt={product.image.label}
          loading="lazy"
          style={{ width: row ? 120 : '100%', height: 'auto', objectFit: 'contain', flex: row ? '0 0 auto' : undefined }}
        />
      )}
      <div className="mgz-product-info" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span className="mgz-product-name" style={{ fontSize: 14, lineHeight: 1.3 }}>{product.name}</span>
        <span className="mgz-product-price" style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
          <strong>{money(product.price)}</strong>
          {onSale && (
            <s style={{ color: '#9a9a9a', fontWeight: 400, fontSize: 12 }}>{money(product.regularPrice)}</s>
          )}
        </span>
      </div>
    </a>
  );
}

function ProductLayout({ products, type, columns }: { products: MagezonProduct[]; type: string; columns: number }) {
  if (type === 'product_list') {
    return (
      <div className="mgz-product-list" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {products.map((p) => <ProductCard key={p.uid} product={p} layout="list" />)}
      </div>
    );
  }
  if (type === 'product_slider') {
    return (
      <div
        className="mgz-product-slider"
        style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 8 }}
      >
        {products.map((p) => (
          <div key={p.uid} style={{ flex: `0 0 ${100 / Math.max(1, columns)}%`, maxWidth: `${100 / Math.max(1, columns)}%`, scrollSnapAlign: 'start' }}>
            <ProductCard product={p} layout="slider" />
          </div>
        ))}
      </div>
    );
  }
  // product_grid / products / single_product list
  return (
    <div
      className="mgz-product-grid"
      style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, columns)}, minmax(0, 1fr))`, gap: 16 }}
    >
      {products.map((p) => <ProductCard key={p.uid} product={p} layout="grid" />)}
    </div>
  );
}

function CategoryGrid({ categories, columns }: { categories: MagezonCategory[]; columns: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, columns)}, minmax(0, 1fr))`, gap: 16 }}>
      {categories.map((c) => (
        <a key={c.uid} href={c.url} className="mgz-category-item" style={{ textDecoration: 'none', color: 'inherit', textAlign: 'center' }}>
          {c.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.image} alt={c.name} loading="lazy" style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
          )}
          <div style={{ marginTop: 8, fontSize: 14 }}>
            {c.name}
            {c.productCount ? <span style={{ color: '#9a9a9a' }}> ({c.productCount})</span> : null}
          </div>
        </a>
      ))}
    </div>
  );
}

/* --------------------------- the element ----------------------------- */

export function CommerceElement({ element }: MagezonElementProps) {
  const renderer = useContext(CommerceContext);
  const criteria = readCriteria(element);

  // Full override path.
  if (renderer) return <>{renderer(criteria, element)}</>;

  return <DefaultCommerce element={element} criteria={criteria} />;
}

function DefaultCommerce({ element, criteria }: { element: MagezonElement; criteria: ProductSelectionCriteria }) {
  const [products, setProducts] = useState<MagezonProduct[] | null>(null);
  const [categories, setCategories] = useState<MagezonCategory[] | null>(null);
  const [error, setError] = useState<string>('');

  const isCategories = element.type === 'categories';
  const isReviews = element.type === 'recent_reviews';
  const pageSize = criteria.limit || (element.type === 'single_product' ? 1 : 12);

  useEffect(() => {
    let active = true;
    if (isReviews) return; // no standard GraphQL source
    (async () => {
      try {
        if (isCategories) {
          const cats = await fetchCategories(criteria.categoryIds);
          if (active) setCategories(cats);
        } else {
          const items = await fetchProducts({
            skus: criteria.skus,
            categoryId: criteria.categoryId,
            pageSize,
            sort: criteria.sort,
          });
          if (active) setProducts(items);
        }
      } catch (e) {
        if (active) setError((e as Error).message);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element.id]);

  const heading = criteria.title ? <h3 className="mgz-commerce-title">{criteria.title}</h3> : null;

  if (isReviews) {
    return isDev ? <Placeholder type={element.type} note="No standard GraphQL source for product reviews — provide via MagezonCommerceProvider." /> : null;
  }
  if (error) {
    return isDev ? <Placeholder type={element.type} note={`Fetch failed: ${error}`} /> : null;
  }
  if (isCategories) {
    if (!categories) return <Skeleton />;
    if (!categories.length) return isDev ? <Placeholder type={element.type} note="No categories matched. Check category ids or use the provider." /> : null;
    return <div className="mgz-commerce">{heading}<CategoryGrid categories={categories} columns={criteria.columns} /></div>;
  }
  if (!products) return <Skeleton />;
  if (!products.length) {
    return isDev ? <Placeholder type={element.type} note={criteria.source === 'condition' ? 'Condition-based selection needs host logic (MagezonCommerceProvider).' : 'No products matched.'} /> : null;
  }
  return <div className="mgz-commerce">{heading}<ProductLayout products={products} type={element.type} columns={criteria.columns} /></div>;
}

function Skeleton() {
  return <div className="mgz-commerce-skeleton" aria-busy="true" style={{ minHeight: 120, background: 'repeating-linear-gradient(90deg,#f2f2f2,#f2f2f2 20px,#eaeaea 20px,#eaeaea 40px)', borderRadius: 4 }} />;
}

function Placeholder({ type, note }: { type: string; note: string }) {
  return (
    <div className="mgz-commerce-placeholder" data-mgz-type={type} style={{ outline: '1px dashed #bbb', padding: 12 }}>
      <strong>{type}</strong> — {note}
    </div>
  );
}

/** Element types this adapter is registered for. */
export const COMMERCE_TYPES = [
  'product_grid',
  'product_list',
  'product_slider',
  'single_product',
  'products',
  'categories',
  'recent_reviews',
] as const;
