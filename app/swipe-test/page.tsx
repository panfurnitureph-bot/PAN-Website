"use client";

// PANSAMANTALANG diagnostic page para sa iOS swipe bug — /swipe-test
// Buburahin ito kapag naayos na. Tatlong uri ng carousel + live na log ng
// touch events sa screen mismo, para makita natin kung ano talaga ang
// nangyayari sa totoong iPhone nang walang computer na nakakabit.

import { useEffect, useRef, useState } from "react";

const COLORS = ["#b1502e", "#caa45a", "#2b4c3f", "#5b6c8f", "#8a4f6d", "#6f6234", "#444", "#987"];

function Cards() {
  return (
    <>
      {COLORS.map((c, i) => (
        <div
          key={i}
          className="shrink-0 w-[60vw] h-32 rounded-lg flex items-center justify-center text-white text-3xl font-bold"
          style={{ background: c }}
        >
          {i + 1}
        </div>
      ))}
    </>
  );
}

export default function SwipeTest() {
  const [log, setLog] = useState<string[]>([]);
  const [fadeIdx, setFadeIdx] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const aRef = useRef<HTMLDivElement>(null);
  const bRef = useRef<HTMLDivElement>(null);

  function add(msg: string) {
    setLog((l) => [`${new Date().toLocaleTimeString()} ${msg}`, ...l].slice(0, 14));
  }

  useEffect(() => {
    add(`UA: ${navigator.userAgent.slice(0, 90)}`);
  }, []);

  // Fade slider — parehong logic ng hero swipe
  function onTS(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
    add(`C touchstart x=${Math.round(t.clientX)}`);
  }
  function onTE(e: React.TouchEvent) {
    const s = touchStart.current;
    touchStart.current = null;
    if (!s) return add("C touchend WALANG start");
    const t = e.changedTouches[0];
    const dx = Math.round(t.clientX - s.x);
    const dy = Math.round(t.clientY - s.y);
    add(`C touchend dx=${dx} dy=${dy}`);
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.2) return add("C: masyadong maliit/patayo — walang lipat");
    setFadeIdx((i) => (dx < 0 ? (i + 1) % COLORS.length : (i - 1 + COLORS.length) % COLORS.length));
    add(`C: LIPAT ${dx < 0 ? "→ next" : "← prev"}`);
  }

  return (
    <main className="min-h-screen bg-white text-black p-4 space-y-6 pb-40">
      <h1 className="text-xl font-bold">Swipe Test (pansamantala)</h1>
      <p className="text-sm text-gray-600">
        Subukan i-swipe pakaliwa at pakanan ang bawat kahon. Tingnan ang LOG sa
        baba — screenshot mo lahat pagkatapos.
      </p>

      <section>
        <h2 className="font-bold mb-2">A · Plain scroll (walang snap)</h2>
        <div
          ref={aRef}
          onScroll={() => {
            const el = aRef.current;
            if (el) add(`A scroll=${Math.round(el.scrollLeft)}`);
          }}
          onTouchStart={(e) => add(`A tstart x=${Math.round(e.touches[0].clientX)}`)}
          onTouchMove={(e) => add(`A tmove x=${Math.round(e.touches[0].clientX)}`)}
          onTouchEnd={() => add("A tend")}
          onTouchCancel={() => add("A TCANCEL ← inagaw ng system ang gesture!")}
          className="flex gap-3 overflow-x-auto"
        >
          <Cards />
        </div>
      </section>

      <section>
        <h2 className="font-bold mb-2">B · May snap-x snap-mandatory</h2>
        <div
          ref={bRef}
          onScroll={() => {
            const el = bRef.current;
            if (el) add(`B scroll=${Math.round(el.scrollLeft)}`);
          }}
          onTouchStart={(e) => add(`B tstart x=${Math.round(e.touches[0].clientX)}`)}
          onTouchMove={(e) => add(`B tmove x=${Math.round(e.touches[0].clientX)}`)}
          onTouchEnd={() => add("B tend")}
          onTouchCancel={() => add("B TCANCEL ← inagaw ng system ang gesture!")}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory"
        >
          {COLORS.map((c, i) => (
            <div
              key={i}
              className="shrink-0 snap-start w-[60vw] h-32 rounded-lg flex items-center justify-center text-white text-3xl font-bold"
              style={{ background: c }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-bold mb-2">C · Fade slider (parang hero — swipe handler)</h2>
        <div
          className="relative h-32 rounded-lg overflow-hidden"
          onTouchStart={onTS}
          onTouchEnd={onTE}
        >
          {COLORS.map((c, i) => (
            <div
              key={i}
              className={`absolute inset-0 flex items-center justify-center text-white text-3xl font-bold transition-opacity duration-300 ${
                i === fadeIdx ? "opacity-100" : "opacity-0"
              }`}
              style={{ background: c }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-bold mb-2">LOG (pinakabago sa taas)</h2>
        <div className="bg-black text-green-400 font-mono text-[11px] p-3 rounded-lg min-h-[220px] whitespace-pre-wrap break-all">
          {log.join("\n")}
        </div>
      </section>
    </main>
  );
}
