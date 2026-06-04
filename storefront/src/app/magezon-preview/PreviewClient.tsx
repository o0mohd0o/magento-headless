"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  MagezonRenderer,
  fetchMagezonPreview,
  fetchMagezonContent,
} from "@/lib/magezon";
import type { MagezonContent } from "@/lib/magezon";
import "@/lib/magezon/styles/magezon.css";

function PreviewMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        font: "500 15px/1.5 ui-sans-serif, system-ui, sans-serif",
        color: "#555",
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
}

// Polls so the preview tracks edits. Two content sources, in priority order:
//   1. LIVE builder content (magezonPreview by builderId) — updates as you edit,
//      IF Magezon's admin live-save endpoint is working.
//   2. SAVED page content (magezonContent by identifier) — the reliable fallback;
//      refreshes whenever you press "Save" in the admin. This keeps the preview
//      working even when Magezon's live-save AJAX fails (older builder on PHP 8.5).
const POLL_MS = 2500;

export default function PreviewClient() {
  const params = useSearchParams();
  const builderId = params.get("builderId") || "";
  const identifier = params.get("identifier") || "";
  const storeCode = params.get("storeCode") || undefined;

  const [content, setContent] = useState<MagezonContent | null>(null);
  const [error, setError] = useState("");
  const stampRef = useRef<string | null>(null);

  useEffect(() => {
    if (!builderId && !identifier) return;
    let active = true;

    const load = async (): Promise<MagezonContent | null> => {
      if (builderId) {
        try {
          const live = await fetchMagezonPreview(builderId, { storeCode });
          if (live.has_pagebuilder && live.profile_json) return live;
        } catch {
          /* fall through to saved content */
        }
      }
      if (identifier) {
        return fetchMagezonContent(identifier, "CMS_PAGE", { storeCode });
      }
      // builderId only, no live content yet
      return builderId ? fetchMagezonPreview(builderId, { storeCode }) : null;
    };

    const tick = async () => {
      try {
        const c = await load();
        if (!active || !c) return;
        setError("");
        const stamp = `${c.has_pagebuilder}:${c.updated_at ?? ""}:${(c.profile_json ?? "").length}`;
        if (stamp !== stampRef.current) {
          stampRef.current = stamp;
          setContent(c);
        }
      } catch (e) {
        if (active) setError((e as Error).message);
      }
    };

    tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [builderId, identifier, storeCode]);

  if (!builderId && !identifier) {
    return (
      <PreviewMessage>
        Missing <code>builderId</code>/<code>identifier</code>. Open this preview
        from the Magezon builder’s “Open headless (Next.js) preview” button.
      </PreviewMessage>
    );
  }
  if (error && !content) {
    return <PreviewMessage>Preview error: {error}</PreviewMessage>;
  }
  if (!content) {
    return <PreviewMessage>Loading preview…</PreviewMessage>;
  }
  if (!content.has_pagebuilder || !content.profile_json) {
    return (
      <PreviewMessage>
        No page-builder content yet. Add elements and press <strong>Save</strong>{" "}
        in the admin — the preview refreshes automatically.
      </PreviewMessage>
    );
  }

  return (
    <MagezonRenderer
      profileJson={content.profile_json}
      mediaBaseUrl={content.media_base_url}
    />
  );
}
