// SHOWROOMS + CONTACT (2026-09-04) — dalawang branch (litrato, address, oras,
// Waze / Google Maps), map card, at PH contact strip. Kapalit ng dating
// "Any questions?" (US number). Laman sa IMS → Website → Homepage.

import Image from "next/image";
import type { HomepageContent } from "@/lib/products";
import ShowroomMap from "./ShowroomMap";

function openNow(hours: string) {
  // "Mon–Sun · 9:00 AM – 7:00 PM" → bukas ba ngayon (PH time)?
  const m = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*[–-]\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i.exec(hours);
  if (!m) return null;
  const to24 = (h: string, mm: string | undefined, ap: string) => (parseInt(h, 10) % 12) + (ap.toUpperCase() === "PM" ? 12 : 0) + (mm ? parseInt(mm, 10) / 60 : 0);
  const open = to24(m[1], m[2], m[3]), close = to24(m[4], m[5], m[6]);
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  const h = now.getHours() + now.getMinutes() / 60;
  return h >= open && h < close ? `Open now · until ${m[4]}${m[5] ? ":" + m[5] : ""} ${m[6].toUpperCase()}` : `Opens ${m[1]}${m[2] ? ":" + m[2] : ""} ${m[3].toUpperCase()}`;
}

export default function Showrooms({ copy }: { copy?: HomepageContent["showrooms"] }) {
  const items = (copy?.items ?? []).filter((s) => s.name);
  if (!items.length) return null;
  const c = copy?.contact;
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-14">
      <div className="mb-7">
        <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-goldDeep">{copy?.eyebrow ?? "Showrooms"}</p>
        <h2 className="font-cormorant font-semibold text-[clamp(28px,3.3vw,40px)] leading-[1.05] tracking-[-0.02em] mt-2.5">{copy?.title ?? "Come sit on it first"}</h2>
        {copy?.sub && <p className="text-[15px] leading-relaxed mt-2.5 text-stone max-w-[60ch]">{copy.sub}</p>}
      </div>
      <div className="grid lg:grid-cols-[1.25fr_1fr] gap-4">
        <div className={`grid ${items.length > 1 ? "sm:grid-cols-2" : ""} gap-3.5`}>
          {items.map((s) => {
            const st = openNow(s.hours ?? "");
            return (
              // Premium (2026-10-07): buong litrato ang card, nakapatong ang parehong
              // pangalan, address, oras at mga link sa madilim na ibaba.
              <div key={s.name} className="relative isolate flex min-h-[380px] flex-col justify-end overflow-hidden rounded-[22px] bg-brownDeep text-cream shadow-[0_0_0_1px_rgba(62,50,32,.25),0_30px_50px_-32px_rgba(62,50,32,.8)]">
                {s.image && <Image src={s.image} alt={s.name} fill className="-z-10 object-cover" sizes="(min-width: 1024px) 30vw, 100vw" />}
                <span aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(26,20,12,.25)_0,rgba(26,20,12,0)_30%,rgba(26,20,12,.78)_62%,rgba(26,20,12,.95)_100%)]" />
                {st && <span className={`absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full backdrop-blur-sm ${st.startsWith("Open") ? "bg-[#E6F2EA]/95 text-[#2F7D4F]" : "bg-[#2E2518]/85 text-gold shadow-[inset_0_0_0_1px_rgba(226,194,122,.4)]"}`}><i aria-hidden className={`w-1.5 h-1.5 rounded-full ${st.startsWith("Open") ? "bg-[#2F7D4F]" : "bg-gold"}`} />{st}</span>}
                <div className="p-5 flex flex-col gap-2 text-[13px]">
                  <b className="font-cormorant text-[22px] leading-tight font-semibold tracking-[-0.015em] text-white">{s.name}</b>
                  {s.address && <span className="text-[#E3D8C2] leading-relaxed">{s.address}</span>}
                  {s.hours && <span className="flex items-center gap-2 font-semibold text-white"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="shrink-0 text-gold" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>{s.hours}</span>}
                  <div className="flex gap-2 mt-2.5 flex-wrap">
                    {s.waze && <a href={s.waze} target="_blank" rel="noopener noreferrer" className="inline-flex items-center h-10 px-5 rounded-full text-[12.5px] font-bold text-white bg-white/10 backdrop-blur-sm shadow-[inset_0_0_0_1px_rgba(255,255,255,.4)] transition-colors hover:bg-white/20">Waze</a>}
                    {s.maps && <a href={s.maps} target="_blank" rel="noopener noreferrer" className="pf-gold inline-flex items-center h-10 px-5 rounded-full text-[12.5px] font-bold">Google Maps</a>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Totoong Google Maps embed, awtomatiko mula sa link/address ng branch. */}
        <ShowroomMap items={items.map((s) => ({ name: s.name, address: s.address, maps: s.maps, waze: s.waze }))} />
      </div>
      {c && (
        <div className={`grid sm:grid-cols-2 ${c.phone && c.email ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-3.5 mt-4`}>
          {c.phone && <div className="pf-card px-4 py-4 text-[12.5px] text-stone flex items-center gap-3.5"><i aria-hidden className="grid place-items-center w-11 h-11 shrink-0 rounded-full bg-[#F3E7C9] text-brownDeep shadow-[inset_0_0_0_1px_rgba(176,138,62,.35)]"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" /></svg></i><span className="flex min-w-0 flex-col gap-0.5"><b className="text-ink text-[15px] font-semibold">{c.phone}</b><span>{c.phoneHours}</span></span></div>}
          <div className="pf-card px-4 py-4 text-[12.5px] text-stone flex items-center gap-3.5"><i aria-hidden className="grid place-items-center w-11 h-11 shrink-0 rounded-full bg-[#F3E7C9] text-brownDeep shadow-[inset_0_0_0_1px_rgba(176,138,62,.35)]"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16v11H9l-5 4z" /></svg></i><span className="flex min-w-0 flex-col gap-0.5"><b className="text-ink text-[15px] font-semibold">Messenger</b><span>{c.messengerNote}</span></span></div>
          {c.email && <div className="pf-card px-4 py-4 text-[12.5px] text-stone flex items-center gap-3.5"><i aria-hidden className="grid place-items-center w-11 h-11 shrink-0 rounded-full bg-[#F3E7C9] text-brownDeep shadow-[inset_0_0_0_1px_rgba(176,138,62,.35)]"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg></i><span className="flex min-w-0 flex-col gap-0.5"><b className="text-ink text-[15px] font-semibold break-all">{c.email}</b><span>{c.emailNote}</span></span></div>}
          <div className="pf-card px-4 py-4 text-[12.5px] text-stone flex items-center gap-3.5"><i aria-hidden className="grid place-items-center w-11 h-11 shrink-0 rounded-full bg-[#F3E7C9] text-brownDeep shadow-[inset_0_0_0_1px_rgba(176,138,62,.35)]"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></svg></i><span className="flex min-w-0 flex-col gap-0.5"><b className="text-ink text-[15px] font-semibold">Delivery</b><span>{c.deliveryNote}</span></span></div>
        </div>
      )}
    </section>
  );
}
