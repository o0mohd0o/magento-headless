import { SITE_URL } from "@/lib/seo";
import type { ProductDetail } from "@/lib/types";

export default function ProductJsonLd({ product }: { product: ProductDetail }) {
  const price = product.price_range.minimum_price.final_price;
  const images = product.media_gallery?.length
    ? product.media_gallery.map((m) => m.url)
    : product.small_image
      ? [product.small_image.url]
      : [];

  const json = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    image: images,
    description: product.description?.html
      ?.replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 500),
    offers: {
      "@type": "Offer",
      priceCurrency: price.currency,
      price: price.value,
      availability:
        product.stock_status === "OUT_OF_STOCK"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      url: `${SITE_URL}/product/${product.url_key}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
