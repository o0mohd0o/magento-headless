import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCmsPage } from "@/lib/cms";
import CmsContent from "@/components/CmsContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ identifier: string }>;
}): Promise<Metadata> {
  const { identifier } = await params;
  const page = await getCmsPage(identifier);
  return {
    title: page?.meta_title ?? page?.title ?? "Page",
    description: page?.meta_description ?? undefined,
  };
}

export default async function CmsPageRoute({
  params,
}: {
  params: Promise<{ identifier: string }>;
}) {
  const { identifier } = await params;
  const page = await getCmsPage(identifier);
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">
        {page.content_heading || page.title}
      </h1>
      <div className="mt-6">
        <CmsContent html={page.content} />
      </div>
    </div>
  );
}
