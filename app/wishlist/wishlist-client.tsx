"use client";

// WISHLIST PAGE — mga na-heart na products.
// PREMIUM (Joe 2026-10-07, ang Wishlist ng mockup): pamagat at linya sa ilalim,
// apat na column ng card na sunod-sunod na sumusulpot; card para sa walang laman.

import Link from "next/link";
import type { Product } from "@/lib/products";
import { useStore } from "@/components/store";
import ProductCard from "@/components/ProductCard";

// Ang `products` ay galing sa page.tsx (server) — doon lang nakukuha ang
// sariwang laman mula sa Supabase.
export default function WishlistClient({ products }: { products: Product[] }) {
  const { wishlist } = useStore();
  const items = wishlist
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 md:py-8">
      <div className="mb-6">
        <h1 className="font-cormorant font-semibold text-[clamp(30px,3.6vw,40px)] leading-[1.05] tracking-[-0.02em]">Wishlist</h1>
        <p className="text-stone text-[14.5px] mt-2">Pieces you saved. They stay here until you remove them.</p>
      </div>
      {items.length === 0 ? (
        <div className="pf-card text-center py-16 px-6">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-goldSoft text-brownDeep shadow-[inset_0_0_0_1px_rgba(176,138,62,.35)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M12 21C7 16.5 3 13 3 8.8 3 6 5.2 4 7.8 4c1.7 0 3.2.9 4.2 2.3C13 4.9 14.5 4 16.2 4 18.8 4 21 6 21 8.8c0 4.2-4 7.7-9 12.2z" /></svg>
          </span>
          <p className="text-stone mb-6">
            Nothing saved yet. Tap the ♥ on any product to save it here.
          </p>
          <Link
            href="/collections/new-in"
            className="pf-dark pf-btn inline-flex h-12 items-center gap-2 rounded-full px-7 text-[14px] font-bold hover:text-gold"
          >
            Explore new arrivals <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
        </div>
      ) : (
        <div data-stagger className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {items.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
