import { redirect } from "next/navigation";
import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";
import { getCustomerToken } from "@/lib/cart-cookies";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getCustomerToken()) redirect("/account");

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="mb-6 text-sm text-gray-500">
          Sign in to your account to view orders and check out faster.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
