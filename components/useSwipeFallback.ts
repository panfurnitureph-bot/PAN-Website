"use client";

// Fallback swipe para sa iOS — ang C-fade-slider approach mula /swipe-test.
//
// May mga iPhone kung saan HINDI gumagalaw ang native na pahalang na scroll
// ng mga carousel (WebKit quirk; sa Android ayos lang). Pero napatunayan sa
// /swipe-test na DUMARATING naman ang touch events sa page. Kaya: kapag
// natapos ang isang pahalang na hagod nang HINDI gumalaw ang scroll ng
// track, kami na ang magpapa-scroll ng isang pahina sa direksyon ng hagod.
//
// Sa mga phone na gumagana ang native scroll, hindi ito nakikialam — kapag
// gumalaw ang scrollLeft sa panahon ng hagod, walang gagawin (iwas doble).

import { useRef } from "react";
import type React from "react";

export function useSwipeFallback(ref: React.RefObject<HTMLElement | null>) {
  const start = useRef<{ x: number; y: number; sl: number } | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    start.current = {
      x: t.clientX,
      y: t.clientY,
      sl: ref.current?.scrollLeft ?? 0,
    };
  }

  function onTouchEnd(e: React.TouchEvent) {
    const s = start.current;
    start.current = null;
    const el = ref.current;
    if (!s || !el) return;
    // Gumalaw ang native scroll — huwag makialam.
    if (Math.abs(el.scrollLeft - s.sl) > 5) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    // Dapat sapat ang haba at mas pahalang kaysa patayo ang hagod.
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    const page = el.clientWidth * 0.85;
    el.scrollBy({ left: dx < 0 ? page : -page, behavior: "smooth" });
  }

  return { onTouchStart, onTouchEnd };
}
