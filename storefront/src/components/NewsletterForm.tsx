"use client";

import { useActionState } from "react";
import { subscribeNewsletterAction } from "@/lib/comms-actions";
import RecaptchaField from "@/components/recaptcha/RecaptchaField";

export default function NewsletterForm({
  recaptchaSiteKey = null,
}: {
  recaptchaSiteKey?: string | null;
}) {
  const [state, action, pending] = useActionState(subscribeNewsletterAction, {});

  if (state.ok) {
    return <p className="text-sm text-green-600">{state.message}</p>;
  }

  return (
    <form action={action} className="flex max-w-xs gap-2">
      <RecaptchaField siteKey={recaptchaSiteKey} action="newsletter" />
      <input
        name="email"
        type="email"
        required
        placeholder="Email address"
        className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />
      <button
        disabled={pending}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-60"
      >
        {pending ? "…" : "Subscribe"}
      </button>
      {state.error && (
        <p role="alert" className="text-xs text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
