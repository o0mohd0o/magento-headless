import "server-only";
import { redirect } from "next/navigation";
import { magentoFetch } from "./magento";
import {
  CUSTOMER_ADDRESSES,
  CUSTOMER_ORDERS,
  CUSTOMER_ORDER_DETAIL,
  CUSTOMER_OVERVIEW,
} from "./queries";
import { getCustomerToken } from "./cart-cookies";
import type {
  CustomerAddress,
  CustomerOverview,
  OrderDetail,
  OrderListItem,
} from "./types";

/** Guards an account route; returns the token or redirects to /login. */
export async function requireToken(): Promise<string> {
  const token = await getCustomerToken();
  if (!token) redirect("/login");
  return token;
}

export async function getOverview(): Promise<CustomerOverview | null> {
  const token = await getCustomerToken();
  if (!token) return null;
  try {
    const { customer } = await magentoFetch<{ customer: CustomerOverview }>(
      CUSTOMER_OVERVIEW,
      { token },
    );
    return customer;
  } catch {
    return null;
  }
}

export async function getAddresses(): Promise<CustomerAddress[]> {
  const token = await getCustomerToken();
  if (!token) return [];
  try {
    const { customer } = await magentoFetch<{
      customer: { addresses: CustomerAddress[] };
    }>(CUSTOMER_ADDRESSES, { token });
    return customer.addresses ?? [];
  } catch {
    return [];
  }
}

export async function getOrders(
  currentPage = 1,
  pageSize = 10,
): Promise<{ items: OrderListItem[]; totalPages: number; currentPage: number }> {
  const token = await getCustomerToken();
  if (!token) return { items: [], totalPages: 1, currentPage: 1 };
  try {
    const { customer } = await magentoFetch<{
      customer: {
        orders: {
          page_info: { current_page: number; total_pages: number };
          items: OrderListItem[];
        };
      };
    }>(CUSTOMER_ORDERS, { variables: { pageSize, currentPage }, token });
    return {
      items: customer.orders.items,
      totalPages: customer.orders.page_info.total_pages,
      currentPage: customer.orders.page_info.current_page,
    };
  } catch {
    return { items: [], totalPages: 1, currentPage: 1 };
  }
}

export async function getOrder(number: string): Promise<OrderDetail | null> {
  const token = await getCustomerToken();
  if (!token) return null;
  try {
    const { customer } = await magentoFetch<{
      customer: { orders: { items: OrderDetail[] } };
    }>(CUSTOMER_ORDER_DETAIL, { variables: { number }, token });
    return customer.orders.items?.[0] ?? null;
  } catch {
    return null;
  }
}
