import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { magentoFetch } from "@/lib/magento";
import { PRODUCT_DETAIL } from "@/lib/queries";
import Gallery from "@/components/Gallery";
import Price from "@/components/Price";
import AddToCart from "@/components/AddToCart";
import GroupedAddToCart from "@/components/GroupedAddToCart";
import BundleAddToCart from "@/components/BundleAddToCart";
import ProductGrid from "@/components/ProductGrid";
import WishlistButton from "@/components/WishlistButton";
import CompareButton from "@/components/CompareButton";
import EmailFriend from "@/components/EmailFriend";
import StarRating from "@/components/StarRating";
import ReviewsSection from "@/components/ReviewsSection";
import ProductJsonLd from "@/components/ProductJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { getReviewMetadata } from "@/lib/reviews";
import { formatMoney } from "@/lib/format";
import { SITE_URL } from "@/lib/seo";
import type { ProductDetail } from "@/lib/types";

async function fetchProduct(urlKey: string): Promise<ProductDetail | null> {
  try {
    const data = await magentoFetch<{ products: { items: ProductDetail[] } }>(
      PRODUCT_DETAIL,
      { variables: { urlKey }, revalidate: 120, tags: ["catalog"] },
    );
    return data.products?.items?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return { title: "Product" };
  const desc = product.description?.html
    ?.replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
  const img = product.small_image?.url;
  return {
    title: product.name,
    description: desc,
    alternates: { canonical: `/product/${product.url_key}` },
    openGraph: {
      title: product.name,
      description: desc,
      url: `${SITE_URL}/product/${product.url_key}`,
      images: img ? [img] : [],
      type: "website",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, reviewMeta] = await Promise.all([
    fetchProduct(slug),
    getReviewMetadata(),
  ]);
  if (!product) notFound();

  const images = product.media_gallery?.length
    ? product.media_gallery
    : product.small_image
      ? [product.small_image]
      : [];

  const category = product.categories?.[product.categories.length - 1];
  const inStock = product.stock_status !== "OUT_OF_STOCK";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          ...(category
            ? [{ name: category.name, url: `/category/${category.url_key}` }]
            : []),
          { name: product.name, url: `/product/${product.url_key}` },
        ]}
      />
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-800">
          Home
        </Link>{" "}
        /{" "}
        {category && (
          <>
            <Link
              href={`/category/${category.url_key}`}
              className="hover:text-gray-800"
            >
              {category.name}
            </Link>{" "}
            /{" "}
          </>
        )}
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <Gallery images={images} name={product.name} />

        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-1 text-sm text-gray-400">SKU: {product.sku}</p>

          <Price priceRange={product.price_range} className="mt-4 text-xl" />

          {product.price_tiers && product.price_tiers.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-sm text-green-700">
              {product.price_tiers.map((t, i) => (
                <li key={i}>
                  Buy {t.quantity}+ at {formatMoney(t.final_price)} each
                </li>
              ))}
            </ul>
          )}

          {(product.review_count ?? 0) > 0 && (
            <a href="#reviews" className="mt-2 flex items-center gap-2 text-sm">
              <StarRating percent={product.rating_summary ?? 0} />
              <span className="text-gray-500">
                {product.review_count} review(s)
              </span>
            </a>
          )}

          <div className="mt-2">
            {inStock ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500" /> In stock
              </span>
            ) : (
              <span className="text-sm text-red-500">Out of stock</span>
            )}
          </div>

          <div className="mt-8">
            {product.__typename === "GroupedProduct" ? (
              <GroupedAddToCart items={product.groupedItems ?? []} />
            ) : product.__typename === "BundleProduct" ? (
              <BundleAddToCart sku={product.sku} items={product.bundleItems ?? []} />
            ) : (
              <AddToCart
                sku={product.sku}
                options={product.configurable_options ?? []}
                inStock={inStock}
              />
            )}
          </div>

          <div className="mt-4 flex items-center gap-4">
            <WishlistButton sku={product.sku} />
            <CompareButton sku={product.sku} />
          </div>

          <div className="mt-3">
            <EmailFriend productUid={product.uid} />
          </div>

          {product.description?.html && (
            <div className="mt-10 border-t border-gray-200 pt-8">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                Details
              </h2>
              <div
                className="prose-magento text-gray-600"
                dangerouslySetInnerHTML={{ __html: product.description.html }}
              />
            </div>
          )}
        </div>
      </div>

      {(product.related_products?.length || product.upsell_products?.length) ? (
        <section className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            You may also like
          </h2>
          <ProductGrid
            products={[
              ...(product.related_products ?? []),
              ...(product.upsell_products ?? []),
            ].slice(0, 4)}
          />
        </section>
      ) : null}

      <div id="reviews">
        <ReviewsSection product={product} metadata={reviewMeta} />
      </div>
    </div>
  );
}
