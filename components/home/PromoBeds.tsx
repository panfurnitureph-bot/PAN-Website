"use client";

// PROMO BEDS (2026-09-04) — brown band: isang malaking featured bed (presyo
// kada size mula sa bedSizes ng Configurator, kulay) + 2×2 ng iba pang promo
// bed. Pinagmumulan: published na Promo Bed na produkto. Ang IMS → Website
// Content → Promo Beds ay may (1) featured photo override, (2) bed cards na
// litrato na pumapalit sa product photo kapag magkapareho ang pangalan, at
// (3) fallback na laman habang wala pang published na kama. Nakatago kapag
// wala pareho.

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatPrice, CATEGORY_TILES, type HomepageContent, type Product } from "@/lib/products";
import FitImage from "@/components/FitImage";
import { useSubjectBoxes } from "@/lib/subject-box";

type Card = { name?: string; price?: string; image?: string; sizes?: string; colors?: string; sizeList?: { size: string; price: string }[]; colorList?: { name: string; image?: string; focus?: string; hex?: string }[] };
type Tile = { key: string; name: string; href: string; image: string; from: number; sizes: { size: string; price: number }[]; colors: { name: string; hex?: string; swatch?: string; focus?: string }[]; feat: string; fabric: string };

// TAMPOK AT TELA NG KAMA (Joe 2026-10-07, "ETO" — dapat kapareho ng mockup ang
// "2 built-in drawers" at "Beige"): binabasa mula sa NAKA-SAVE NA SPECS ng
// produkto sa IMS (ang `dimensions` na text, hal.
//   Promo Bed — With Add-ons / Size: … / Fabric: Beige / Drawers: 2 built-in drawers — Left / Legs: Standard).
// Walang inimbento: ang tela ay ang "Fabric" na linya; ang tampok ay ang mga
// linyang add-on (lahat maliban sa Size, Headboard Height, Fabric at Legs); kapag
// walang add-on, ang nasa unang linya pagkatapos ng gatlang (hal. "Knockdown
// (no add-ons)"). Walang specs = walang linya, gaya ng dati.
function specOf(text: string): { feat: string; fabric: string } {
  const lines = (text || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const pair = (l: string) => /^([^:]{1,40}):\s*(.+)$/.exec(l);
  const head = lines.find((l) => !pair(l)) ?? "";
  const pairs = lines.map(pair).filter((m): m is RegExpExecArray => !!m).map((m) => [m[1].trim(), m[2].trim()] as const);
  const times = (s: string) => s.replace(/(\d)\s*x\s*(\d)/gi, "$1×$2");
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  const fabric = pairs.find(([k]) => /^fabric$/i.test(k))?.[1] ?? "";
  const feats = pairs.filter(([k]) => !/^(size|sizes|headboard height|fabric|legs|model)$/i.test(k)).map(([k, v]) => {
    const [main, ...rest] = v.split(/\s+[—–-]\s+/);
    if (/^yes$/i.test(main)) return cap(k) + (rest.length ? `, ${rest.join(", ").toLowerCase()}` : "");
    // "Drawers: 2 built-in drawers" — nasa halaga na ang pangalan, huwag ulitin
    if (main.toLowerCase().includes(k.toLowerCase().split(" ")[0].replace(/s$/, ""))) return times(main);
    return `${cap(k)} ${times(main)}`;
  });
  const tail = head.split(/\s+[—–]\s+/).slice(1).join(" ");
  const fallback = tail && !/^with add-?ons$/i.test(tail) ? cap(tail.replace(/\s*\(([^)]+)\)/, ", $1")) : "";
  return { fabric, feat: feats.length ? feats.join(" · ") : fallback };
}

