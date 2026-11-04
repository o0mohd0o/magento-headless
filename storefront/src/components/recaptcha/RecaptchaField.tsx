"use client";

import { useEffect, useRef } from "react";
import { useRecaptcha } from "./useRecaptcha";

export const RECAPTCHA_FIELD = "recaptcha_token";

/**
 * Drop-in hidden field for `<form action={serverAction}>` forms.
 *
 * On submit it intercepts the native event once, mints a v3 token for
 * `action`, writes it into the hidden input and re-submits, so the Server
 * Action receives `formData.get("recaptcha_token")`. Renders nothing and
 * intercepts nothing when `siteKey` is null (reCAPTCHA off in Magento).
 */
export default function RecaptchaField({
  siteKey,
  action,
}: {
  siteKey: string | null;
  action: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const { execute } = useRecaptcha(siteKey);
  const armed = useRef(false);

  useEffect(() => {
    const el = input.current;
    const form = el?.form;
    if (!siteKey || !el || !form) return;

    const onSubmit = (e: SubmitEvent) => {
      if (armed.current) {
        // Token is in place; let React's form action run, then disarm so the
        // next submit mints a fresh (single-use) token.
        armed.current = false;
        return;
      }
      e.preventDefault();
      e.stopImmediatePropagation();
      void execute(action).then((token) => {
        el.value = token ?? "";
        armed.current = true;
        form.requestSubmit();
      });
    };
    // Listener on the form element itself fires before React's root listener,
    // so stopImmediatePropagation keeps the action from running without a token.
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [siteKey, action, execute]);

  if (!siteKey) return null;
  return <input ref={input} type="hidden" name={RECAPTCHA_FIELD} defaultValue="" />;
}
