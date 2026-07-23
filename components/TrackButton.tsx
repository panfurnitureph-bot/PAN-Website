"use client";

// Bilog na "Track order" na icon-button — nasa gilid, sa itaas ng chat bubble.
// Pag-click: bumubukas ang order tracker sa isang pop-up (hindi bagong page).

import { useEffect, useState } from "react";

export default function TrackButton() {
  const [open, setOpen] = useState(false);
  // Taas ng laman ng tracker, iniuulat ng iframe (postMessage) — para sakto
  // lang ang modal sa form, at hahaba lang kapag may resulta na.
  const [height, setHeight] = useState(420);

  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.data?.type === "track-height" && typeof e.data.height === "number") {
        // Buong taas ng laman — hindi kina-cap dito. Ang modal container ang
        // magli-limit sa 90vh at magsi-scroll kapag mas mahaba (tingnan sa ibaba).
        setHeight(Math.max(e.data.height, 240));
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  // Escape para isara; harangin ang scroll sa likod habang bukas.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // Itago ang ibang lumulutang na buton (chat, scroll-top) habang bukas ang
    // pop-up — para hindi sila sumilip sa ilalim ng modal.
    document.documentElement.setAttribute("data-track-open", "1");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.documentElement.removeAttribute("data-track-open");
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
          {/* Wrapper: hanggang 90vh lang. Ang X ay nakadikit sa sulok; ang laman
              ang nagsi-scroll sa loob kapag mas mahaba kaysa 90vh — kaya hindi
              maputol ang mahabang resulta. */}
          <div className="relative bg-cream w-full max-w-lg rounded-xl shadow-2xl overflow-hidden max-h-[90vh]">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 text-ink shadow flex items-center justify-center text-xl leading-none hover:bg-white"
            >
              ×
            </button>
            <div className="overflow-y-auto max-h-[90vh]">
              {/* Ang iframe ay kasing-taas ng buong laman; ang div na ito ang
                  nagsi-scroll, hindi ang iframe mismo. */}
              <iframe
                src="/track?embed=1"
                title="Order tracker"
                className="w-full border-0 block"
                style={{ height }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
