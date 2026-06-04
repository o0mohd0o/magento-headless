import StarRating from "./StarRating";
import ReviewForm from "./ReviewForm";
import type { ProductDetail, ReviewMetadata } from "@/lib/types";

export default function ReviewsSection({
  product,
  metadata,
}: {
  product: ProductDetail;
  metadata: ReviewMetadata | null;
}) {
  const reviews = product.reviews?.items ?? [];
  const count = product.review_count ?? 0;
  const summary = product.rating_summary ?? 0;

  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Reviews {count > 0 && <span className="text-gray-400">({count})</span>}
        </h2>
        {count > 0 && <StarRating percent={summary} />}
      </div>

      {reviews.length > 0 ? (
        <ul className="mt-5 space-y-5">
          {reviews.map((r, i) => (
            <li key={i} className="border-b border-gray-100 pb-5">
              <div className="flex items-center gap-2">
                <StarRating percent={r.average_rating} />
                <span className="text-sm font-medium text-gray-900">{r.summary}</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{r.text}</p>
              <p className="mt-1 text-xs text-gray-400">
                {r.nickname} · {r.created_at}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-gray-500">
          No reviews yet — be the first to review this product.
        </p>
      )}

      {metadata && (
        <div className="mt-8">
          <h3 className="mb-3 text-base font-semibold text-gray-900">
            Write a review
          </h3>
          <ReviewForm
            sku={product.sku}
            ratingId={metadata.id}
            ratingValues={metadata.values}
          />
        </div>
      )}
    </section>
  );
}
