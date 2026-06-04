import "server-only";
import { magentoFetch } from "./magento";
import { CMS_BLOCKS, CMS_PAGE } from "./queries";

export type CmsPage = {
  identifier: string;
  title: string;
  content: string;
  content_heading?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
};

export type CmsBlock = { identifier: string; title: string; content: string };

export async function getCmsPage(identifier: string): Promise<CmsPage | null> {
  try {
    const { cmsPage } = await magentoFetch<{ cmsPage: CmsPage }>(CMS_PAGE, {
      variables: { identifier },
      revalidate: 300,
      tags: ["cms"],
    });
    return cmsPage ?? null;
  } catch {
    return null;
  }
}

export async function getCmsBlocks(identifiers: string[]): Promise<CmsBlock[]> {
  try {
    const { cmsBlocks } = await magentoFetch<{ cmsBlocks: { items: CmsBlock[] } }>(
      CMS_BLOCKS,
      { variables: { identifiers }, revalidate: 300, tags: ["cms"] },
    );
    return cmsBlocks.items ?? [];
  } catch {
    return [];
  }
}
