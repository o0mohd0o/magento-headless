import type { MetadataRoute } from "next";
import { magentoFetch } from "@/lib/magento";
import { SITE_URL } from "@/lib/seo";

const SITEMAP_QUERY = /* GraphQL */ `
  query Sitemap {
    categoryList(filters: { parent_id: { eq: "2" } }) {
      url_key
      children {
        url_key
        children { url_key }
      }
    }
    products(search: "", pageSize: 500) {
      items { url_key }
    }
  }
`;

type Cat = { url_key: string; children?: Cat[] | null };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = ["", "/cart", "/login", "/register"].map(
    (p) => ({ url: `${SITE_URL}${p}` }),
  );

  try {
    const data = await magentoFetch<{
      categoryList: Cat[];
      products: { items: { url_key: string }[] };
    }>(SITEMAP_QUERY, { revalidate: 3600, tags: ["catalog"] });

    const catKeys = new Set<string>();
    const walk = (cats?: Cat[] | null) => {
      (cats ?? []).forEach((c) => {
        if (c.url_key) catKeys.add(c.url_key);
        walk(c.children);
      });
    };
    walk(data.categoryList);

    const categories: MetadataRoute.Sitemap = [...catKeys].map((k) => ({
      url: `${SITE_URL}/category/${k}`,
    }));
    const products: MetadataRoute.Sitemap = data.products.items.map((p) => ({
      url: `${SITE_URL}/product/${p.url_key}`,
    }));

    return [...base, ...categories, ...products];
  } catch {
    return base;
  }
}
