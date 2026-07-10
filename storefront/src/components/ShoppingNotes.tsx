"use client";

import { useEffect, useRef, useState } from "react";

type Note = { id: string; text: string; updatedAt: number };

const STORAGE_KEY = "luma_notes_v1";

function load(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (n): n is Note =>
        !!n &&
        typeof n === "object" &&
        typeof (n as Note).id === "string" &&
        typeof (n as Note).text === "string",
    );
  } catch {
    return [];
  }
}

function persist(notes: Note[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // storage full/blocked — notes stay in memory for the session
  }
}

/**
 * Local shopping notes (sizes to check, gift ideas, wish lists). Stored in
 * localStorage only — nothing leaves the browser. The manifest note_taking
 * member points new-note actions at /notes?new=1.
 */
export default function ShoppingNotes({ startNew }: { startNew?: boolean }) {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const startedNew = useRef(false);

  useEffect(() => {
    const existing = load();
    if (startNew && !startedNew.current) {
      startedNew.current = true;
      const fresh: Note = {
        id: crypto.randomUUID(),
        text: "",
        updatedAt: Date.now(),
      };
      const next = [fresh, ...existing];
      persist(next);
      setNotes(next);
    } else {
      setNotes(existing);
    }
  }, [startNew]);

  if (notes === null) {
    return <div className="mt-6 h-24 animate-pulse rounded-2xl bg-gray-100" />;
  }

  const update = (id: string, text: string) => {
    const next = notes.map((n) =>
      n.id === id ? { ...n, text, updatedAt: Date.now() } : n,
    );
    setNotes(next);
    persist(next);
  };

  const add = () => {
    const next: Note[] = [
      { id: crypto.randomUUID(), text: "", updatedAt: Date.now() },
      ...notes,
    ];
    setNotes(next);
    persist(next);
  };

  const remove = (id: string) => {
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    persist(next);
  };

  return (
    <div className="mt-6 space-y-4">
      <button
        onClick={add}
        className="rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700"
      >
        New note
      </button>

      {notes.length === 0 && (
        <p className="text-sm text-gray-500">
          No notes yet — jot down sizes, gift ideas, or things to compare.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {notes.map((note, i) => (
          <div
            key={note.id}
            className="rounded-2xl border border-gray-200 p-4 focus-within:border-indigo-400"
          >
            <textarea
              value={note.text}
              autoFocus={i === 0 && note.text === ""}
              placeholder="Write a note…"
              rows={4}
              onChange={(e) => update(note.id, e.target.value)}
              className="w-full resize-y border-0 p-0 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {new Date(note.updatedAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => remove(note.id)}
                className="text-xs text-gray-400 hover:text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
