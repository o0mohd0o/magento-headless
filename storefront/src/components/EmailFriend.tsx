"use client";

import { useActionState, useState } from "react";
import { emailToFriendAction } from "@/lib/comms-actions";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none";

export default function EmailFriend({ productUid }: { productUid: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(emailToFriendAction, {});

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-sm text-gray-500 underline-offset-2 hover:text-indigo-700 hover:underline"
      >
        Email a friend
      </button>

      {open && (
        <div className="mt-3 rounded-xl border border-gray-200 p-4">
          {state.ok ? (
            <p className="text-sm text-green-600">{state.message}</p>
          ) : (
            <form action={action} className="space-y-2">
              <input type="hidden" name="productUid" value={productUid} />
              <div className="grid grid-cols-2 gap-2">
                <input name="senderName" required placeholder="Your name" className={inputClass} />
                <input name="senderEmail" type="email" required placeholder="Your email" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input name="recipientName" required placeholder="Friend's name" className={inputClass} />
                <input name="recipientEmail" type="email" required placeholder="Friend's email" className={inputClass} />
              </div>
              <textarea name="message" rows={2} placeholder="Message (optional)" className={inputClass} />
              {state.error && <p className="text-xs text-red-600">{state.error}</p>}
              <button
                disabled={pending}
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-gray-300"
              >
                {pending ? "Sending…" : "Send"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
