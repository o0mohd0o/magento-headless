import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { getRecaptchaSiteKey } from "@/lib/recaptcha";

export const metadata: Metadata = { title: "Contact us" };

export default async function ContactPage() {
  const recaptchaSiteKey = await getRecaptchaSiteKey();
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Contact us</h1>
      <p className="mt-2 text-sm text-gray-500">
        Questions about an order or a product? Send us a message.
      </p>
      <div className="mt-8">
        <ContactForm recaptchaSiteKey={recaptchaSiteKey} />
      </div>
    </div>
  );
}
