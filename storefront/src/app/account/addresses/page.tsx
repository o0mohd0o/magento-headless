import type { Metadata } from "next";
import { getAddresses } from "@/lib/account";
import { getCountries } from "@/lib/checkout";
import AddressBook from "@/components/account/AddressBook";

export const metadata: Metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const [addresses, countries] = await Promise.all([
    getAddresses(),
    getCountries(),
  ]);
  return <AddressBook addresses={addresses} countries={countries} />;
}
