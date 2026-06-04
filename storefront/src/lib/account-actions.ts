"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { magentoFetch } from "./magento";
import {
  CANCEL_ORDER,
  CHANGE_PASSWORD,
  CREATE_ADDRESS,
  DELETE_ADDRESS,
  DELETE_CUSTOMER,
  REORDER_ITEMS,
  UPDATE_ADDRESS,
  UPDATE_EMAIL,
  UPDATE_PROFILE,
} from "./queries";
import {
  CUSTOMER_TOKEN_COOKIE,
  GUEST_CART_COOKIE,
  getCustomerToken,
} from "./cart-cookies";

export type ActionResult = { ok: boolean; error?: string };
export type FormState = { ok?: boolean; error?: string; message?: string };

function clean(e: unknown): string {
  return (e as Error).message.replace(/^Magento GraphQL (error|HTTP \d+): /, "");
}

export type CustomerAddressInputData = {
  firstname: string;
  lastname: string;
  company?: string;
  street: string[];
  city: string;
  region: { region_id?: number; region?: string };
  postcode: string;
  country_code: string;
  telephone: string;
  default_shipping?: boolean;
  default_billing?: boolean;
};

export async function saveAddressAction(
  uid: string | null,
  input: CustomerAddressInputData,
): Promise<ActionResult> {
  const token = await getCustomerToken();
  if (!token) return { ok: false, error: "Please sign in." };
  try {
    if (uid) {
      await magentoFetch(UPDATE_ADDRESS, { variables: { uid, input }, token });
    } else {
      await magentoFetch(CREATE_ADDRESS, { variables: { input }, token });
    }
    revalidatePath("/account/addresses");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: clean(e) };
  }
}

export async function deleteAddressAction(uid: string): Promise<ActionResult> {
  const token = await getCustomerToken();
  if (!token) return { ok: false, error: "Please sign in." };
  try {
    await magentoFetch(DELETE_ADDRESS, { variables: { uid }, token });
    revalidatePath("/account/addresses");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: clean(e) };
  }
}

export async function updateProfileAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = await getCustomerToken();
  if (!token) return { error: "Please sign in." };
  const firstname = String(formData.get("firstname") ?? "").trim();
  const lastname = String(formData.get("lastname") ?? "").trim();
  if (!firstname || !lastname) return { error: "Name is required." };
  try {
    await magentoFetch(UPDATE_PROFILE, { variables: { firstname, lastname }, token });
    revalidatePath("/account", "layout");
    return { ok: true, message: "Profile updated." };
  } catch (e) {
    return { error: clean(e) };
  }
}

export async function changePasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = await getCustomerToken();
  if (!token) return { error: "Please sign in." };
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  if (!current || !next) return { error: "Both fields are required." };
  try {
    await magentoFetch(CHANGE_PASSWORD, { variables: { current, next }, token });
    return { ok: true, message: "Password changed." };
  } catch (e) {
    return { error: clean(e) };
  }
}

export async function updateEmailAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = await getCustomerToken();
  if (!token) return { error: "Please sign in." };
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and current password are required." };
  try {
    await magentoFetch(UPDATE_EMAIL, { variables: { email, password }, token });
    revalidatePath("/account", "layout");
    return { ok: true, message: "Email updated." };
  } catch (e) {
    return { error: clean(e) };
  }
}

export async function deleteAccountAction(): Promise<void> {
  const token = await getCustomerToken();
  if (token) {
    try {
      await magentoFetch(DELETE_CUSTOMER, { token });
    } catch {
      // ignore
    }
  }
  const store = await cookies();
  store.delete(CUSTOMER_TOKEN_COOKIE);
  store.delete(GUEST_CART_COOKIE);
  revalidatePath("/", "layout");
  redirect("/");
}

export async function cancelOrderAction(
  orderId: string,
  reason: string,
): Promise<ActionResult> {
  const token = await getCustomerToken();
  if (!token) return { ok: false, error: "Please sign in." };
  try {
    const { cancelOrder } = await magentoFetch<{
      cancelOrder: { error: string | null };
    }>(CANCEL_ORDER, { variables: { orderId, reason }, token });
    revalidatePath("/account/orders");
    if (cancelOrder.error) return { ok: false, error: cancelOrder.error };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: clean(e) };
  }
}

export async function reorderAction(number: string): Promise<ActionResult> {
  const token = await getCustomerToken();
  if (!token) return { ok: false, error: "Please sign in." };
  try {
    const { reorderItems } = await magentoFetch<{
      reorderItems: { userInputErrors: { message: string }[] };
    }>(REORDER_ITEMS, { variables: { number }, token });
    revalidatePath("/", "layout");
    revalidatePath("/cart");
    if (reorderItems.userInputErrors?.length) {
      return {
        ok: true,
        error: reorderItems.userInputErrors.map((e) => e.message).join("; "),
      };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: clean(e) };
  }
}
