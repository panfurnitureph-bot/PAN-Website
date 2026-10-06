// FOOTER (2026-09-04, pinayat) — brand + tagline + contact, Shop (grupo, hindi
// bawat category), Help. Tanggal ang Company/Account columns (walang page ang
// About/Careers; Cart at Quotation ay nasa header). Socials + payment sa bar.
//
// PREMIUM (Joe 2026-10-07, ang footer ng mockup): gintong seal na logo, contact
// na may icon kada linya, Shop at Help na column, Showrooms na column mula sa
// IMS (pangalan, address, DIRECTIONS na link, "Both open …" na oras), at ang
// bar sa ibaba: ©, "WE ACCEPT" na chip (GCash, Maya, BDO, BPI, Cash), socials
// bilang bilog, at "back to top". Parehong mga link.

import Link from "next/link";
import { contactLinks, homepage, type SiteContent } from "@/lib/products";

const SHOP = [
  { label: "Beds & Mattress", href: "/collections/beds" },
  { label: "Sofas", href: "/collections/sofas" },
  { label: "Dining", href: "/collections/dining" },
  { label: "Living", href: "/collections/living" },
  { label: "Made to order", href: "/collections/customized-bed" },
];
const HELP = [
  { label: "FAQs", href: "/faqs" },
  { label: "Shipping, returns and warranty", href: "/shipping" },
  { label: "Track my delivery", href: "/track" },
  { label: "Measuring guide", href: "/measuring" },
  { label: "Wishlist", href: "/wishlist" },
];
const I = (d: string, extra = "") => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={`mt-[3px] shrink-0 text-gold/80 ${extra}`} aria-hidden><path d={d} /></svg>
);
const ARROW = <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
const SOCIAL: Record<string, string> = {
  facebook: "M14 8h2.5V5H14c-2.2 0-3.5 1.4-3.5 3.5V10H8v3h2.5v7h3v-7H16l.5-3h-3V8.8c0-.5.2-.8.5-.8z",
  instagram: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5.5-1.5h.01",
  tiktok: "M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5M14 4c0 2.5 2 4.5 4.5 4.5",
  youtube: "M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm6 1.5v5l4.5-2.5z",
};

