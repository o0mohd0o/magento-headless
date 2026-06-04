import { Suspense } from "react";
import PreviewClient from "./PreviewClient";

// Live headless preview target for the Magezon builder's "Open headless (Next.js)
// preview" button. The admin saves the in-progress builder content to a shared
// row (keyed by builderId); this page polls magezonPreview(builderId) and renders
// it with the SAME React components as the storefront, so editors see the real
// design update as they edit.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Magezon headless preview",
  robots: { index: false, follow: false },
};

export default function MagezonPreviewPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            font: "500 15px/1.5 ui-sans-serif, system-ui, sans-serif",
            color: "#555",
          }}
        >
          Loading preview…
        </div>
      }
    >
      <PreviewClient />
    </Suspense>
  );
}
