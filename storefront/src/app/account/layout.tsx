import { requireToken } from "@/lib/account";
import AccountNav from "@/components/account/AccountNav";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireToken(); // redirects to /login when signed out

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">My account</h1>
      <div className="grid gap-8 md:grid-cols-[180px_1fr]">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
