import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/seo";
import { getHtmlLang } from "@/lib/store";

// PWA service-worker registration, inlined in the server HTML so scanners
// (e.g. PWABuilder) detect it without executing the client bundle, and so it
// registers before hydration. Production-only — a SW would fight dev HMR.
const SW_REGISTER_SNIPPET =
  "if('serviceWorker' in navigator){window.addEventListener('load',function(){" +
  "navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'})" +
  ".catch(function(){})})}";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// The page-builder homepage's display/body faces (Anton + Hanken Grotesk) are
// loaded by the Magezon profile's own custom_css (@import), so the design is
// self-contained and renders identically in the storefront, the Magezon admin
// preview, and the Luma frontend — no font wiring needed in the host layout.

export const viewport: Viewport = {
  // Matches the manifest theme_color so the installed app and the browser
  // UI tint agree.
  themeColor: "#4f46e5",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Luma Headless — Magento + Next.js",
    template: "%s · Luma Headless",
  },
  description:
    "A headless commerce storefront powered by Magento Open Source 2.4.9 (GraphQL) and Next.js.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getHtmlLang();
  return (
    <html lang={lang} className={`${geist.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-white font-sans text-gray-900 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Luma Headless",
              url: SITE_URL,
            }),
          }}
        />
        {process.env.NODE_ENV === "production" && (
          <script dangerouslySetInnerHTML={{ __html: SW_REGISTER_SNIPPET }} />
        )}
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
