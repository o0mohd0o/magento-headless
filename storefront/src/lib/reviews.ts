import "server-only";
import { magentoFetch } from "./magento";
import { REVIEW_METADATA } from "./queries";
import type { ReviewMetadata } from "./types";

export async function getReviewMetadata(): Promise<ReviewMetadata | null> {
  try {
    const { productReviewRatingsMetadata } = await magentoFetch<{
      productReviewRatingsMetadata: { items: ReviewMetadata[] };
    }>(REVIEW_METADATA, { revalidate: 86400, tags: ["reviews-meta"] });
    return productReviewRatingsMetadata.items?.[0] ?? null;
  } catch {
    return null;
  }
}
