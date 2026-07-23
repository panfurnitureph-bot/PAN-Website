"use client";

// Bilog na "Track order" na icon-button — nasa gilid, sa itaas ng chat bubble.
// Pag-click: bumubukas ang order tracker sa isang pop-up (hindi bagong page).

import { useEffect, useState } from "react";

export default function TrackButton() {
  const [open, setOpen] = useState(false);

  // Escape para isara; harangin ang scroll sa likod habang bukas.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Track your order"
        title="Track your order"
        data-floating
        className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-espresso text-cream shadow-lg flex items-center justify-center hover:bg-cognac transition-colors"
      >
        {/* Truck / delivery icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
          <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
          <circle cx="7" cy="17" r="1.6" />
          <circle cx="17.5" cy="17" r="1.6" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6">
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-cream w-full max-w-lg h-[85vh] rounded-xl shadow-2xl overflow-hidden">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 text-ink shadow flex items-center justify-center text-xl leading-none hover:bg-white"
            >
              ×
            </button>
            {/* Ang buong tracker sa loob ng pop-up — walang paglipat ng page. */}
            <iframe src="/track?embed=1" title="Order tracker" className="w-full h-full border-0" />
          </div>
        </div>
      )}
    </>
  );
}
