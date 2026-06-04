import "server-only";
import { magentoFetch } from "./magento";
import { CUSTOMER_PAYMENT_TOKENS } from "./queries";
import { getCustomerToken } from "./cart-cookies";

export type PaymentToken = {
  public_hash: string;
  payment_method_code: string;
  type: string;
  details: string;
};

export async function getPaymentTokens(): Promise<PaymentToken[]> {
  const token = await getCustomerToken();
  if (!token) return [];
  try {
    const { customerPaymentTokens } = await magentoFetch<{
      customerPaymentTokens: { items: PaymentToken[] };
    }>(CUSTOMER_PAYMENT_TOKENS, { token });
    return customerPaymentTokens.items ?? [];
  } catch {
    return [];
  }
}
