"use client";

import { use } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction } from "@/lib/auth";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const sp = use(searchParams);
  const [state, action, pending] = useActionState(resetPasswordAction, {});

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Set a new password</h1>
        {state.done ? (
          <div className="mt-4 space-y-4 text-sm text-gray-600">
            <p className="text-green-600">
              Your password has been reset. You can now sign in.
            </p>
            <Link
              href="/login"
              className="inline-block rounded-full bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-gray-500">
              Enter the token from your reset email along with a new password.
            </p>
            <form action={action} className="space-y-4">
              <input name="email" type="email" required defaultValue={sp.email ?? ""} placeholder="Email" className={inputClass} />
              <input name="token" required defaultValue={sp.token ?? ""} placeholder="Reset token" className={inputClass} />
              <input name="newPassword" type="password" required minLength={8} placeholder="New password" className={inputClass} />
              {state.error && <p className="text-sm text-red-600">{state.error}</p>}
              <button
                disabled={pending}
                className="w-full rounded-full bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700 disabled:bg-gray-300"
              >
                {pending ? "Resetting…" : "Reset password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
