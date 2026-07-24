"use client";

// Fallback swipe para sa iOS — ang C-fade-slider approach mula /swipe-test.
//
// May mga iPhone kung saan HINDI gumagalaw ang native na pahalang na scroll
// ng mga carousel (WebKit quirk; sa Android ayos lang). Pero napatunayan sa
// /swipe-test na DUMARATING naman ang touch events sa page.
//
// FINGER-FOLLOW: sa unang ~10px na pahalang na galaw, titingnan kung
// gumagalaw ang native scroll. Kapag HINDI (ang iOS quirk), aagawin natin
// ang gesture — bawat touchmove ay direktang nagtutulak ng scrollLeft kaya
// sumusunod ang cards sa daliri (walang delay), at pagbitaw ay may kaunting
// momentum glide. Kapag gumagalaw ang native (Android, normal na iPhone),
// WALANG ginagalaw — hindi tayo nakikialam kahit kailan.

import { useRef } from "react";
import type React from "react";

type GestureState = {
  x: number;
  y: number;
  sl: number;
  decided: boolean;
  manual: boolean;
  lastX: number;
  lastT: number;
  vx: number; // px bawat ms — para sa momentum glide
};

export function useSwipeFallback(ref: React.RefObject<HTMLElement | null>) {
  const g = useRef<GestureState | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    g.current = {
      x: t.clientX,
      y: t.clientY,
      sl: ref.current?.scrollLeft ?? 0,
      decided: false,
      manual: false,
      lastX: t.clientX,
      lastT: performance.now(),
      vx: 0,
    };
  }

  function onTouchMove(e: React.TouchEvent) {
    const st = g.current;
    const el = ref.current;
    if (!st || !el) return;
    const t = e.touches[0];
    const dx = t.clientX - st.x;
    const dy = t.clientY - st.y;

    if (!st.decided) {
      if (Math.abs(el.scrollLeft - st.sl) >= 2) {
        // Gumagalaw ang native — huwag nang makialam sa buong gesture.
        st.decided = true;
        st.manual = false;
      } else if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        // Pahalang ang hagod pero patay ang native scroll — akuin natin.
        st.decided = true;
        st.manual = true;
      }
    }

    if (st.manual) {
      const now = performance.now();
      st.vx = (t.clientX - st.lastX) / Math.max(now - st.lastT, 1);
      st.lastX = t.clientX;
      st.lastT = now;
      el.scrollLeft = st.sl - dx; // sumusunod sa daliri, walang antay
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    const st = g.current;
    g.current = null;
    const el = ref.current;
    if (!st || !el) return;

    if (st.manual) {
      // Momentum glide pagbitaw — para hindi biglang huminto.
      const glide = -st.vx * 260;
      if (Math.abs(glide) > 30) el.scrollBy({ left: glide, behavior: "smooth" });
      return;
    }

    // Hindi naging manual (hal. napakabilis na flick na walang touchmove na
    // naproseso): kapag hindi pa rin gumalaw ang scroll, isang pahina ang
    // itulak sa direksyon ng hagod.
    if (Math.abs(el.scrollLeft - st.sl) > 5) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - st.x;
    const dy = t.clientY - st.y;
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    const page = el.clientWidth * 0.85;
    el.scrollBy({ left: dx < 0 ? page : -page, behavior: "smooth" });
  }

  return { onTouchStart, onTouchMove, onTouchEnd };
}
