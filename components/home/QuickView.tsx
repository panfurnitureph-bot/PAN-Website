"use client";

// QUICK VIEW (2026-09-04) — modal na bumubukas mula sa product card nang hindi
// umaalis sa homepage: gallery ng lahat ng anggulo (hover sa thumb = palit,
// hover sa malaking litrato = zoom), Product code, Availability, presyo,
// maikling description, Color (bilog na swatch → palit ng hero), Size (kapag
// may bedSizes), Quantity, Add to cart, Share. Iisang instance sa page;
// binubuksan ng `window.dispatchEvent(new CustomEvent("pan:quickview",
// { detail: { product } }))`.

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatPrice, CATEGORY_TILES, type Product } from "@/lib/products";
import { useStore } from "@/components/store";
import { toast } from "@/components/Toast";
import { readyCartLine } from "@/lib/ready-cart";

export function openQuickView(product: Product) {
  window.dispatchEvent(new CustomEvent("pan:quickview", { detail: { product } }));
}

export default function QuickView() {
  const { addToCart } = useStore();
  const [p, setP] = useState<Product | null>(null);
  const [img, setImg] = useState(0);
  const [color, setColor] = useState(0);
  const [size, setSize] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const open = (e: Event) => {
      const prod = (e as CustomEvent<{ product: Product }>).detail?.product;
      if (!prod) return;
      setP(prod); setImg(0); setColor(0); setSize(0); setQty(1); setAdded(false);
      document.body.style.overflow = "hidden";
    };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("pan:quickview", open);
    document.addEventListener("keydown", key);
    return () => { window.removeEventListener("pan:quickview", open); document.removeEventListener("keydown", key); };
  }, []);

  function close() { setP(null); document.body.style.overflow = ""; }
  if (!p) return null;

  const gallery = p.images.length ? p.images : ["/images/placeholder.jpg"];
  const swatches = (p.colorSwatches ?? []).filter((s) => s.image || s.swatch || s.hex);
  const colorNames = swatches.length ? swatches.map((s) => s.name) : p.colors;
  const sizes = (p.bedSizes ?? []).filter((s) => s.enabled !== false);
  const stock = p.stock ?? 0;
  const mto = stock <= 0;
  const sizePrice = sizes[size]?.price;
  const price = sizePrice && sizePrice > 0 ? sizePrice : p.priceFrom && sizes.length ? p.priceFrom : p.price;
  const colorStock = swatches[color]?.stock;
  const hero = swatches[color]?.images?.[0] ?? swatches[color]?.image ?? gallery[img];
  const shown = zoomSrc(hero);

  function pickImg(i: number) { setImg(i); }
  function pickColor(i: number) { setColor(i); }

  function add(buyNow: boolean) {
    const colorName = colorNames[color] ?? "";
    const sizeName = sizes[size]?.size ?? "";
    // Kapareho ng product page: as-is specs + size + kulay (2026-09-04).
    const line = readyCartLine(p!, colorName, sizeName, price);
    addToCart(p!.slug, line.key, qty, line.unitPrice, { baseLabel: line.baseLabel, basePrice: line.unitPrice, image: hero, addOns: line.addOns });
    if (buyNow) { window.location.href = "/checkout"; return; }
    setAdded(true); setTimeout(() => setAdded(false), 1500);
    if (p) toast(`${p.name} added to cart`);
  }

  const url = typeof window !== "undefined" ? `${window.location.origin}/products/${p.slug}` : `/products/${p.slug}`;

  return (
    <div className="pf-fade fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-[#1A140C]/60 backdrop-blur-[3px]" onClick={(e) => { if (e.target === e.currentTarget) close(); }} role="dialog" aria-modal="true" aria-label={`Quick view: ${p.name}`}>
      <div className="pf-pop relative bg-[#FBF7EF] w-[min(960px,100%)] max-h-[92vh] overflow-hidden rounded-[20px] flex flex-col shadow-[0_0_0_1px_rgba(226,194,122,.45),0_40px_80px_-30px_rgba(0,0,0,.8)]">
        {/* QUICK VIEW NG MOCKUP (Joe 2026-10-07): header na kategorya + "Quick view",
            litrato sa kaliwa, pangalan + presyo + DETAILS na talahanayan sa kanan,
            footer na View full details / Close / Add to cart. Parehong kulay, sukat,
            dami at cart logic. */}
        <div className="flex items-center justify-between gap-4 border-b border-[#E8DDC9] bg-[linear-gradient(180deg,#fff,#FAF5EC)] px-5 py-3.5">
          <div className="min-w-0">
            <p className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-goldDeep">{CATEGORY_TILES.find((t) => t.slug === p.category)?.label ?? p.category.replace(/-/g, " ")}</p>
            <h2 className="font-cormorant text-[19px] font-semibold leading-tight tracking-[-0.01em] mt-0.5">Quick view</h2>
          </div>
          <button onClick={close} aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-ink shadow-[0_0_0_1.5px_#B08A3E,0_8px_16px_-10px_rgba(62,50,32,.5)] transition hover:bg-brownDeep hover:text-gold"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6 6 18" /></svg></button>
        </div>
        <div className="grid md:grid-cols-[1fr_1.05fr] overflow-auto">
        {/* media */}
        <div className="flex flex-col p-5 md:p-6">
          <div
            ref={stage}
            className="relative flex-1 min-h-[260px] md:min-h-[360px] flex items-center justify-center overflow-hidden rounded-[18px] pf-stage shadow-[inset_0_0_0_1px_rgba(176,138,62,.22)] cursor-zoom-in"
            onMouseMove={(e) => { const r = stage.current!.getBoundingClientRect(); setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}
            onMouseLeave={() => setZoom(null)}
          >
            <Image src={shown} alt={p.name} fill className="object-contain p-6 mix-blend-multiply" sizes="(min-width: 768px) 520px, 100vw" />
            {zoom && (
              <div className="absolute inset-0 bg-white bg-no-repeat pointer-events-none hidden md:block" style={{ backgroundImage: `url("${shown}")`, backgroundSize: "220%", backgroundPosition: `${zoom.x}% ${zoom.y}%` }} />
            )}
          </div>
          {gallery.length > 1 && (
            <div className="flex items-center gap-2 mt-4">
              <button type="button" aria-label="Previous" onClick={() => pickImg((img - 1 + gallery.length) % gallery.length)} className="pf-arrow !h-8 !w-8"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 5l-7 7 7 7" /></svg></button>
              <div className="flex gap-2 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {gallery.map((g, i) => (
                  <button key={g + i} type="button" onMouseEnter={() => pickImg(i)} onClick={() => pickImg(i)} className={`relative w-16 h-16 shrink-0 p-1 border-b-2 ${i === img && !swatches[color]?.images?.length ? "border-ink" : "border-transparent"}`}>
                    <Image src={g} alt="" fill className="object-contain p-1.5 mix-blend-multiply" sizes="64px" />
                  </button>
                ))}
              </div>
              <button type="button" aria-label="Next" onClick={() => pickImg((img + 1) % gallery.length)} className="pf-arrow !h-8 !w-8"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 5l7 7-7 7" /></svg></button>
            </div>
          )}
        </div>

        {/* info */}
        <div className="p-5 pt-0 md:p-6 md:pl-2 flex flex-col gap-4">
          <div>
            <p className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-goldDeep">{CATEGORY_TILES.find((t) => t.slug === p.category)?.label ?? p.category.replace(/-/g, " ")}</p>
            <h3 className="font-cormorant text-[24px] font-semibold leading-tight tracking-[-0.015em] mt-1">{p.name}</h3>
            <div className="font-cormorant text-[22px] font-semibold tabular-nums mt-0.5">
              {sizes.length && !sizePrice ? <span className="font-sans text-xs font-normal text-stone mr-1.5">from</span> : null}
              {formatPrice(price)}
            </div>
          </div>
          {(() => {
            const rows: [string, string][] = [];
            for (const d of p.dimensionSpecs ?? []) if (d.label && d.value) rows.push([d.label, d.value]);
            if (!rows.length) for (const l of String(p.dimensions ?? "").split(/\r?\n/)) { const m = /^([^:]{1,40}):\s*(.+)$/.exec(l.trim()); if (m) rows.push([m[1].trim(), m[2].trim()]); }
            // Kapag "17.7"W x 34"H" lang ang sukat (walang label: value), hatiin sa Width / Depth / Height (kapareho ng ProductTabs).
            if (!rows.length) { const t = String(p.dimensions ?? ""); const g = (re: RegExp) => t.match(re)?.[1]; const w = g(/([\d.]+)\s*(?:"|”|in)?\s*W/i), d = g(/([\d.]+)\s*(?:"|”|in)?\s*D(?![a-z])/i), h = g(/([\d.]+)\s*(?:"|”|in)?\s*H/i); if (w) rows.push(["Width", `${w}"`]); if (d) rows.push(["Depth", `${d}"`]); if (h) rows.push(["Height", `${h}"`]); }
            return rows.length ? (
              <div>
                <p className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-goldDeep mb-1">Details</p>
                <dl className="m-0 divide-y divide-[#EBE2D2] border-y border-[#E6DCCB] text-[13px]">
                  {rows.slice(0, 6).map(([k, v]) => <div key={k} className="flex items-baseline justify-between gap-4 py-2"><dt className="text-stone">{k}</dt><dd className="m-0 text-right font-semibold text-ink">{v}</dd></div>)}
                </dl>
              </div>
            ) : (p.description ? <p className="m-0 text-[13px] text-stone leading-relaxed">{p.description.length > 140 ? p.description.slice(0, 137) + "…" : p.description}</p> : null);
          })()}
          <p className="m-0 text-[12.5px] text-stone">{mto ? "Ships in 4–6 weeks · 30% downpayment to start" : `${colorStock ?? stock} in stock · ships this week`}{p.sku ? <span className="ml-2 text-stone/70">· {p.sku}</span> : null}</p>

          {colorNames.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="text-[13.5px] font-semibold">Color <span className="text-goldDeep">*</span> <span className="font-normal text-stone ml-1">{colorNames[color]}</span></div>
              <div className="flex gap-2.5 flex-wrap">
                {colorNames.map((nm, i) => {
                  const s = swatches[i];
                  const src = s?.images?.[0] ?? s?.image ?? s?.swatch;
                  const out = s?.stock !== undefined && s.stock <= 0 && !mto;
                  return (
                    <button key={nm + i} type="button" title={nm} onMouseEnter={() => pickColor(i)} onClick={() => pickColor(i)}
                      className={`relative w-10 h-10 rounded-full overflow-hidden border-[1.5px] bg-white transition ${i === color ? "border-brownDeep ring-2 ring-offset-2 ring-offset-[#FBF7EF] ring-goldDeep" : "border-sand hover:border-goldDeep"} ${out ? "opacity-40" : ""}`}>
                      {src ? <Image src={src} alt={nm} fill className="object-cover" sizes="40px" /> : <span className="absolute inset-0" style={{ background: s?.hex ?? "#D9CFC0" }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="text-[13px] font-semibold">Size</div>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((s, i) => (
                  <button key={s.size} type="button" onClick={() => setSize(i)} className={`h-9 rounded-full px-4 text-[12.5px] font-semibold min-w-[60px] transition ${i === size ? "pf-dark" : "bg-white text-ink shadow-[inset_0_0_0_1px_#E0D5C1] hover:shadow-[inset_0_0_0_1px_#B08A3E]"}`}>{s.size}</button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="text-[13px] font-semibold">Quantity</div>
            <div className="flex h-11 items-center overflow-hidden rounded-xl bg-white shadow-[inset_0_0_0_1px_#E0D5C1] w-max transition-shadow hover:shadow-[inset_0_0_0_1px_#B08A3E]">
              <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-full text-[18px] text-brown transition-colors hover:bg-[#F6EFE0] hover:text-brownDeep">−</button>
              <span className="w-10 text-center text-sm font-semibold tabular-nums">{qty}</span>
              <button type="button" onClick={() => setQty(qty + 1)} className="w-10 h-full text-[18px] text-brown transition-colors hover:bg-[#F6EFE0] hover:text-brownDeep">+</button>
            </div>
          </div>


          <div className="text-[12.5px] flex items-center gap-3 flex-wrap">
            <span>Share:</span>
            <a className="font-semibold text-ink border-b-[1.5px] border-goldDeep pb-px hover:text-goldDeep" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">Facebook</a>
            <a className="font-semibold text-ink border-b-[1.5px] border-goldDeep pb-px hover:text-goldDeep" href={`fb-messenger://share?link=${encodeURIComponent(url)}`}>Messenger</a>
            <button type="button" className="font-semibold text-ink border-b-[1.5px] border-goldDeep pb-px hover:text-goldDeep" onClick={() => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1200); }}>{copied ? "Copied ✓" : "Copy link"}</button>
          </div>
        </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8DDC9] bg-[linear-gradient(180deg,#FAF5EC,#F5EDDF)] px-5 py-3.5">
          <Link href={`/products/${p.slug}`} className="text-[13px] font-semibold text-ink border-b-[1.5px] border-goldDeep pb-px hover:text-goldDeep">View full details</Link>
          <span className="flex gap-2">
            <button type="button" onClick={close} className="h-11 rounded-xl bg-white px-5 text-[13.5px] font-semibold text-ink shadow-[inset_0_0_0_1px_#C9B98F] transition hover:text-goldDeep hover:shadow-[inset_0_0_0_1.5px_#B08A3E]">Close</button>
            <button type="button" onClick={() => add(true)} className="h-11 rounded-xl bg-white px-5 text-[13.5px] font-bold text-brownDeep shadow-[inset_0_0_0_1.5px_#3E3220] transition hover:bg-brownDeep hover:text-gold">Buy now</button>
            <button type="button" onClick={() => add(false)} disabled={added} className={`h-11 rounded-xl px-5 text-[13.5px] font-bold transition ${added ? "bg-[#2F7D4F] text-white" : "pf-dark pf-btn hover:text-gold"}`}>
              {added ? "Added ✓" : "Add to cart"}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}

// next/image ay nag-o-optimize ng src; para sa CSS background zoom, ang
// orihinal na URL ang gamit — pareho ring host (Supabase / public).
function zoomSrc(src: string) { return src; }
