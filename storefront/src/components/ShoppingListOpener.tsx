"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type ListItem = { label: string; sku?: string; qty?: number };
type ShoppingList = { name?: string; items: ListItem[] };

// Minimal typings for the File Handling API (Chromium, installed PWAs).
interface LaunchParams {
  files: FileSystemFileHandle[];
}
interface LaunchQueue {
  setConsumer(consumer: (params: LaunchParams) => void): void;
}

/** Parse a .lumalist file: JSON `{ name, items: [{ sku, label, qty }] }`,
 *  with a plain-text fallback of one item per line. */
function parseList(text: string, fileName: string): ShoppingList {
  try {
    const data = JSON.parse(text) as { name?: unknown; items?: unknown };
    if (Array.isArray(data.items)) {
      const items = data.items
        .map((raw): ListItem | null => {
          if (typeof raw === "string") return { label: raw };
          if (raw && typeof raw === "object") {
            const o = raw as Record<string, unknown>;
            const label =
              typeof o.label === "string"
                ? o.label
                : typeof o.sku === "string"
                  ? o.sku
                  : "";
            if (!label) return null;
            return {
              label,
              sku: typeof o.sku === "string" ? o.sku : undefined,
              qty: typeof o.qty === "number" && o.qty > 0 ? o.qty : undefined,
            };
          }
          return null;
        })
        .filter((i): i is ListItem => i !== null);
      return {
        name: typeof data.name === "string" ? data.name : fileName,
        items,
      };
    }
  } catch {
    // not JSON — fall through to the line-per-item format
  }
  const items = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((label) => ({ label }));
  return { name: fileName, items };
}

/**
 * Opens .lumalist shopping-list files. Installed PWAs receive files through
 * the manifest file_handlers → launchQueue; every browser can also open a
 * file via the picker below, so the feature works (and is testable) anywhere.
 */
export default function ShoppingListOpener() {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [error, setError] = useState("");

  const openFile = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const parsed = parseList(text, file.name.replace(/\.lumalist$/, ""));
      if (!parsed.items.length) {
        setError("That file doesn't contain any list items.");
        setList(null);
        return;
      }
      setError("");
      setList(parsed);
    } catch {
      setError("Couldn't read that file.");
      setList(null);
    }
  }, []);

  // Files launched from the OS (installed app, .lumalist association).
  useEffect(() => {
    const queue = (window as unknown as { launchQueue?: LaunchQueue })
      .launchQueue;
    if (!queue) return;
    queue.setConsumer(async (params) => {
      const handle = params.files?.[0];
      if (!handle) return;
      openFile(await handle.getFile());
    });
  }, [openFile]);

  return (
    <div className="mt-6 space-y-6">
      {!list && (
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 px-6 py-12 text-center hover:border-indigo-400">
          <span className="text-sm font-medium text-gray-900">
            Open a shopping list
          </span>
          <span className="text-xs text-gray-500">
            Choose a .lumalist file — or try the{" "}
            <a
              href="/sample.lumalist"
              download
              className="text-indigo-600 underline"
              onClick={(e) => e.stopPropagation()}
            >
              sample list
            </a>
          </span>
          <input
            type="file"
            accept=".lumalist,application/json,text/plain"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) openFile(f);
            }}
          />
        </label>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {list && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {list.name || "Shopping list"}
            </h2>
            <button
              onClick={() => setList(null)}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Open another list
            </button>
          </div>
          <ul className="divide-y divide-gray-200 rounded-2xl border border-gray-200">
            {list.items.map((item, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {item.label}
                  </p>
                  {item.sku && (
                    <p className="text-xs text-gray-400">SKU {item.sku}</p>
                  )}
                </div>
                {item.qty && (
                  <span className="text-sm text-gray-500">× {item.qty}</span>
                )}
                <Link
                  href={`/search?q=${encodeURIComponent(item.sku || item.label)}`}
                  className="rounded-full bg-gray-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
                >
                  Find it
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
