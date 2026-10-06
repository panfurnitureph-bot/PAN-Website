"use client";

// MADE TO ORDER, MADE HERE (2026-09-04) — kaliwa: litrato ng workshop/kama na
// may stat strip; kanan: 3-hakbang na timeline (fabric mosaic mula sa
// library + "See all 196 →" na popup, build phases, delivery areas) at
// "Talk to us on Messenger" (modal). Copy sa IMS → Website → Homepage.

import Image from "next/image";
import type { HomepageContent, LibrarySwatch } from "@/lib/products";
import { openFabrics } from "./FabricPopup";
import { openMessenger } from "./MessengerModal";

export default function MadeToOrder({ copy, swatches, fallbackImage }: { copy: HomepageContent["mto"]; swatches: LibrarySwatch[]; fallbackImage?: string }) {
  const img = copy?.image || fallbackImage || "/images/category-bed.jpg";
  const mosaic = swatches.filter((s) => s.color || s.swatch).slice(0, 24);
  const steps = copy?.steps ?? [];
  const areas = copy?.areas ?? ["Cavite", "Laguna", "Metro Manila", "Nationwide"];
  return (
    <section className="bg-cream py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-11 items-stretch">
        <div data-reveal className="relative min-h-[320px] lg:min-h-[520px] bg-sand overflow-hidden rounded-[22px] sm:rounded-[26px] shadow-[0_0_0_1px_#E4DACA,0_40px_60px_-40px_rgba(62,50,32,.7)]">
          <Image src={img} alt="Custom bed built in the PAN workshop" fill className="object-cover" sizes="(min-width: 1024px) 45vw, 100vw" />
          <div className="absolute inset-x-2.5 bottom-2.5 sm:inset-x-3.5 sm:bottom-3.5 grid grid-cols-2 sm:grid-cols-[1fr_1.3fr_1fr] rounded-[16px] overflow-hidden bg-[#2E2518]/90 backdrop-blur-md shadow-[inset_0_0_0_1px_rgba(226,194,122,.4),0_18px_30px_-18px_rgba(0,0,0,.7)] text-cream">
            {[
              ["Pieces built to order", copy?.stat?.pieces ?? "1,200+"],
              ["Own workshop", copy?.stat?.workshop ?? "San Pedro, Laguna"],
              ["Build time", copy?.stat?.build ?? "4–6 wks"],
            ].map(([l, v], i) => (
              <div key={l} className={`px-4 py-3.5 flex flex-col gap-1 ${i === 0 ? "max-sm:border-r max-sm:border-gold/20" : ""} ${i < 2 ? "sm:border-r sm:border-gold/20" : ""} ${i === 1 ? "hidden sm:flex" : ""}`}>
                <small className="text-[9.5px] font-bold tracking-[0.16em] uppercase text-[#CFC2A4]">{l}</small>
                <b className="font-cormorant text-xl font-semibold tracking-[-0.01em] text-gold whitespace-nowrap">{v}</b>
              </div>
            ))}
          </div>
        </div>

        <div data-reveal>
          <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-goldDeep">{copy?.eyebrow ?? "How made-to-order works"}</p>
          <h2 className="font-cormorant font-semibold text-[clamp(28px,3.3vw,40px)] leading-[1.05] tracking-[-0.02em] mt-2.5">{copy?.title ?? "Made to order, made here"}</h2>
          {copy?.sub && <p className="text-[15px] leading-relaxed mt-2.5 text-stone max-w-[60ch]">{copy.sub}</p>}
          <ol className="list-none m-0 mt-7 p-0 flex flex-col">
            {steps.map((s, i) => (
              <li key={i} className="relative grid grid-cols-[44px_1fr] gap-4 pb-7 last:pb-0">
                {i < steps.length - 1 && <span className="absolute left-[21px] top-11 bottom-0 w-[1.5px] bg-[linear-gradient(180deg,#B08A3E,rgba(176,138,62,.35))]" />}
                <span className="relative w-11 h-11 rounded-full bg-[linear-gradient(180deg,#5B4A2F,#33291A)] text-gold shadow-[0_0_0_1.5px_#E2C27A,0_0_0_6px_#FAF7F2,0_10px_18px_-8px_rgba(62,50,32,.6)] flex items-center justify-center font-cormorant font-bold text-[17px]">{i + 1}</span>
                <div className="flex flex-col gap-2 pt-1.5">
                  <h3 className="font-cormorant text-[19px] sm:text-[20px] font-semibold tracking-[-0.01em]">{s.title}</h3>
                  <p className="m-0 text-[14.5px] text-stone leading-relaxed max-w-[52ch]">{s.text}</p>
                  {i === 0 && (
                    <div className="flex flex-wrap gap-[7px] items-center mt-1.5">
                      {mosaic.map((sw) => (
                        <button key={sw.name} type="button" title={sw.name} aria-label={`${sw.name} — open the fabric library`} onClick={() => openFabrics(sw.name)} className="relative w-[30px] h-[30px] block rounded-lg cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-goldDeep focus-visible:ring-offset-2 shadow-[inset_0_0_0_1px_rgba(62,50,32,.18),0_2px_5px_-2px_rgba(62,50,32,.4)] overflow-hidden transition duration-150 hover:z-[1] hover:-translate-y-[3px] hover:scale-[1.12] hover:shadow-[inset_0_0_0_1px_rgba(62,50,32,.18),0_10px_16px_-8px_rgba(62,50,32,.6)]" style={{ background: sw.color ?? "#D9CFC0" }}>
                          {sw.swatch && <Image src={sw.swatch} alt="" fill className="object-cover" sizes="30px" />}
                        </button>
                      ))}
                      <button type="button" onClick={() => openFabrics()} className="h-[30px] ml-1 rounded-full bg-white px-3.5 text-[12px] font-semibold text-brownDeep shadow-[inset_0_0_0_1px_#5B4A2F] transition duration-150 hover:-translate-y-0.5 hover:bg-brownDeep hover:text-gold">See all {swatches.length} →</button>
                    </div>
                  )}
                  {i === 1 && (
                    <div className="relative grid grid-cols-3 mt-2.5 max-w-[520px] text-[12px] text-goldDeep">
                      {/* Isang tuloy na guhit na may tatlong tuldok (Joe 2026-10-07, "palitan to ng line"). */}
                      <i aria-hidden className="pf-grow absolute left-[7px] right-[7px] top-[7px] h-[1.5px] bg-goldDeep/70" />
                      {[["Frame", "Week 1–2", 100], ["Upholstery", "Week 3–4", 100], ["QC & delivery", "Week 5–6", 55]].map(([n, w, p], k) => (
                        <span key={n as string} className={`relative flex flex-col gap-1 ${k === 1 ? "items-center text-center" : k === 2 ? "items-end text-right" : ""}`}>
                          <i aria-hidden style={{ animationDelay: `${k * 0.6}s` }} className={`pf-pop block w-[15px] h-[15px] mb-2.5 rounded-full shadow-[0_0_0_1.5px_#B08A3E,0_0_0_4px_#FAF7F2] ${Number(p) < 100 ? "bg-brownDeep" : "bg-white"}`} />
                          <b className="text-ink font-semibold text-[13.5px]">{n}</b>{w}
                        </span>
                      ))}
                    </div>
                  )}
                  {i === 2 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {areas.map((a) => <span key={a} className="rounded-full bg-white shadow-[inset_0_0_0_1px_#3E3220] text-brownDeep text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5">{a}</span>)}
                      <span className="basis-full text-stone text-[12.5px] pt-1">All deliveries by our own team</span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-7">
            <button type="button" onClick={openMessenger} className="pf-dark pf-btn inline-flex items-center gap-2 h-[46px] px-6 rounded-full text-[13.5px] font-bold hover:text-gold">{copy?.messengerLabel ?? "Talk to us on Messenger"} <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg></button>
          </div>
        </div>
      </div>
    </section>
  );
}
