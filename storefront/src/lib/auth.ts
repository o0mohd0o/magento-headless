"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { magentoFetch } from "./magento";
import {
  CREATE_CUSTOMER,
  CUSTOMER_CART_ID,
  GENERATE_CUSTOMER_TOKEN,
  IS_EMAIL_AVAILABLE,
  MERGE_CARTS,
  REQUEST_PASSWORD_RESET,
  RESET_PASSWORD,
  REVOKE_CUSTOMER_TOKEN,
} from "./queries";
import {
  CUSTOMER_TOKEN_COOKIE,
  GUEST_CART_COOKIE,
  getCustomerToken,
  getGuestCartId,
} from "./cart-cookies";

// Magento customer tokens live ~1 hour by default.
const TOKEN_MAX_AGE = 60 * 60;

async function setTokenCookie(token: string) {
  const store = await cookies();
  store.set(CUSTOMER_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: TOKEN_MAX_AGE,
  });
}

/** Merge an existing guest cart into the customer cart, then drop the guest cookie. */
async function mergeGuestCart(token: string) {
  const guestId = await getGuestCartId();
  const store = await cookies();
  if (guestId) {
    try {
      const { customerCart } = await magentoFetch<{
        customerCart: { id: string };
      }>(CUSTOMER_CART_ID, { token });
      if (guestId !== customerCart.id) {
        await magentoFetch(MERGE_CARTS, {
          variables: { source: guestId, destination: customerCart.id },
          token,
        });
      }
    } catch {
      // Empty/expired guest cart — nothing to merge.
    }
  }
  store.delete(GUEST_CART_COOKIE);
}

export type AuthState = { error?: string };

function cleanMessage(e: unknown): string {
  return (e as Error).message.replace(/^Magento GraphQL (error|HTTP \d+): /, "");
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  let token: string;
  try {
    const data = await magentoFetch<{
      generateCustomerToken: { token: string };
    }>(GENERATE_CUSTOMER_TOKEN, { variables: { email, password } });
    token = data.generateCustomerToken.token;
  } catch {
    return { error: "Invalid email or password." };
  }

  await setTokenCookie(token);
  await mergeGuestCart(token);
  revalidatePath("/", "layout");
  redirect("/account");
}

export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const firstname = String(formData.get("firstname") ?? "").trim();
  const lastname = String(formData.get("lastname") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!firstname || !lastname || !email || !password) {
    return { error: "All fields are required." };
  }

  // Friendly pre-check so we can say "email taken" before attempting creation.
  try {
    const { isEmailAvailable } = await magentoFetch<{
      isEmailAvailable: { is_email_available: boolean };
    }>(IS_EMAIL_AVAILABLE, { variables: { email } });
    if (isEmailAvailable && !isEmailAvailable.is_email_available) {
      return { error: "An account with that email already exists." };
    }
  } catch {
    // non-fatal — fall through to create
  }

  try {
    await magentoFetch(CREATE_CUSTOMER, {
      variables: { firstname, lastname, email, password },
    });
  } catch (e) {
    return { error: cleanMessage(e) };
  }

  // Auto-login the newly created account.
  let token: string;
  try {
    const data = await magentoFetch<{
      generateCustomerToken: { token: string };
    }>(GENERATE_CUSTOMER_TOKEN, { variables: { email, password } });
    token = data.generateCustomerToken.token;
  } catch {
    return { error: "Account created. Please sign in." };
  }

  await setTokenCookie(token);
  await mergeGuestCart(token);
  revalidatePath("/", "layout");
  redirect("/account");
}

export async function requestPasswordResetAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState & { sent?: boolean }> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Email is required." };
  try {
    await magentoFetch(REQUEST_PASSWORD_RESET, { variables: { email } });
    return { sent: true };
  } catch {
    // Magento returns success regardless to avoid email enumeration; treat as sent.
    return { sent: true };
  }
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState & { done?: boolean }> {
  const email = String(formData.get("email") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");
  if (!email || !token || !newPassword) {
    return { error: "All fields are required." };
  }
  try {
    await magentoFetch(RESET_PASSWORD, {
      variables: { email, token, newPassword },
    });
    return { done: true };
  } catch (e) {
    return { error: cleanMessage(e) };
  }
}

export async function logoutAction() {
  const token = await getCustomerToken();
  if (token) {
    try {
      await magentoFetch(REVOKE_CUSTOMER_TOKEN, { token });
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
