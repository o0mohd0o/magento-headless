"use server";

import { revalidatePath } from "next/cache";
import { magentoFetch } from "./magento";
import { DELETE_PAYMENT_TOKEN } from "./queries";
import { getCustomerToken } from "./cart-cookies";

export async function deletePaymentTokenAction(hash: string): Promise<void> {
  const token = await getCustomerToken();
  if (!token) return;
  try {
    await magentoFetch(DELETE_PAYMENT_TOKEN, { variables: { hash }, token });
  } catch {
    // ignore
  }
  revalidatePath("/account/payment");
}
