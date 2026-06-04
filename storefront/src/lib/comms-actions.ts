"use server";

import { magentoFetch } from "./magento";
import { CONTACT_US, SEND_EMAIL_TO_FRIEND, SUBSCRIBE_NEWSLETTER } from "./queries";

export type FormResult = { ok?: boolean; error?: string; message?: string };

function clean(e: unknown): string {
  return (e as Error).message.replace(/^Magento GraphQL (error|HTTP \d+): /, "");
}

export async function subscribeNewsletterAction(
  _prev: FormResult,
  formData: FormData,
): Promise<FormResult> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Email is required." };
  try {
    await magentoFetch(SUBSCRIBE_NEWSLETTER, { variables: { email } });
    return { ok: true, message: "You're subscribed!" };
  } catch (e) {
    return { error: clean(e) };
  }
}

export async function contactUsAction(
  _prev: FormResult,
  formData: FormData,
): Promise<FormResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const telephone = String(formData.get("telephone") ?? "").trim() || undefined;
  const comment = String(formData.get("comment") ?? "").trim();
  if (!name || !email || !comment) {
    return { error: "Name, email and message are required." };
  }
  try {
    await magentoFetch(CONTACT_US, {
      variables: { name, email, comment, telephone },
    });
    return { ok: true, message: "Thanks — we'll be in touch shortly." };
  } catch (e) {
    return { error: clean(e) };
  }
}

export async function emailToFriendAction(
  _prev: FormResult,
  formData: FormData,
): Promise<FormResult> {
  const productUid = String(formData.get("productUid") ?? "");
  // Product uid is base64 of the numeric entity id.
  let productId = 0;
  try {
    productId = parseInt(Buffer.from(productUid, "base64").toString("utf8"), 10);
  } catch {
    productId = 0;
  }
  const senderName = String(formData.get("senderName") ?? "").trim();
  const senderEmail = String(formData.get("senderEmail") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const recipientName = String(formData.get("recipientName") ?? "").trim();
  const recipientEmail = String(formData.get("recipientEmail") ?? "").trim();
  if (!productId || !senderName || !senderEmail || !recipientName || !recipientEmail) {
    return { error: "Please fill in all fields." };
  }
  try {
    await magentoFetch(SEND_EMAIL_TO_FRIEND, {
      variables: {
        productId,
        senderName,
        senderEmail,
        message: message || "Check this out!",
        recipientName,
        recipientEmail,
      },
    });
    return { ok: true, message: "Sent!" };
  } catch (e) {
    return { error: clean(e) };
  }
}
