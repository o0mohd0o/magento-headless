"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, {});

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Reset password</h1>
        {state.sent ? (
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <p>
              If an account exists for that email, a reset link has been sent.
              In this dev setup, check Mailcatcher at{" "}
              <a
                href="http://magento.test:1080"
                className="text-indigo-600 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                magento.test:1080
              </a>
              .
            </p>
            <Link href="/reset-password" className="text-indigo-600 hover:underline">
              I have a reset token →
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-gray-500">
              Enter your email and we’ll send a reset link.
            </p>
            <form action={action} className="space-y-4">
              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              {state.error && <p className="text-sm text-red-600">{state.error}</p>}
              <button
                disabled={pending}
                className="w-full rounded-full bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700 disabled:bg-gray-300"
              >
                {pending ? "Sending…" : "Send reset link"}
              </button>
            </form>
          </>
        )}
        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
