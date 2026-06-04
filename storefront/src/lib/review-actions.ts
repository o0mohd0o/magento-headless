"use server";

import { revalidatePath } from "next/cache";
import { magentoFetch } from "./magento";
import { CREATE_REVIEW } from "./queries";
import { getCustomerToken } from "./cart-cookies";

export type ReviewState = { ok?: boolean; error?: string };

export async function createReviewAction(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const sku = String(formData.get("sku") ?? "");
  const nickname = String(formData.get("nickname") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const text = String(formData.get("text") ?? "").trim();
  const ratingId = String(formData.get("ratingId") ?? "");
  const valueId = String(formData.get("valueId") ?? "");

  if (!nickname || !summary || !text || !valueId) {
    return { error: "Please fill in all fields and pick a rating." };
  }

  const token = (await getCustomerToken()) ?? undefined;
  try {
    await magentoFetch(
      CREATE_REVIEW,
      { variables: { sku, nickname, summary, text, ratingId, valueId }, token },
    );
    revalidatePath(`/product/[slug]`, "page");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: (e as Error).message.replace(/^Magento GraphQL (error|HTTP \d+): /, ""),
    };
  }
}
