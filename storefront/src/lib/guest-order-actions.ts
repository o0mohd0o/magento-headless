"use server";

import { magentoFetch } from "./magento";
import { GUEST_ORDER } from "./queries";
import type { OrderDetail } from "./types";

export type GuestOrderState = { order?: OrderDetail; error?: string };

export async function lookupGuestOrderAction(
  _prev: GuestOrderState,
  formData: FormData,
): Promise<GuestOrderState> {
  const email = String(formData.get("email") ?? "").trim();
  const lastname = String(formData.get("lastname") ?? "").trim();
  const number = String(formData.get("number") ?? "").trim();
  if (!email || !lastname || !number) {
    return { error: "All fields are required." };
  }
  try {
    const { guestOrder } = await magentoFetch<{ guestOrder: OrderDetail }>(
      GUEST_ORDER,
      { variables: { email, lastname, number } },
    );
    if (!guestOrder) return { error: "Order not found." };
    return { order: guestOrder };
  } catch {
    return { error: "Order not found — please check your details." };
  }
}
