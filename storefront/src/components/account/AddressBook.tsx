"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import CustomerAddressForm from "./CustomerAddressForm";
import {
  deleteAddressAction,
  saveAddressAction,
  type CustomerAddressInputData,
} from "@/lib/account-actions";
import type { Country, CustomerAddress } from "@/lib/types";

// editing: undefined = closed, null = new, address = editing existing
type Editing = CustomerAddress | null | undefined;

export default function AddressBook({
  addresses,
  countries,
}: {
  addresses: CustomerAddress[];
  countries: Country[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Editing>(undefined);
  const [err, setErr] = useState<string | null>(null);

  function save(data: CustomerAddressInputData) {
    setErr(null);
    startTransition(async () => {
      const uid = editing && editing.uid ? editing.uid : null;
      const r = await saveAddressAction(uid, data);
      if (r.ok) {
        setEditing(undefined);
        router.refresh();
      } else {
        setErr(r.error ?? "Could not save address.");
      }
    });
  }

  function remove(uid: string) {
    if (!window.confirm("Delete this address?")) return;
    startTransition(async () => {
      await deleteAddressAction(uid);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Addresses</h2>
        {editing === undefined && (
          <button
            onClick={() => {
              setErr(null);
              setEditing(null);
            }}
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Add address
          </button>
        )}
      </div>

      {editing !== undefined ? (
        <CustomerAddressForm
          countries={countries}
          initial={editing}
          pending={pending}
          error={err}
          onSubmit={save}
          onCancel={() => setEditing(undefined)}
        />
      ) : addresses.length === 0 ? (
        <p className="text-sm text-gray-500">You have no saved addresses.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.uid} className="rounded-2xl border border-gray-200 p-5 text-sm">
              <div className="mb-2 flex gap-2">
                {a.default_shipping && (
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
                    Default shipping
                  </span>
                )}
                {a.default_billing && (
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    Default billing
                  </span>
                )}
              </div>
              <address className="not-italic text-gray-700">
                {a.firstname} {a.lastname}
                <br />
                {a.street?.join(", ")}
                <br />
                {a.city}, {a.region?.region_code} {a.postcode}
                <br />
                {a.country_code} · {a.telephone}
              </address>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => {
                    setErr(null);
                    setEditing(a);
                  }}
                  className="text-sm font-medium text-indigo-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(a.uid)}
                  disabled={pending}
                  className="text-sm text-gray-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
