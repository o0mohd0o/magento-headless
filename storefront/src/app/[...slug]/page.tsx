import { notFound, redirect } from "next/navigation";
import { resolveRoute, routeToPath } from "@/lib/route";

/**
 * Catch-all for legacy/canonical Magento URLs (e.g. /hero-hoodie.html,
 * /women.html, /about-us). Resolves via Magento route() and redirects to the
 * storefront's canonical path. Lowest routing priority, so it never shadows
 * the explicit /product, /category, /page routes.
 */
export default async function CatchAllRoute({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const url = slug.join("/");
  const route = await resolveRoute(url);
  if (!route) notFound();

  const path = routeToPath(route);
  if (path) redirect(path);

  // Fallback: Magento returned a redirect target but unknown type.
  if (route.relative_url && route.relative_url !== url) {
    redirect(`/${route.relative_url.replace(/^\//, "")}`);
  }
  notFound();
}
