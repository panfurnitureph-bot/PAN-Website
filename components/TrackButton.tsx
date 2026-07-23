"use client";

// Bilog na "Track order" na buton — nasa gilid, sa itaas ng chat bubble.
// Dinadala ang customer sa order tracker.

import Link from "next/link";

export default function TrackButton() {
  return (
    <Link
      href="/track"
      aria-label="Track your order"
      title="Track your order"
      className="group fixed bottom-24 right-5 z-40 flex items-center gap-2 rounded-full bg-espresso text-cream shadow-lg hover:bg-cognac transition-all pl-3 pr-4 h-12"
    >
      {/* Truck / delivery icon */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
        <circle cx="7" cy="17" r="1.6" />
        <circle cx="17.5" cy="17" r="1.6" />
      </svg>
      <span className="text-xs font-bold tracking-widest2 whitespace-nowrap">TRACK ORDER</span>
    </Link>
  );
}
