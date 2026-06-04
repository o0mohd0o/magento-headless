"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/types";

export default function Gallery({
  images,
  name,
}: {
  images: ProductImage[];
  name: string;
}) {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return <div className="aspect-square rounded-xl bg-gray-100" />;
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
        <Image
          src={images[active].url}
          alt={images[active].label || name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                i === active ? "border-indigo-500" : "border-transparent"
              }`}
            >
              <Image
                src={img.url}
                alt={img.label || ""}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
