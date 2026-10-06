"use client";

// TOAST (2026-10-07, mockup): maikling pill sa ibaba ng screen — "<pangalan> added
// to cart", "Saved to wishlist" — na umaangat, tapos nawawala pagkalipas ng
// 2.2 segundo. Tawag: `toast("…")` mula sa kahit saang client component.
// Walang laman na nakasalalay dito; abiso lang.

import { useEffect, useState } from "react";

const EVENT = "pan:toast";

export function toast(message: string) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVENT, { detail: message }));
}

export default function Toast() {
  const [msg, setMsg] = useState("");
  const [on, setOn] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | null = null;
    const h = (e: Event) => {
      setMsg(String((e as CustomEvent<string>).detail ?? ""));
      setOn(true);
      if (t) clearTimeout(t);
      t = setTimeout(() => setOn(false), 2200);
    };
    window.addEventListener(EVENT, h);
    return () => { window.removeEventListener(EVENT, h); if (t) clearTimeout(t); };
  }, []);
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed left-1/2 bottom-[26px] z-[95] flex items-center gap-2.5 rounded-full bg-[#2E2518] py-3 pl-3 pr-[18px] text-[14px] font-semibold text-[#F4EAD8] shadow-[0_20px_40px_-18px_rgba(0,0,0,.7)] transition-all duration-300 ease-out ${on ? "-translate-x-1/2 translate-y-0 opacity-100" : "-translate-x-1/2 translate-y-6 opacity-0"}`}
    >
      <i aria-hidden className="grid h-[26px] w-[26px] place-items-center rounded-full bg-gold text-brownDeep">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
      </i>
      {msg}
    </div>
  );
}
