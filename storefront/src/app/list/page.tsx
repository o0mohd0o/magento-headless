import type { Metadata } from "next";
import ShoppingListOpener from "@/components/ShoppingListOpener";

export const metadata: Metadata = {
  title: "Shopping list",
  robots: { index: false },
};

// Target of the manifest file_handlers entry: opening a .lumalist file with
// the installed app lands here (launchQueue); the page also works standalone
// in any browser via the file picker.
export default function ShoppingListPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Shopping list</h1>
      <p className="mt-1 text-sm text-gray-500">
        Open a shared <code>.lumalist</code> file and jump straight to each
        item in the catalog.
      </p>
      <ShoppingListOpener />
    </div>
  );
}
