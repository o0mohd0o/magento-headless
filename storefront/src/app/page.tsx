import Link from "next/link";
import { MagezonRenderer, fetchMagezonContent } from "@/lib/magezon";
import "@/lib/magezon/styles/magezon.css";

// The homepage is authored in the Magezon Page Builder and stored as the
// `headless-home` CMS page. We fetch the decoded element tree over the
// QasrAlawani_MagezonHeadless GraphQL module and render it with React. Fonts
// (--font-display / --font-grotesk) come from the root layout and are referenced
// by the profile's custom_css.
export const revalidate = 300;

const HOMEPAGE_IDENTIFIER = "headless-home";

export default async function Home() {
  const content = await fetchMagezonContent(HOMEPAGE_IDENTIFIER, "CMS_PAGE").catch(
    () => null,
  );

  if (content?.has_pagebuilder && content.profile_json) {
    return (
      <MagezonRenderer
        profileJson={content.profile_json}
        mediaBaseUrl={content.media_base_url}
      />
    );
  }

  // Fallback — only shown if the CMS page is missing/empty so the site never breaks.
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-start gap-6 px-4 py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
        Luma Athletics
      </p>
      <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
        A Next.js storefront on a Magento 2.4.9 backend.
      </h1>
      <p className="max-w-xl text-lg text-neutral-600">
        The page-builder homepage hasn&apos;t been published yet. Browse the live
        catalog while it&apos;s set up.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/category/women"
          className="rounded-none bg-neutral-900 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-neutral-700"
        >
          Shop Women
        </Link>
        <Link
          href="/category/men"
          className="rounded-none border border-neutral-900 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
        >
          Shop Men
        </Link>
      </div>
    </section>
  );
}