// LITRATO SA STUDIO — gaya ng FitImage (sinusukat ang kama sa litrato para
// pare-pareho ang laki), pero NAKATAYO SA SAHIG: ang ilalim ng kama ay laging
// nasa parehong linya (`floor`) kung saan naroon ang anino, kaya walang kamang
// lumulutang kahit iba-iba ang hugis at puting margin ng litrato. Ang kahon ay
// PARISUKAT (iyon ang batayan ng lib/subject-box); ang kama ay maaaring lumampas
// nang kaunti sa gilid nito (`w` > 100) dahil ang studio ang pumuputol, hindi
// ang kahon. Walang sukat (CORS, sirang file) = buong litrato, contain.
function StagePhoto({ src, alt, on, priority, w = 80, floor = 84, ceil = 15 }: { src: string; alt: string; on: boolean; priority?: boolean; w?: number; floor?: number; ceil?: number }) {
  const [box] = useSubjectBoxes([src]);
  let style: React.CSSProperties | undefined;
  if (box) {
    const bw = box.r - box.l, bh = box.b - box.t; // % ng parisukat
    const s = Math.min(2.4, w / Math.max(bw, 1), (floor - ceil) / Math.max(bh, 1));
    const cx = (box.l + box.r) / 2;
    style = { transform: `translate(${(50 - cx * s).toFixed(2)}%, ${(floor - box.b * s).toFixed(2)}%) scale(${s.toFixed(3)})`, transformOrigin: "0 0" };
  }
  // Pagpasok (pf-bedin: kupas + angat + lumaki) tuwing ito ang napili, at zoom
  // na 1.03 kapag tinapat ang mouse sa studio (`scale` na hiwalay na property,
  // hindi `transform`, kaya hindi nabubura ang pagtayo sa sahig). Nasa litrato
  // mismo ang galaw, hindi sa balot, para hindi masira ang multiply.
  return <Image src={src} alt={alt} fill priority={priority} className={`object-contain mix-blend-multiply transition-[opacity,scale,translate] duration-700 ease-out group-hover:[scale:1.03] group-hover:[translate:-1.5%_-1.5%] ${on ? "opacity-100 pf-bedin" : "opacity-0"}`} style={style} sizes="(min-width: 1024px) 45vw, 100vw" />;
}

const num = (s: string) => Number(String(s).replace(/[^\d.]/g, "")) || 0;
const norm = (s: string) => s.trim().toLowerCase();
// Pinakamababang presyo sa listahan (0 kapag walang laman) — "from ₱…".
const minOf = (ns: number[]) => { const ps = ns.filter((n) => n > 0); return ps.length ? Math.min(...ps) : 0; };

