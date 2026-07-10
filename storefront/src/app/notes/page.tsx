import type { Metadata } from "next";
import ShoppingNotes from "@/components/ShoppingNotes";

export const metadata: Metadata = {
  title: "Shopping notes",
  robots: { index: false },
};

// Target of the manifest note_taking.new_note_url (/notes?new=1): the OS
// "new note" action opens a fresh note; notes live in localStorage only.
export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Shopping notes</h1>
      <p className="mt-1 text-sm text-gray-500">
        Private notes stored in this browser — sizes to check, gift ideas,
        things to compare.
      </p>
      <ShoppingNotes startNew={sp.new === "1"} />
    </div>
  );
}
