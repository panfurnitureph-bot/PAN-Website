"use client";

// SEARCH RESULTS PAGE — /search?q=sofa
// Client-side filtering ng products mula sa content/products.json.
//
// PREMIUM (Joe 2026-10-07, ang Search ng mockup): malaking field na may
// salamin at Clear, "Popular" na chip, bilang ng resulta, apat na column ng
// card na sunod-sunod na sumusulpot. Parehong paghahanap ng dati.

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense, useState } from "react";
import type { Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

// Katulad na katulad ng searchProducts() sa lib/products.ts — pero sa
// listahang ipinasa mula sa server, hindi sa naka-bundle na JSON.
function searchIn(products: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.materials.toLowerCase().includes(q)
  );
}

const POPULAR: [string, string][] = [["Chairs", "chair"], ["Mattress", "mattress"], ["Sofas", "sofa"], ["Tables", "table"], ["Promo beds", "promo bed"]];

function SearchContent({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get("q") ?? "";
  const [input, setInput] = useState(query);

  const results = searchIn(products, query);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(input.trim())}`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 md:py-8">
      <h1 className="font-cormorant font-semibold text-[clamp(30px,3.6vw,40px)] leading-[1.05] tracking-[-0.02em] mb-5">Search</h1>

      <form onSubmit={submit} role="search" className="flex items-center gap-2 h-[58px] rounded-2xl bg-white pl-5 pr-2 shadow-[0_0_0_1px_#E4DACA,0_18px_34px_-26px_rgba(62,50,32,.5)] transition-shadow focus-within:shadow-[0_0_0_1.5px_#B08A3E,0_0_0_5px_rgba(226,194,122,.25),0_18px_34px_-26px_rgba(62,50,32,.5)]">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="shrink-0 text-stone" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search sofas, dining, lighting…"
          aria-label="Search products"
          className="min-w-0 flex-1 bg-transparent text-[18px] font-medium text-ink outline-none placeholder:text-stone/70"
        />
        {input && (
          <button type="button" onClick={() => { setInput(""); router.push("/search"); }} className="h-10 shrink-0 rounded-xl bg-white px-4 text-[13px] font-semibold text-ink shadow-[inset_0_0_0_1px_#C9B98F] transition hover:shadow-[inset_0_0_0_1.5px_#B08A3E] hover:text-goldDeep">
            Clear
          </button>
        )}
        <button type="submit" className="pf-dark pf-btn h-10 shrink-0 rounded-xl px-5 text-[13px] font-bold hover:text-gold">Search</button>
      </form>

      <div className="flex flex-wrap items-center gap-2 mt-3.5">
        <span className="text-[12.5px] text-stone mr-1">Popular:</span>
        {POPULAR.map(([p, q]) => (
          <Link key={p} href={`/search?q=${encodeURIComponent(q)}`} className={`h-9 inline-flex items-center rounded-full px-4 text-[13px] font-semibold transition ${query.toLowerCase() === q ? "pf-dark" : "bg-white text-ink shadow-[inset_0_0_0_1px_#E0D5C1] hover:shadow-[inset_0_0_0_1px_#B08A3E]"}`}>
            {p}
          </Link>
        ))}
      </div>

      {query && (
        <p className="text-stone text-[13px] mt-6 mb-5">
          {results.length} {results.length === 1 ? "result" : "results"} for{" "}
          <strong className="text-ink">&ldquo;{query}&rdquo;</strong>
        </p>
      )}

      {query && results.length === 0 ? (
        <p className="pf-card text-stone text-sm py-16 px-6 text-center">
          No results found. Try a different keyword — e.g. &ldquo;sofa&rdquo;,
          &ldquo;leather&rdquo;, &ldquo;dining&rdquo;.
        </p>
      ) : (
        <div key={query} data-stagger className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {results.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

// Ang `products` ay galing sa page.tsx (server) — doon lang nakukuha ang
// sariwang laman mula sa Supabase.
export default function SearchClient({ products }: { products: Product[] }) {
  // useSearchParams needs a Suspense boundary sa App Router
  return (
    <Suspense>
      <SearchContent products={products} />
    </Suspense>
  );
}
