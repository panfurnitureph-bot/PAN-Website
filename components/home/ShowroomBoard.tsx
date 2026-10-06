"use client";

// SHOWROOM BOARD (Joe 2026-10-07, "gawin mo ung format na nasa artifact") —
// ang mga card ng branch, ang mapa at ang contact tiles sa iisang client
// component para magkaugnay ang card at ang mapa: itapat ang mouse (o i-tap)
// ang isang branch = iyon ang ipinapakita ng mapa, at may gintong singsing ang
// card ng branch na nasa mapa. Parehong laman ng dati (pangalan, address,
// oras, Waze / Google Maps, contact notes) — galing pa rin sa IMS → Website →
// Homepage → Showrooms; ang "Open now" ay kinukuwenta pa rin sa server.

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import ShowroomMap from "./ShowroomMap";
import { openMessenger } from "./MessengerModal";

export type ShowroomItem = { name: string; address?: string; hours?: string; image?: string; waze?: string; maps?: string; st: string | null };
type Contact = { phone?: string; phoneHours?: string; messengerNote?: string; email?: string; emailNote?: string; deliveryNote?: string };

// "…, Carmona, Cavite" → "Carmona, Cavite" (huling dalawang bahagi ng parehong address)
const town = (addr?: string) => (addr ?? "").split(",").map((x) => x.trim()).filter(Boolean).slice(-2).join(", ");

const icon = (d: JSX.Element) => (
  <i aria-hidden className="grid place-items-center w-11 h-11 shrink-0 rounded-full bg-[linear-gradient(180deg,#F8EFD8,#F1E3BF)] text-brownDeep shadow-[inset_0_0_0_1px_rgba(176,138,62,.3)]">
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
  </i>
);
const TILE = "pf-card flex items-center gap-3.5 px-[18px] py-4 text-left text-[12.5px] text-stone transition duration-200 hover:-translate-y-[3px] hover:shadow-[0_0_0_1px_rgba(176,138,62,.6),0_18px_30px_-22px_rgba(62,50,32,.5)]";
const body = (title: string, note?: string) => (
  <span className="flex min-w-0 flex-col gap-0.5"><b className="text-ink text-[14.5px] font-semibold truncate">{title}</b><span className="leading-snug">{note}</span></span>
);

export default function ShowroomBoard({ items, contact: c }: { items: ShowroomItem[]; contact?: Contact }) {
  const [i, setI] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Sandaling antala bago lumipat ang mapa, para hindi ito mag-reload sa bawat daan ng mouse.
  const point = (k: number) => { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setI(k), 180); };
  const leave = () => { if (timer.current) clearTimeout(timer.current); };
  const tiles = c ? [c.phone, "m", c.email, "d"].filter(Boolean).length : 0;

  return (
    <>
      <div className="grid lg:grid-cols-[1.25fr_1fr] gap-4">
        <div data-reveal data-stagger className={`grid ${items.length > 1 ? "sm:grid-cols-2" : ""} gap-4`}>
          {items.map((s, k) => {
            const open = !!s.st?.startsWith("Open now"); // "Opens 10:00 AM" = sarado pa (gintong tuldok)
            return (
              <article key={s.name} onMouseEnter={() => point(k)} onMouseLeave={leave} className="group relative isolate flex min-h-[380px] lg:min-h-[440px] items-end overflow-hidden rounded-[22px] bg-brownDeep text-white shadow-[0_22px_44px_-26px_rgba(42,33,22,.75)] transition duration-300 ease-out hover:-translate-y-[5px] hover:shadow-[0_34px_56px_-28px_rgba(42,33,22,.85)]">
                {s.image && <Image src={s.image} alt={s.name} fill className="-z-20 object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.07]" sizes="(min-width: 1024px) 30vw, 100vw" />}
                <span aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(20,14,6,.28)_0,rgba(20,14,6,0)_22%,rgba(20,14,6,.1)_40%,rgba(20,14,6,.78)_68%,rgba(20,14,6,.96)_100%)]" />
                {/* gintong singsing = ito ang branch na nasa mapa */}
                <span aria-hidden className={`pointer-events-none absolute inset-0 rounded-[22px] transition-shadow duration-300 ${items.length > 1 && k === i ? "shadow-[inset_0_0_0_2px_#E2C27A,inset_0_0_0_6px_rgba(226,194,122,.16)]" : "shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)]"}`} />
                {s.st && (
                  <span className="absolute left-4 top-4 inline-flex items-center gap-2 h-[30px] px-3.5 rounded-full bg-[rgba(20,14,6,.5)] backdrop-blur-md shadow-[inset_0_0_0_1px_rgba(255,255,255,.22)] text-[10.5px] font-bold tracking-[0.1em] uppercase">
                    <i aria-hidden className={`w-[7px] h-[7px] rounded-full ${open ? "bg-[#6FD39A] pf-ping" : "bg-gold"}`} />{s.st}
                  </span>
                )}
                <span aria-hidden className="absolute right-[18px] top-3 font-cormorant font-semibold text-[34px] leading-none tracking-[-0.02em] text-white/90 [text-shadow:0_2px_12px_rgba(20,14,6,.5)]">{String(k + 1).padStart(2, "0")}</span>
                <div className="flex w-full flex-col gap-1.5 px-5 pb-5 pt-6 sm:px-[22px]">
                  {town(s.address) && <small className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-gold">{town(s.address)}</small>}
                  <b className="font-cormorant text-[22px] sm:text-2xl leading-[1.15] font-semibold tracking-[-0.015em] [text-wrap:balance]">{s.name}</b>
                  {s.address && <p className="m-0 mt-0.5 text-[13px] leading-normal text-white/80">{s.address}</p>}
                  {s.hours && <span className="mt-1 inline-flex items-center gap-2 text-[12.5px] font-semibold"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="shrink-0 text-gold" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>{s.hours}</span>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {s.maps && (
                      <a href={s.maps} target="_blank" rel="noopener noreferrer" className="pf-gold pf-btn inline-flex items-center gap-2 h-[42px] px-[18px] rounded-full text-[12.5px] font-bold">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>Google Maps
                      </a>
                    )}
                    {s.waze && <a href={s.waze} target="_blank" rel="noopener noreferrer" className="pf-btn inline-flex items-center h-[42px] px-[18px] rounded-full text-[12.5px] font-bold text-white bg-white/10 backdrop-blur-sm shadow-[inset_0_0_0_1px_rgba(255,255,255,.4)] hover:bg-white/[.22]">Waze</a>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {/* Totoong Google Maps embed, awtomatiko mula sa link/address ng branch. */}
        <ShowroomMap items={items.map((s) => ({ name: s.name, address: s.address, maps: s.maps, waze: s.waze }))} index={i} onIndex={setI} />
      </div>
      {c && (
        <div data-reveal data-stagger className={`grid sm:grid-cols-2 ${tiles >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-3.5 mt-4`}>
          {c.phone && <a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`} className={TILE}>{icon(<path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" />)}{body(c.phone, c.phoneHours)}</a>}
          <button type="button" onClick={openMessenger} className={TILE}>{icon(<path d="M4 5h16v11H9l-5 4z" />)}{body("Messenger", c.messengerNote)}</button>
          {c.email && <a href={`mailto:${c.email}`} className={TILE}>{icon(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>)}{body(c.email, c.emailNote)}</a>}
          <Link href="/shipping" className={TILE}>{icon(<><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></>)}{body("Delivery", c.deliveryNote)}</Link>
        </div>
      )}
    </>
  );
}
