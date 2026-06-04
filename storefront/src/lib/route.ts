import "server-only";
import { magentoFetch } from "./magento";
import { ROUTE_RESOLVER } from "./queries";

export type RouteResult = {
  __typename: string;
  redirect_code: number;
  relative_url: string;
  type: string | null;
  url_key?: string | null;
  identifier?: string | null;
} | null;

export async function resolveRoute(url: string): Promise<RouteResult> {
  try {
    const { route } = await magentoFetch<{ route: RouteResult }>(ROUTE_RESOLVER, {
      variables: { url },
      revalidate: 300,
      tags: ["catalog", "cms"],
    });
    return route;
  } catch {
    return null;
  }
}

/** Map a resolved Magento route to a storefront path. */
export function routeToPath(r: NonNullable<RouteResult>): string | null {
  switch (r.type) {
    case "PRODUCT":
      return r.url_key ? `/product/${r.url_key}` : null;
    case "CATEGORY":
      return r.url_key ? `/category/${r.url_key}` : null;
    case "CMS_PAGE":
      return r.identifier ? `/page/${r.identifier}` : null;
    default:
      return null;
  }
}
