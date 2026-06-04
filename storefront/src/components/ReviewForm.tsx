"use client";

import { useActionState, useState } from "react";
import { createReviewAction, type ReviewState } from "@/lib/review-actions";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

export default function ReviewForm({
  sku,
  ratingId,
  ratingValues,
}: {
  sku: string;
  ratingId: string;
  ratingValues: { value_id: string; value: string }[];
}) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(
    createReviewAction,
    {},
  );
  const [stars, setStars] = useState(0);

  // value '5' -> its value_id, etc.
  const valueIdFor = (n: number) =>
    ratingValues.find((v) => v.value === String(n))?.value_id ?? "";

  if (state.ok) {
    return (
      <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
        Thanks! Your review was submitted and is pending approval.
      </p>
    );
  }

  return (
    <form action={action} className="max-w-lg space-y-3">
      <input type="hidden" name="sku" value={sku} />
      <input type="hidden" name="ratingId" value={ratingId} />
      <input type="hidden" name="valueId" value={valueIdFor(stars)} />

      <div>
        <span className="mb-1 block text-sm font-medium text-gray-700">Rating</span>
        <div className="flex gap-1 text-2xl">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setStars(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className={n <= stars ? "text-amber-400" : "text-gray-300"}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <input name="nickname" required placeholder="Your name" className={inputClass} />
      <input name="summary" required placeholder="Review summary" className={inputClass} />
      <textarea name="text" required rows={3} placeholder="Your review" className={inputClass} />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        disabled={pending}
        className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-gray-300"
      >
        {pending ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