export default function PromoBeds({ products, copy }: { products: Product[]; copy?: HomepageContent["promoBeds"] }) {
  // Aling kama ang nasa entablado (0 = featured). Itsura lang: hindi nito
  // binabago kung aling mga kama ang nakalista o saan pumupunta ang link.
  const [sel, setSel] = useState(0);
  const stage = useRef<HTMLAnchorElement>(null);
  const touch = useRef(false);
  // Napili na ba ang tab NOONG dumampi ang daliri? Ang focus ay nauuna sa click at
  // pumipili na ng tab, kaya kung sa click pa lang titingnan ay laging "napili na"
  // at ang unang tap ay dumidiretso sa product page.
  const armed = useRef(false);
  // KUSANG LIPAT (gaya ng mockup): kada 5 segundo ang susunod na kama, habang
  // nasa screen ang section, hindi tinututukan ng mouse, at hindi pa pumipili
  // ang bisita gamit ang daliri o keyboard. Walang lipat kapag reduced motion.
  const band = useRef<HTMLElement>(null);
  const [hover, setHover] = useState(false);
  const [seen, setSeen] = useState(false);
  const [manual, setManual] = useState(false);
  const [calm, setCalm] = useState(true);
  useEffect(() => {
    setCalm(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = band.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((es) => setSeen(es[0].isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const cards: Card[] = ((copy as { cards?: Card[] } | undefined)?.cards ?? []).filter((c) => c && (c.name || c.image));
  const photoFor = (name: string) => cards.find((c) => norm(c.name ?? "") === norm(name))?.image || "";
  const beds = products.filter((p) => p.category === "bed");

  let tiles: Tile[];
  if (beds.length) {
    tiles = beds.map((b) => ({
      key: b.slug, name: b.name, href: `/products/${b.slug}`,
      image: photoFor(b.name) || b.images[0] || "/images/placeholder.jpg",
      from: b.priceFrom ?? b.price,
      sizes: (b.bedSizes ?? []).filter((s) => s.enabled !== false && (s.price ?? 0) > 0).map((s) => ({ size: s.size, price: s.price! })),
      colors: (b.colorSwatches ?? []).length ? b.colorSwatches!.map((c) => ({ name: c.name, hex: c.hex, swatch: c.image || c.swatch })) : b.colors.map((c) => ({ name: c })),
      ...specOf(b.dimensions || (b as { mtoReadySpecs?: string }).mtoReadySpecs || ""),
    }));
    const fs = (copy as { featuredSlug?: string } | undefined)?.featuredSlug;
    const fi = Math.max(0, tiles.findIndex((t) => t.key === fs || (fs === "" && beds.find((b) => b.slug === t.key)?.featured)));
    if (fi > 0) tiles.unshift(...tiles.splice(fi, 1));
  } else {
    // Fallback: cards mula sa IMS habang wala pang published na Promo Bed.
    // Litrato lang ang kailangan; ang walang pangalan ay "Promo Bed n".
    tiles = cards.filter((c) => c.image || c.name).map((c, i) => ({
      key: `card-${i}`, name: c.name || `Promo Bed ${i + 1}`, href: "/collections/bed", image: c.image || "/images/placeholder.jpg", from: num(c.price ?? "") || minOf((c.sizeList ?? []).map((s) => num(s.price))),
      // Hiwalay na field kada size/kulay (sizeList/colorList); ang lumang
      // "Single 18799 · …" na text ay binabasa pa rin.
      sizes: (c.sizeList?.length ? c.sizeList.map((s) => ({ size: s.size, price: num(s.price) })) : (c.sizes ?? "").split("·").map((s) => s.trim()).filter(Boolean).map((s) => { const m = /^(.+?)\s+([\d,.]+)$/.exec(s); return m ? { size: m[1], price: num(m[2]) } : { size: s, price: 0 }; })).filter((s) => s.price > 0),
      colors: c.colorList?.length ? c.colorList.filter((x) => x.name || x.image).map((x, k) => ({ name: x.name || `Color ${k + 1}`, hex: x.hex, swatch: x.image, focus: x.focus })) : (c.colors ?? "").split("·").map((s) => s.trim()).filter(Boolean).map((n) => ({ name: n })),
      feat: "", fabric: "",
    }));
  }
  const count = Math.min(tiles.length, 5);
  const run = seen && !hover && !manual && !calm && count > 1;
  useEffect(() => {
    if (!run) return;
    const t = setTimeout(() => setSel((k) => (k + 1) % count), 5000);
    return () => clearTimeout(t);
  }, [run, sel, count]);
  if (!tiles.length) return null;

  const featured = tiles[0];
  const featuredImage = (copy as { featuredImage?: string } | undefined)?.featuredImage || featured.image;
  const rest = tiles.slice(1, 5);
  const minPrice = Math.min(...tiles.map((t) => t.from).filter((n) => n > 0));
  const foot = copy?.foot?.length ? copy.foot : ["30% downpayment to start", "4–6 weeks build to delivery", "6-month warranty on frame, foam and workmanship"];

  // SHOWCASE (Joe 2026-10-07: "5 · Showcase" sa mockup, na may bagong mga
  // button) — madilim na band, dalawang hanay: sa KALIWA ang kama mag-isa sa
  // matangkad na maliwanag na studio (maliit na selyo ng bilang sa sulok, anino
  // sa sahig); sa KANAN ang salaming panel na may eyebrow, pamagat, sub, ang
  // cream na card ng napiling kama (pangalan, tampok, chips, "Build this bed" na
  // madilim na bar na may gintong kislap sa hover) at ang apat na kama bilang
  // patayong listahan (thumbnail, pangalan, tampok, tuldok). Sa ilalim ang foot
  // lines at ang "See all promo beds" na outlined na pill. Parehong mga kama,
  // link at laman ng dati (pangalan, sizes na may presyo, "from", mga kulay).
  // Itapat ang mouse sa hilera = iyon ang nasa studio; sa telepono ang unang tap
  // ay pumipili at ang pangalawa ang nagbubukas. BABALA SA BLEND: walang
  // transform o opacity sa balot ng litrato sa pagitan nito at ng studio.
  const title = copy?.title || (Number.isFinite(minPrice) ? `Promo beds from ${formatPrice(minPrice)}` : "Promo beds");
  const list = [featured, ...rest];
  const cur = list[sel] ?? featured;
  const photo = (t: Tile) => (t === featured ? featuredImage : t.image);
  // "Promo bed 1: Full double 54x75" → pamagat + sukat (parehong teksto, hinati lang).
  const split = (name: string) => { const m = /^(.*?)\s*:\s*(.+)$/.exec(name); return m ? { title: m[1], size: m[2].replace(/(\d)\s*x\s*(\d)/gi, "$1×$2") } : { title: name, size: "" }; };
  const noteOf = (t: Tile) => [split(t.name).size, ...t.colors.slice(0, 2).map((c) => c.name)].filter(Boolean).join(" · ");
  const label = CATEGORY_TILES.find((t) => t.slug === "bed")?.label ?? "Promo Bed";
  const factIcon = (f: string) =>
    /warrant/i.test(f) ? <><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z" /><path d="m9 12 2 2 4-4" /></>
    : /week|day|build/i.test(f) ? <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>
    : /mattress|foam/i.test(f) ? <path d="M3 15h18v4H3zM5 15v-3a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3" />
    : <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /></>;
  const arrow = <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
  const tabCols = ["", "", "lg:grid-cols-2", "lg:grid-cols-3", "lg:grid-cols-4", "lg:grid-cols-5"][list.length] ?? "lg:grid-cols-4";
  const factCols = foot.length >= 4 ? "lg:grid-cols-4" : foot.length === 3 ? "lg:grid-cols-3" : "";

  return (
    <section ref={band} className="pf-band relative py-12 md:py-14" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(226,194,122,.7)_25%,rgba(226,194,122,.7)_75%,transparent)]" />
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(226,194,122,.7)_25%,rgba(226,194,122,.7)_75%,transparent)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div data-reveal className="grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)] lg:gap-[18px]">
          {/* studio: ang kama mag-isa */}
          <Link ref={stage} href={cur.href} className="group pf-studio relative isolate block overflow-hidden rounded-[20px] lg:rounded-[26px] max-lg:aspect-[1.15/1] lg:min-h-[560px] text-ink shadow-[0_0_0_1px_rgba(226,194,122,.55),0_0_0_8px_rgba(226,194,122,.07),0_44px_70px_-36px_rgba(0,0,0,.95)]" aria-label={`${split(cur.name).title} — build this bed`}>
            <span aria-hidden className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_90%_80%_at_50%_50%,transparent_60%,rgba(62,50,32,.08)_100%)]" />
            <span className="absolute right-3 top-3 lg:right-5 lg:top-[18px] z-[3] grid gap-0.5 rounded-xl bg-white/90 px-3 py-1.5 lg:px-3.5 lg:py-2 text-right shadow-[0_0_0_1px_rgba(176,138,62,.3),0_14px_24px_-16px_rgba(62,50,32,.6)] backdrop-blur-sm">
              <small className="text-[9px] lg:text-[9.5px] font-bold tracking-[0.2em] uppercase text-goldDeep">{label}</small>
              <b className="font-cormorant font-semibold text-[20px] lg:text-[26px] leading-none tracking-[-0.02em] text-[#231B11]">{String(sel + 1).padStart(2, "0")}</b>
            </span>
            <div className="absolute inset-[7%_7%_8%] grid place-items-center">
              <div className="relative h-full aspect-square max-w-full">
                <i aria-hidden className="absolute left-[8%] right-[8%] top-[80%] h-[8%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(62,50,32,.36),transparent)]" />
                {list.map((b, i) => <StagePhoto key={b.key} src={photo(b)} alt={i === sel ? b.name : ""} on={i === sel} priority={i === 0} w={96} floor={84} ceil={10} />)}
              </div>
            </div>
          </Link>

          {/* salaming panel */}
          <div className="flex min-w-0 flex-col rounded-[20px] lg:rounded-[26px] p-5 sm:p-6 lg:p-[30px] lg:pb-6 bg-[linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.02))] shadow-[inset_0_0_0_1px_rgba(226,194,122,.26),0_30px_50px_-36px_rgba(0,0,0,.9)]">
            <p className="inline-flex w-max items-center gap-3 text-[11px] font-bold tracking-[0.2em] uppercase text-gold"><i aria-hidden className="w-7 h-px bg-gold" />{copy?.eyebrow ?? "Promo Bed · made to order"}</p>
            <h2 className="font-cormorant font-semibold text-[clamp(26px,2.8vw,34px)] leading-[1.05] tracking-[-0.02em] mt-3 text-[#FBF4E4] [text-wrap:balance]">
              {title.split(/(₱[\d,.]+)/).map((part, i) => i % 2 ? <em key={i} className="not-italic bg-[linear-gradient(180deg,#F3DDA4,#C99F4A)] bg-clip-text text-transparent">{part}</em> : part)}
            </h2>
            {copy?.sub && <p className="text-[14px] leading-relaxed mt-2 max-w-[46ch] text-[#D8CBB0]">{copy.sub}</p>}

            {/* ang napiling kama */}
            <div className="grid gap-[7px] mt-[18px] rounded-[18px] px-[18px] py-4 text-ink bg-[linear-gradient(180deg,#FBF4E4,#F3E7CF)] shadow-[inset_0_0_0_1px_rgba(176,138,62,.35),0_18px_30px_-22px_rgba(0,0,0,.7)]">
              <b className="font-cormorant font-semibold text-[clamp(22px,2.2vw,27px)] leading-[1.05] tracking-[-0.02em] text-[#231B11]">{split(cur.name).title}</b>
              {cur.feat && <span className="text-[13.5px] text-[#6B5D45]">{cur.feat}</span>}
              {cur.sizes.length > 0 ? (
                <div className="flex gap-1.5 flex-wrap">
                  {cur.sizes.map((s) => (
                    <span key={s.size} className="rounded-lg bg-white/70 shadow-[inset_0_0_0_1px_rgba(62,50,32,.22)] px-2.5 py-1 text-[11.5px] text-[#3E3220] flex flex-col min-w-[70px]">
                      <b className="text-[9.5px] tracking-[0.12em] uppercase text-goldDeep font-bold">{s.size}</b>{formatPrice(s.price)}
                    </span>
                  ))}
                </div>
              ) : cur.from > 0 ? (
                <span className="text-[13.5px] text-[#6B5D45]">from {formatPrice(cur.from)}</span>
              ) : null}
              {(split(cur.name).size || cur.fabric || cur.colors.length > 0) && (
                <div className="flex items-center gap-1.5 flex-wrap text-xs text-[#6B5D45]">
                  {[split(cur.name).size, cur.colors.length ? "" : cur.fabric].filter(Boolean).map((c) => <span key={c} className="inline-flex items-center h-[26px] px-3 rounded-full bg-white/70 shadow-[inset_0_0_0_1px_rgba(62,50,32,.25)] text-[11.5px] font-semibold text-[#3E3220]">{c}</span>)}
                  {cur.colors.slice(0, 4).map((c) => <i key={c.name} title={c.name} className="w-[22px] h-[22px] rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(62,50,32,.25)] inline-block overflow-hidden relative" style={{ background: c.hex ?? "#CFC2A8" }}>{c.swatch && <Image src={c.swatch} alt="" fill className="object-cover" style={{ objectPosition: c.focus || "50% 50%" }} sizes="24px" />}</i>)}
                  {cur.colors.length > 0 && <span>{cur.colors.map((c) => c.name).slice(0, 3).join(" · ")}</span>}
                </div>
              )}
              {/* Build this bed: madilim na bar, gintong kislap sa hover (mockup 2026-10-07) */}
              <Link href={cur.href} className="group/b pf-sheen flex items-center justify-between gap-3 h-14 mt-2 pl-[18px] pr-2 rounded-[14px] text-[11.5px] font-bold tracking-[0.16em] uppercase text-[#F7EEDC] bg-[linear-gradient(180deg,#3E3220,#1F170E)] shadow-[inset_0_0_0_1px_rgba(226,194,122,.5),inset_0_1px_0_rgba(255,255,255,.08),0_20px_30px_-18px_rgba(0,0,0,.85)] transition duration-300 hover:-translate-y-px hover:shadow-[inset_0_0_0_1px_rgba(226,194,122,.9),inset_0_1px_0_rgba(255,255,255,.1),0_24px_34px_-18px_rgba(0,0,0,.9)]">
                Build this bed
                <i aria-hidden className="relative z-[1] grid place-items-center w-10 h-10 rounded-full text-[#2A2116] bg-[linear-gradient(180deg,#EDD494,#D2AB56)] shadow-[0_8px_14px_-8px_rgba(0,0,0,.8)]"><span className="transition-transform duration-300 group-hover/b:-rotate-45">{arrow}</span></i>
              </Link>
            </div>

            {/* ang listahan ng mga kama */}
            <div className="relative grid gap-1.5 mt-4">
              {list.map((b, i) => {
                const on = i === sel;
                return (
                  <Link
                    key={b.key}
                    href={b.href}
                    aria-current={on || undefined}
                    onMouseEnter={() => { if (!touch.current) setSel(i); }}
                    onFocus={() => { setSel(i); setManual(true); }}
                    onPointerDown={(e) => { touch.current = e.pointerType !== "mouse"; armed.current = on; }}
                    onClick={(e) => {
                      // Daliri: walang hover — ang unang tap ay pumipili (at ipinapakita
                      // ang studio), ang pangalawa ang nagbubukas ng kama.
                      if (touch.current) setManual(true);
                      if (touch.current && !armed.current) { e.preventDefault(); setSel(i); stage.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }
                    }}
                    className={`relative grid grid-cols-[44px_minmax(0,1fr)_auto] sm:grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 overflow-hidden rounded-[14px] p-1.5 pr-2.5 text-[#F4EAD8] outline-none transition duration-300 focus-visible:ring-2 focus-visible:ring-gold ${on
                      ? "translate-x-[3px] bg-[linear-gradient(90deg,rgba(226,194,122,.18),rgba(226,194,122,.06))] shadow-[inset_0_0_0_1px_rgba(226,194,122,.55)]"
                      : "shadow-[inset_0_0_0_1px_rgba(226,194,122,.18)] hover:bg-gold/[.08]"}`}
                  >
                    <span className="relative block w-11 h-11 sm:w-12 sm:h-12 shrink-0 overflow-hidden rounded-[11px] pf-stage shadow-[0_0_0_1px_rgba(226,194,122,.3)]">
                      <FitImage src={photo(b)} alt="" fill={0.82} className="mix-blend-multiply" sizes="48px" />
                    </span>
                    <span className="grid min-w-0 gap-[2px]">
                      <b className={`font-cormorant font-semibold text-[15px] leading-[1.15] tracking-[-0.01em] ${on ? "text-white" : ""}`}>{split(b.name).title}</b>
                      {(b.feat || noteOf(b) || b.from > 0) && <small className="truncate text-[11.5px] leading-snug text-[#CFC2A4]">{b.feat || (b.from > 0 ? `from ${formatPrice(b.from)}` : noteOf(b))}</small>}
                    </span>
                    <i aria-hidden className={`justify-self-end w-2 h-2 rounded-full transition duration-300 ${on ? "bg-gold shadow-[0_0_0_4px_rgba(226,194,122,.2)] scale-[1.15]" : "shadow-[inset_0_0_0_1.5px_rgba(226,194,122,.6)]"}`} />
                    {on && run && <em key={sel} aria-hidden className="pf-fill absolute left-1.5 right-1.5 bottom-0 h-[2px] rounded-sm bg-gold" />}
                  </Link>
                );
              })}
            </div>
            {/* See all: outlined na pill, napupuno ng ginto sa hover (mockup 2026-10-07) */}
            <Link href="/collections/bed" className="group/a flex items-center justify-between gap-3.5 h-[52px] mt-3.5 pl-[22px] pr-[7px] rounded-full text-[13.5px] font-semibold tracking-[0.02em] text-[#F7EEDC] shadow-[inset_0_0_0_1.5px_rgba(226,194,122,.6)] transition duration-300 hover:-translate-y-0.5 hover:text-[#2A2116] hover:bg-[linear-gradient(90deg,#EDD494,#D2AB56)] hover:shadow-[inset_0_0_0_1.5px_rgba(226,194,122,1),0_18px_28px_-16px_rgba(154,119,48,.9)]">
              See all promo beds
              <i aria-hidden className="grid place-items-center w-[38px] h-[38px] rounded-full bg-gold text-[#2A2116] transition duration-300 group-hover/a:translate-x-[3px] group-hover/a:bg-[#2A2116] group-hover/a:text-gold">{arrow}</i>
            </Link>
          </div>
        </div>

        <div className={`grid sm:grid-cols-2 ${factCols} mt-5 border-t border-gold/[.18] text-[13px] text-[#CFC2A4]`}>
          {foot.map((f, k) => { const [b, ...r] = f.split(" "); return (
            <span key={f} className={`flex items-center gap-3 py-3.5 sm:py-4 sm:px-4 first:sm:pl-0 ${k > 0 ? "max-sm:border-t max-sm:border-gold/[.18]" : ""} ${k % 2 ? "sm:max-lg:border-l sm:max-lg:border-gold/[.18]" : ""} ${k > 1 ? "sm:max-lg:border-t sm:max-lg:border-gold/[.18]" : ""} ${k > 0 ? "lg:border-l lg:border-gold/[.18]" : ""}`}>
              <i aria-hidden className="grid place-items-center w-[38px] h-[38px] shrink-0 rounded-full text-gold bg-gold/[.08] shadow-[inset_0_0_0_1px_rgba(226,194,122,.45)]"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">{factIcon(f)}</svg></i>
              <span><b className="text-[#F7EEDC] font-semibold">{b} {r[0] ?? ""}</b> {r.slice(1).join(" ")}</span>
            </span>
          ); })}
        </div>

      </div>
    </section>
  );
}
