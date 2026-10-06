"use client";

// ANGAT PAGDATING SA SCREEN (Joe 2026-10-07, "makuha pati mga animation") —
// ang mga bloke na may `data-reveal` ay dahan-dahang lumilitaw pagdating sa
// screen, gaya ng sa mockup. LIGTAS NA DEFAULT: ang `pf-pre` (nakatago) ay
// idinadagdag LANG dito at sa mga blokeng nasa ibaba pa ng screen — kaya kung
// walang JS, walang IntersectionObserver, o reduced motion ang gamit, kita
// ang lahat gaya ng dati. Walang binabago sa laman o sa mga link.

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Reveal() {
  const path = usePathname();
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const show = (el: Element) => el.classList.remove("pf-pre");
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }),
      { rootMargin: "0px 0px -6% 0px", threshold: 0.04 },
    );
    const vh = window.innerHeight;
    els.forEach((el) => {
      // Ang nasa screen na ay hindi ginagalaw — walang kislap sa unang tingin.
      if (el.getBoundingClientRect().top > vh * 0.94) { el.classList.add("pf-pre"); io.observe(el); }
    });
    return () => { io.disconnect(); els.forEach(show); };
  }, [path]);
  return null;
}
