"use client";

import { useCallback, useEffect, useRef } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

const SCRIPT_ID = "recaptcha-v3";

function loadScript(siteKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.grecaptcha) return resolve();
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("recaptcha load failed")), {
        once: true,
      });
      return;
    }
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.async = true;
    s.defer = true;
    s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("recaptcha load failed"));
    document.head.appendChild(s);
  });
}

/**
 * Mints a reCAPTCHA v3 token for `action`. When `siteKey` is null (backend has
 * reCAPTCHA disabled), `execute` resolves to undefined and nothing is loaded,
 * so callers can unconditionally pass the result to their Server Action.
 */
export function useRecaptcha(siteKey: string | null) {
  const loaded = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (siteKey && !loaded.current) {
      loaded.current = loadScript(siteKey).catch(() => {
        loaded.current = null;
      });
    }
  }, [siteKey]);

  const execute = useCallback(
    async (action: string): Promise<string | undefined> => {
      if (!siteKey) return undefined;
      try {
        if (!loaded.current) loaded.current = loadScript(siteKey);
        await loaded.current;
        const g = window.grecaptcha;
        if (!g) return undefined;
        await new Promise<void>((r) => g.ready(r));
        return await g.execute(siteKey, { action });
      } catch {
        // Let the backend decide: a missing token fails validation with a
        // clear message rather than blocking the form client-side.
        return undefined;
      }
    },
    [siteKey],
  );

  return { execute, enabled: !!siteKey };
}
