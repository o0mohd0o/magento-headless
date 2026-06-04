import Image from "next/image";
import Link from "next/link";
import Price from "./Price";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const img = product.small_image?.url;
  return (
    <Link href={`/product/${product.url_key}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
        {img ? (
          <Image
            src={img}
            alt={product.small_image?.label || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-300">
            No image
          </div>
        )}
        {product.stock_status === "OUT_OF_STOCK" && (
          <span className="absolute left-2 top-2 rounded bg-gray-900/80 px-2 py-0.5 text-xs text-white">
            Sold out
          </span>
        )}
      </div>
      <h3 className="mt-3 line-clamp-1 text-sm font-medium text-gray-800">
        {product.name}
      </h3>
      <Price priceRange={product.price_range} className="mt-1" />
    </Link>
  );
}
