"use client";

import { useActionState } from "react";
import { contactUsAction } from "@/lib/comms-actions";
import RecaptchaField from "@/components/recaptcha/RecaptchaField";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

export default function ContactForm({
  recaptchaSiteKey = null,
}: {
  recaptchaSiteKey?: string | null;
}) {
  const [state, action, pending] = useActionState(contactUsAction, {});

  if (state.ok) {
    return (
      <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <RecaptchaField siteKey={recaptchaSiteKey} action="contact" />
      <div className="grid grid-cols-2 gap-3">
        <input name="name" required placeholder="Name" className={inputClass} />
        <input name="telephone" placeholder="Phone (optional)" className={inputClass} />
      </div>
      <input name="email" type="email" required placeholder="Email" className={inputClass} />
      <textarea name="comment" required rows={5} placeholder="How can we help?" className={inputClass} />
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <button
        disabled={pending}
        className="rounded-full bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700 disabled:bg-gray-300"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
