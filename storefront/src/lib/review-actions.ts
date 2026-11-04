"use server";

import { magentoFetch } from "./magento";
import { CREATE_REVIEW } from "./queries";
import { getCustomerToken } from "./cart-cookies";
import { cleanMessage, type FormState } from "./errors";
import { recaptchaTokenFrom } from "./recaptcha";
import { revalidateProduct } from "./revalidate";

export type ReviewState = FormState;

export async function createReviewAction(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const sku = String(formData.get("sku") ?? "");
  const urlKey = String(formData.get("urlKey") ?? "");
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
    await magentoFetch(CREATE_REVIEW, {
      variables: { sku, nickname, summary, text, ratingId, valueId },
      token,
      recaptchaToken: recaptchaTokenFrom(formData),
    });
    // New reviews are Pending in Magento, so nothing changes until a moderator
    // approves; marking the product stale is enough.
    if (urlKey) revalidateProduct(urlKey);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: cleanMessage(e) };
  }
}
