"use client";

import { useState } from "react";
import type { AddressInput, Country } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

export default function AddressForm({
  countries,
  pending,
  error,
  onSubmit,
}: {
  countries: Country[];
  pending: boolean;
  error?: string | null;
  onSubmit: (address: AddressInput) => void;
}) {
  const [countryCode, setCountryCode] = useState("US");
  const country = countries.find((c) => c.id === countryCode);
  const regions = country?.available_regions ?? [];

  function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const address: AddressInput = {
      firstname: String(fd.get("firstname") ?? "").trim(),
      lastname: String(fd.get("lastname") ?? "").trim(),
      street: [String(fd.get("street") ?? "").trim()],
      city: String(fd.get("city") ?? "").trim(),
      postcode: String(fd.get("postcode") ?? "").trim(),
      country_code: countryCode,
      telephone: String(fd.get("telephone") ?? "").trim(),
    };
    if (regions.length) {
      const rid = Number(fd.get("region_id"));
      if (rid) address.region_id = rid;
    } else {
      const r = String(fd.get("region") ?? "").trim();
      if (r) address.region = r;
    }
    onSubmit(address);
  }

  return (
    <form onSubmit={handle} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input name="firstname" required placeholder="First name" className={inputClass} />
        <input name="lastname" required placeholder="Last name" className={inputClass} />
      </div>
      <input name="street" required placeholder="Street address" className={inputClass} />
      <div className="grid grid-cols-2 gap-3">
        <input name="city" required placeholder="City" className={inputClass} />
        {regions.length ? (
          <select name="region_id" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              State / Region
            </option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        ) : (
          <input name="region" placeholder="State / Region" className={inputClass} />
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input name="postcode" required placeholder="ZIP / Postal code" className={inputClass} />
        <select
          name="country"
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className={inputClass}
        >
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name_locale}
            </option>
          ))}
        </select>
      </div>
      <input name="telephone" required placeholder="Phone" className={inputClass} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:bg-gray-300"
      >
        {pending ? "Saving…" : "Use this address"}
      </button>
    </form>
  );
}
