import type { Metadata } from "next";
import { getOverview } from "@/lib/account";
import ProfileForms from "@/components/account/ProfileForms";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const customer = await getOverview();
  if (!customer) return null;
  return (
    <ProfileForms
      firstname={customer.firstname}
      lastname={customer.lastname}
      email={customer.email}
    />
  );
}
