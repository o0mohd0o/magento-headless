import { redirect } from "next/navigation";
import type { Metadata } from "next";
import RegisterForm from "@/components/RegisterForm";
import { getCustomerToken } from "@/lib/cart-cookies";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage() {
  if (await getCustomerToken()) redirect("/account");

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Create account</h1>
        <p className="mb-6 text-sm text-gray-500">
          Join to track orders and keep your cart across visits.
        </p>
        <RegisterForm />
      </div>
    </div>
  );
}
