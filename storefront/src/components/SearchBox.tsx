"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatMoney } from "@/lib/format";

type Suggestion = {
  name: string;
  url_key: string;
  image: string | null;
  price: { value: number; currency: string };
};

export default function SearchBox() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setItems([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/suggest?q=${encodeURIComponent(q.trim())}`);
        const d = await r.json();
        setItems(d.items ?? []);
        setOpen(true);
      } catch {
        setItems([]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className="relative">
      <form onSubmit={submit}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => items.length && setOpen(true)}
          placeholder="Search products…"
          aria-label="Search products"
          className="w-48 rounded-full border border-gray-300 px-4 py-1.5 text-sm focus:border-indigo-500 focus:outline-none lg:w-56"
        />
      </form>
      {open && items.length > 0 && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {items.map((it) => (
            <Link
              key={it.url_key}
              href={`/product/${it.url_key}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50"
            >
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                {it.image && (
                  <Image src={it.image} alt={it.name} fill sizes="40px" className="object-cover" />
                )}
              </div>
              <span className="flex-1 truncate text-sm text-gray-800">{it.name}</span>
              <span className="text-sm font-medium text-gray-900">
                {formatMoney(it.price)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
