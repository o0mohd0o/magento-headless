import "server-only";
import { magentoFetch } from "./magento";
import { CHECKOUT_AGREEMENTS, CHECKOUT_CART, COUNTRIES } from "./queries";
import { resolveCartContext } from "./cart-cookies";
import type { CheckoutCart, Country } from "./types";

export type Agreement = {
  agreement_id: number;
  name: string;
  content: string;
  mode: string;
  is_html: boolean;
};

export async function getCheckoutAgreements(): Promise<Agreement[]> {
  try {
    const { checkoutAgreements } = await magentoFetch<{
      checkoutAgreements: Agreement[];
    }>(CHECKOUT_AGREEMENTS, { revalidate: 3600, tags: ["store-config"] });
    return checkoutAgreements ?? [];
  } catch {
    return [];
  }
}

export async function getCheckoutCart(): Promise<{
  cart: CheckoutCart | null;
  loggedIn: boolean;
}> {
  const { token, cartId } = await resolveCartContext();
  if (!cartId) return { cart: null, loggedIn: !!token };
  try {
    const { cart } = await magentoFetch<{ cart: CheckoutCart }>(CHECKOUT_CART, {
      variables: { cartId },
      token,
    });
    return { cart, loggedIn: !!token };
  } catch {
    return { cart: null, loggedIn: !!token };
  }
}

export async function getCountries(): Promise<Country[]> {
  try {
    const { countries } = await magentoFetch<{ countries: Country[] }>(
      COUNTRIES,
      { revalidate: 86400, tags: ["countries"] },
    );
    return (countries ?? [])
      .filter((c) => c.full_name_locale)
      .sort((a, b) => a.full_name_locale.localeCompare(b.full_name_locale));
  } catch {
    return [];
  }
}