export default function Footer({ site }: { site: SiteContent; shop?: { label: string; href: string }[] }) {
  const cl = contactLinks(site);
  const social = Object.entries((site as unknown as { social?: Record<string, string> }).social ?? {}).filter(([, u]) => u && !/facebook\.com\/?$/.test(u));
  // Showrooms mula sa IMS → Website → Homepage → Showrooms (parehong pinagmumulan ng Home).
  const rooms = (homepage.showrooms?.items ?? []).filter((s) => s.name);
  const hours = rooms.find((s) => s.hours)?.hours;
  const allSame = rooms.length > 0 && rooms.every((s) => (s.hours ?? "") === (hours ?? ""));
  const care = (site.contact as { hours?: string }).hours;
  return (
    <footer className="relative text-cream bg-[radial-gradient(900px_380px_at_8%_-10%,rgba(226,194,122,.14),transparent_70%),linear-gradient(180deg,#3A2E1D,#241B11)]">
      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(226,194,122,.7)_25%,rgba(226,194,122,.7)_75%,transparent)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-6">
        <div className={`grid gap-8 sm:grid-cols-2 ${rooms.length ? "lg:grid-cols-[1.35fr_.8fr_1fr_1.45fr]" : "lg:grid-cols-[1.6fr_1fr_1fr]"} text-[13px]`}>
          <div>
            <Link href="/" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/pan-seal.png" alt="" className="h-11 w-11 rounded-full bg-brown object-contain shadow-[0_0_0_1.5px_#E2C27A]" />
              <span className="font-cormorant font-semibold tracking-[0.3em] text-lg">{site.brand.name.toUpperCase()}</span>
            </Link>
            <p className="text-[13px] leading-relaxed text-[#D8CBB0] max-w-[34ch] mt-3.5">Made to order in San Pedro, Laguna. Delivered and set up by our own team.</p>
            <ul className="list-none m-0 p-0 mt-4 text-[13px] text-[#E9DDC4] grid gap-2">
              <li className="flex items-start gap-2.5">{I("M4 5h16v11H9l-5 4z")}<span className="border-b border-gold/40 pb-px">Messenger · replies within the hour</span></li>
              {cl.whatsapp && <li className="flex items-start gap-2.5">{I("M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z")}<span>WhatsApp{cl.viber ? " and Viber" : ""} · <a href={cl.whatsappHref} target="_blank" rel="noopener noreferrer" className="hover:text-gold">{cl.whatsapp}</a></span></li>}
              {!cl.whatsapp && cl.viber && <li className="flex items-start gap-2.5">{I("M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z")}<a href={cl.viberHref} className="hover:text-gold">Viber · {cl.viber}</a></li>}
              <li className="flex items-start gap-2.5">{I("M3 7l9 6 9-6M3 5h18v14H3z")}<a href={`mailto:${site.contact.email}`} className="hover:text-gold break-all">{site.contact.email}</a></li>
              {cl.email2 && <li className="flex items-start gap-2.5">{I("M3 7l9 6 9-6M3 5h18v14H3z")}<a href={`mailto:${cl.email2}`} className="hover:text-gold break-all">{cl.email2}</a></li>}
              {care && <li className="flex items-start gap-2.5">{I("M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z")}<span>Customer care · {care}</span></li>}
            </ul>
          </div>
          <div>
            <h4 className="m-0 mb-3 text-[10.5px] font-bold tracking-[0.18em] uppercase text-gold">Shop</h4>
            <ul className="list-none m-0 p-0 grid gap-2 text-[#EFE4CC]">{SHOP.map((l) => <li key={l.href}><Link href={l.href} className="inline-block transition hover:translate-x-0.5 hover:text-gold">{l.label}</Link></li>)}</ul>
          </div>
          <div>
            <h4 className="m-0 mb-3 text-[10.5px] font-bold tracking-[0.18em] uppercase text-gold">Help</h4>
            <ul className="list-none m-0 p-0 grid gap-2 text-[#EFE4CC]">{HELP.map((l) => <li key={l.href}><Link href={l.href} className="inline-block transition hover:translate-x-0.5 hover:text-gold">{l.label}</Link></li>)}</ul>
          </div>
          {rooms.length > 0 && (
            <div className="sm:col-span-2 lg:col-span-1">
              <h4 className="m-0 mb-3 text-[10.5px] font-bold tracking-[0.18em] uppercase text-gold">Showrooms</h4>
              <ul className="list-none m-0 p-0 divide-y divide-gold/[.18]">
                {rooms.map((s) => (
                  <li key={s.name} className="py-2.5 first:pt-0">
                    <div className="flex items-start justify-between gap-3">
                      <b className="text-[13.5px] font-semibold text-[#F7EEDC]">{s.name}</b>
                      {(s.maps || s.waze) && <a href={s.maps || s.waze} target="_blank" rel="noopener noreferrer" className="group inline-flex shrink-0 items-center gap-1.5 text-[10.5px] font-bold tracking-[0.16em] uppercase text-gold hover:text-[#F3DDA4]">Directions <span className="transition-transform group-hover:translate-x-0.5">{ARROW}</span></a>}
                    </div>
                    {s.address && <p className="m-0 mt-1 text-[12.5px] leading-relaxed text-[#CFC2A4]">{s.address}</p>}
                    {!allSame && s.hours && <p className="m-0 mt-1 text-[12px] text-[#CFC2A4]">{s.hours}</p>}
                  </li>
                ))}
              </ul>
              {allSame && hours && <p className="m-0 mt-2.5 flex items-center gap-2 text-[12.5px] text-[#D8CBB0]">{I("M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "mt-0")}{rooms.length > 1 ? "Both open" : "Open"} {hours}</p>}
            </div>
          )}
        </div>

        <div className="mt-9 pt-4 border-t border-gold/[.18] flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-[12px] text-[#CFC2A4]">
          <span>© {new Date().getFullYear()} {site.brand.name} · All rights reserved</span>
          <span className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[10px] font-bold tracking-[0.16em] uppercase text-gold/80">We accept</span>
            {["GCash", "Maya", "BDO", "BPI", "Cash"].map((p) => <span key={p} className="inline-flex h-7 items-center rounded-full px-2.5 text-[11.5px] font-semibold text-[#F4EAD8] shadow-[inset_0_0_0_1px_rgba(226,194,122,.4)]">{p}</span>)}
          </span>
          <span className="flex items-center gap-2">
            {social.map(([n, u]) => (
              <a key={n} href={u} target="_blank" rel="noopener noreferrer" aria-label={n} title={n} className="grid h-8 w-8 place-items-center rounded-full text-[#EFE4CC] shadow-[inset_0_0_0_1px_rgba(226,194,122,.38)] transition hover:bg-gold hover:text-brownDeep">
                {SOCIAL[n] ? <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={SOCIAL[n]} /></svg> : <span className="text-[10px] font-bold uppercase">{n.slice(0, 2)}</span>}
              </a>
            ))}
            <a href="#top" aria-label="Back to top" className="grid h-8 w-8 place-items-center rounded-full text-[#EFE4CC] shadow-[inset_0_0_0_1px_rgba(226,194,122,.38)] transition hover:bg-gold hover:text-brownDeep">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 19V5M6 11l6-6 6 6" /></svg>
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
