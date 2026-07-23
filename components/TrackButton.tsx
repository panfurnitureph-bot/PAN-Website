"use client";

// Bilog na "Track order" na icon-button — nasa gilid, sa itaas ng chat bubble.
// Pag-click: bumubukas ang order tracker sa isang pop-up (hindi bagong page).
//
// Ang iframe ay LAGING naka-mount (nakatago habang sarado) kaya nauuna nang
// ma-load — instant ang unang buksan, walang 1-3 segundong antay.

import { useEffect, useRef, useState } from "react";

export default function TrackButton() {
  const [open, setOpen] = useState(false);
  // Taas ng laman ng tracker, iniuulat ng iframe (postMessage) — para sakto
  // lang ang modal sa form, at hahaba lang kapag may resulta na. Ang default
  // (~500) ay malapit sa taas ng form kaya buo agad ang unang labas, walang
  // reflow mula sa maliit.
  const [height, setHeight] = useState(500);
  const frameRef = useRef<HTMLIFrameElement>(null);

  function reset() {
    // Sabihan ang tracker na ibalik sa form — client-side, INSTANT (walang
    // reload). Nakikinig ang track page sa "track-reset".
    setHeight(500);
    frameRef.current?.contentWindow?.postMessage({ type: "track-reset" }, "*");
  }

  function openModal() {
    reset(); // linisin ang naiwang resulta agad
    setOpen(true);
  }

  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.data?.type === "track-height" && typeof e.data.height === "number") {
        setHeight(Math.max(e.data.height, 240));
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  // Escape para isara; harangin ang scroll sa likod at itago ang ibang
  // lumulutang na buton habang bukas.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    document.documentElement.setAttribute("data-track-open", "1");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.documentElement.removeAttribute("data-track-open");
      // Pagsara, ibalik agad ang tracker sa form sa background — kaya instant
      // na ang susunod na buksan.
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <button
        onClick={openModal}
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

      {/* Modal shell — laging naka-render kaya naka-load na ang iframe;
          ipinapakita lang kapag bukas. */}
      <div
        className={`fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 ${
          open ? "" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-ink/70 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <div className="relative bg-cream w-full max-w-lg rounded-xl shadow-2xl overflow-hidden max-h-[90vh]">
          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 text-ink shadow flex items-center justify-center text-xl leading-none hover:bg-white"
          >
            ×
          </button>
          <div className="overflow-y-auto max-h-[90vh]">
            <iframe
              ref={frameRef}
              src="/track?embed=1"
              title="Order tracker"
              className="w-full border-0 block transition-[height] duration-200"
              style={{ height }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
