"use client";

import { useState } from "react";
import type { Country, CustomerAddress } from "@/lib/types";
import type { CustomerAddressInputData } from "@/lib/account-actions";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

export default function CustomerAddressForm({
  countries,
  initial,
  pending,
  error,
  onSubmit,
  onCancel,
}: {
  countries: Country[];
  initial?: CustomerAddress | null;
  pending: boolean;
  error?: string | null;
  onSubmit: (data: CustomerAddressInputData) => void;
  onCancel: () => void;
}) {
  const [countryCode, setCountryCode] = useState(initial?.country_code ?? "US");
  const country = countries.find((c) => c.id === countryCode);
  const regions = country?.available_regions ?? [];

  function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: CustomerAddressInputData = {
      firstname: String(fd.get("firstname") ?? "").trim(),
      lastname: String(fd.get("lastname") ?? "").trim(),
      company: String(fd.get("company") ?? "").trim() || undefined,
      street: [String(fd.get("street") ?? "").trim()],
      city: String(fd.get("city") ?? "").trim(),
      postcode: String(fd.get("postcode") ?? "").trim(),
      country_code: countryCode,
      telephone: String(fd.get("telephone") ?? "").trim(),
      region: regions.length
        ? { region_id: Number(fd.get("region_id")) || undefined }
        : { region: String(fd.get("region") ?? "").trim() || undefined },
      default_shipping: fd.get("default_shipping") === "on",
      default_billing: fd.get("default_billing") === "on",
    };
    onSubmit(data);
  }

  return (
    <form onSubmit={handle} className="space-y-3 rounded-2xl border border-gray-200 p-5">
      <div className="grid grid-cols-2 gap-3">
        <input name="firstname" required defaultValue={initial?.firstname} placeholder="First name" className={inputClass} />
        <input name="lastname" required defaultValue={initial?.lastname} placeholder="Last name" className={inputClass} />
      </div>
      <input name="company" defaultValue={initial?.company ?? ""} placeholder="Company (optional)" className={inputClass} />
      <input name="street" required defaultValue={initial?.street?.[0]} placeholder="Street address" className={inputClass} />
      <div className="grid grid-cols-2 gap-3">
        <input name="city" required defaultValue={initial?.city} placeholder="City" className={inputClass} />
        {regions.length ? (
          <select name="region_id" required defaultValue={initial?.region?.region_id ?? ""} className={inputClass}>
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
          <input name="region" defaultValue={initial?.region?.region ?? ""} placeholder="State / Region" className={inputClass} />
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input name="postcode" required defaultValue={initial?.postcode} placeholder="ZIP / Postal code" className={inputClass} />
        <select name="country" value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className={inputClass}>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name_locale}
            </option>
          ))}
        </select>
      </div>
      <input name="telephone" required defaultValue={initial?.telephone} placeholder="Phone" className={inputClass} />

      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="default_shipping" defaultChecked={!!initial?.default_shipping} />
          Default shipping
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="default_billing" defaultChecked={!!initial?.default_billing} />
          Default billing
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-gray-300"
        >
          {pending ? "Saving…" : "Save address"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
