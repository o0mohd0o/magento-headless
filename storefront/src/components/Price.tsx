import { formatMoney, isDiscounted } from "@/lib/format";
import type { PriceRange } from "@/lib/types";

export default function Price({
  priceRange,
  className = "",
}: {
  priceRange: PriceRange;
  className?: string;
}) {
  const final = priceRange.minimum_price.final_price;
  const regular = priceRange.minimum_price.regular_price;
  const discounted = isDiscounted(regular, final);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-semibold text-gray-900">{formatMoney(final)}</span>
      {discounted && (
        <span className="text-sm text-gray-400 line-through">
          {formatMoney(regular)}
        </span>
      )}
    </div>
  );
}
