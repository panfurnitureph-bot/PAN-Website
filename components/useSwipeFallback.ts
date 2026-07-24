"use client";

// Fallback swipe para sa iOS — ang C-fade-slider approach mula /swipe-test.
//
// May mga iPhone kung saan HINDI gumagalaw ang native na pahalang na scroll
// ng mga carousel (WebKit quirk; sa Android ayos lang). Pero napatunayan sa
// /swipe-test na DUMARATING naman ang touch events sa page.
//
// FINGER-FOLLOW na may rAF smoothing: sa unang ~10px na pahalang na galaw,
// titingnan kung gumagalaw ang native scroll. Kapag HINDI (ang iOS quirk),
// aagawin natin ang gesture. Ang touchmove ay nagtatakda lang ng TARGET;
// isang requestAnimationFrame loop ang banayad na naghahabol dito bawat
// frame — kaya kahit hindi pantay ang dating ng touch events, tuloy-tuloy
// at makinis ang galaw (hindi pahinto-hinto). Pagbitaw ay may momentum
// glide na agad humihinto sa susunod na dampi (para hindi kainin ng iOS
// ang sunod na vertical swipe). Kapag gumagalaw ang native (Android,
// normal na iPhone), WALANG ginagalaw — hindi tayo nakikialam.

import { useRef } from "react";
import type React from "react";

type GestureState = {
  x: number;
  y: number;
  sl: number;
  decided: boolean;
  manual: boolean;
  target: number; // saan dapat ang scrollLeft ayon sa daliri
  lastX: number;
  lastT: number;
  vx: number; // px bawat ms — para sa momentum glide
};

export function useSwipeFallback(ref: React.RefObject<HTMLElement | null>) {
  const g = useRef<GestureState | null>(null);
  const raf = useRef(0);

  // Itigil ang kahit anong umaandar na animation (follow o glide). Mahalagang
  // tumakbo ito sa bawat bagong dampi: kapag may animation pang umaandar
  // habang dumidikit ang daliri, kinakain ng iOS ang buong susunod na gesture
  // (hindi makapag-scroll pataas/pababa hangga't hindi pinipindot muna).
  function stopAnim() {
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    }
  }

  // Habang hawak ang gesture: banayad na habulin ang target bawat frame.
  function startFollow() {
    if (raf.current) return;
    const step = () => {
      const node = ref.current;
      const st = g.current;
      if (!node || !st || !st.manual) {
        raf.current = 0;
        return;
      }
      const gap = st.target - node.scrollLeft;
      // 45% ng natitirang layo bawat frame — mabilis humabol, walang jitter.
      if (Math.abs(gap) > 0.5) node.scrollLeft += gap * 0.45;
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }

  function onTouchStart(e: React.TouchEvent) {
    stopAnim();
    const t = e.touches[0];
    g.current = {
      x: t.clientX,
      y: t.clientY,
      sl: ref.current?.scrollLeft ?? 0,
      decided: false,
      manual: false,
      target: ref.current?.scrollLeft ?? 0,
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
        startFollow();
      }
    }

    if (st.manual) {
      const now = performance.now();
      st.vx = (t.clientX - st.lastX) / Math.max(now - st.lastT, 1);
      st.lastX = t.clientX;
      st.lastT = now;
      st.target = st.sl - dx; // ang rAF loop ang maghahatid dito nang makinis
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    const st = g.current;
    g.current = null;
    const el = ref.current;
    stopAnim();
    if (!st || !el) return;

    if (st.manual) {
      // Momentum glide pagbitaw — sariling rAF animation (HINDI ang browser
      // smooth scroll) para maihinto agad sa susunod na dampi.
      let v = -st.vx; // px bawat ms, sa direksyon ng scroll
      if (Math.abs(v) > 0.05) {
        let last = performance.now();
        const step = (now: number) => {
          const node = ref.current;
          if (!node) {
            raf.current = 0;
            return;
          }
          const dt = now - last;
          last = now;
          node.scrollLeft += v * dt;
          v *= Math.pow(0.94, dt / 16); // unti-unting bumabagal
          if (Math.abs(v) > 0.02) raf.current = requestAnimationFrame(step);
          else raf.current = 0;
        };
        raf.current = requestAnimationFrame(step);
      }
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
