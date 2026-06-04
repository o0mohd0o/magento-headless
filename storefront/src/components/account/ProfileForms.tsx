"use client";

import { useActionState, useTransition } from "react";
import {
  changePasswordAction,
  deleteAccountAction,
  updateEmailAction,
  updateProfileAction,
  type FormState,
} from "@/lib/account-actions";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

function Feedback({ state }: { state: FormState }) {
  if (state.error) return <p className="text-sm text-red-600">{state.error}</p>;
  if (state.message) return <p className="text-sm text-green-600">{state.message}</p>;
  return null;
}

export default function ProfileForms({
  firstname,
  lastname,
  email,
}: {
  firstname: string;
  lastname: string;
  email: string;
}) {
  const [pState, pAction, pPending] = useActionState<FormState, FormData>(
    updateProfileAction,
    {},
  );
  const [wState, wAction, wPending] = useActionState<FormState, FormData>(
    changePasswordAction,
    {},
  );
  const [eState, eAction, ePending] = useActionState<FormState, FormData>(
    updateEmailAction,
    {},
  );
  const [delPending, startDelete] = useTransition();

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Profile details
        </h2>
        <form action={pAction} className="max-w-md space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input name="firstname" required defaultValue={firstname} className={inputClass} />
            <input name="lastname" required defaultValue={lastname} className={inputClass} />
          </div>
          <input value={email} disabled className={`${inputClass} bg-gray-50 text-gray-400`} />
          <Feedback state={pState} />
          <button
            disabled={pPending}
            className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-gray-300"
          >
            {pPending ? "Saving…" : "Save changes"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Change password
        </h2>
        <form action={wAction} className="max-w-md space-y-3">
          <input
            name="current"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Current password"
            className={inputClass}
          />
          <input
            name="next"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="New password"
            className={inputClass}
          />
          <Feedback state={wState} />
          <button
            disabled={wPending}
            className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-gray-300"
          >
            {wPending ? "Updating…" : "Update password"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Change email</h2>
        <form action={eAction} className="max-w-md space-y-3">
          <input name="email" type="email" required placeholder="New email" className={inputClass} />
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Current password"
            className={inputClass}
          />
          <Feedback state={eState} />
          <button
            disabled={ePending}
            className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-gray-300"
          >
            {ePending ? "Saving…" : "Update email"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-red-600">Danger zone</h2>
        <p className="mb-3 text-sm text-gray-500">
          Permanently delete your account and all associated data.
        </p>
        <button
          onClick={() => {
            if (
              window.confirm(
                "Permanently delete your account? This cannot be undone.",
              )
            ) {
              startDelete(async () => {
                await deleteAccountAction();
              });
            }
          }}
          disabled={delPending}
          className="rounded-full border border-red-300 px-5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {delPending ? "Deleting…" : "Delete account"}
        </button>
      </section>
    </div>
  );
}
