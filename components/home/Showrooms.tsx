// SHOWROOMS + CONTACT (2026-09-04) — dalawang branch (litrato, address, oras,
// Waze / Google Maps), map card, at PH contact strip. Kapalit ng dating
// "Any questions?" (US number). Laman sa IMS → Website → Homepage.

import type { HomepageContent } from "@/lib/products";
import ShowroomBoard from "./ShowroomBoard";

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
      <ShowroomBoard
        items={items.map((s) => ({ name: s.name, address: s.address, hours: s.hours, image: s.image, waze: s.waze, maps: s.maps, st: openNow(s.hours ?? "") }))}
        contact={c}
      />
    </section>
  );
}
