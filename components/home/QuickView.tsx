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
import { formatPrice, type Product } from "@/lib/products";
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
      <div className="pf-pop relative bg-[#FBF7EF] w-[min(1000px,100%)] max-h-[92vh] overflow-auto rounded-[20px] grid md:grid-cols-[1.05fr_1fr] shadow-[0_0_0_1px_rgba(226,194,122,.45),0_40px_80px_-30px_rgba(0,0,0,.8)]">
        <button onClick={close} aria-label="Close" className="absolute top-3.5 right-3.5 z-10 grid h-9 w-9 place-items-center rounded-full bg-white text-ink shadow-[0_0_0_1.5px_#B08A3E,0_8px_16px_-10px_rgba(62,50,32,.5)] transition hover:bg-brownDeep hover:text-gold"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6 6 18" /></svg></button>

        {/* media */}
        <div className="flex flex-col p-5 pt-10 md:p-7 md:pt-10">
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
        <div className="p-5 md:p-10 md:pl-5 flex flex-col gap-4">
          <div><p className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-goldDeep mb-1.5">Quick view</p><h3 className="font-cormorant text-[26px] font-semibold leading-tight tracking-[-0.015em]">{p.name}</h3></div>
          <dl className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-2 text-[13px] m-0 rounded-xl bg-white px-4 py-3 shadow-[inset_0_0_0_1px_#EBE2D2]">
            <dt className="font-medium">Product code</dt><dd className="m-0 text-stone">{p.sku ?? "—"}</dd>
            <dt className="font-medium">Availability</dt>
            <dd className={`m-0 ${mto ? "text-stone" : "text-[#2F7D4F] font-semibold"}`}>
              {mto ? "Made to order · 4–6 weeks" : `${colorStock ?? stock} in stock · ships this week`}
            </dd>
          </dl>
          <div className="font-cormorant text-2xl font-semibold">
            {sizes.length && !sizePrice ? <span className="font-sans text-xs font-normal text-stone mr-1.5">from</span> : null}
            {formatPrice(price)}
          </div>
          {p.description && <p className="m-0 text-[13px] text-stone leading-relaxed">{p.description.length > 140 ? p.description.slice(0, 137) + "…" : p.description}</p>}

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

          <div className="flex gap-2.5 flex-wrap">
            <button type="button" onClick={() => add(false)} disabled={added} className={`h-12 rounded-full px-6 text-[13.5px] font-bold transition ${added ? "bg-[#2F7D4F] text-white" : "pf-dark pf-btn hover:text-gold"}`}>
              {added ? "Added ✓" : mto ? "Add to cart — made to order" : "Add to cart"}
            </button>
            <button type="button" onClick={() => add(true)} className="h-12 rounded-full bg-white px-6 text-[13.5px] font-bold text-brownDeep shadow-[inset_0_0_0_1.5px_#3E3220] transition hover:bg-brownDeep hover:text-gold">Buy now</button>
          </div>

          <div className="text-[12.5px] flex items-center gap-3 flex-wrap">
            <span>Share:</span>
            <a className="font-semibold text-ink border-b-[1.5px] border-goldDeep pb-px hover:text-goldDeep" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">Facebook</a>
            <a className="font-semibold text-ink border-b-[1.5px] border-goldDeep pb-px hover:text-goldDeep" href={`fb-messenger://share?link=${encodeURIComponent(url)}`}>Messenger</a>
            <button type="button" className="font-semibold text-ink border-b-[1.5px] border-goldDeep pb-px hover:text-goldDeep" onClick={() => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1200); }}>{copied ? "Copied ✓" : "Copy link"}</button>
          </div>
          <Link href={`/products/${p.slug}`} className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink hover:text-goldDeep"><span className="border-b-[1.5px] border-goldDeep pb-px">View full details, dimensions and fabric options</span><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-goldDeep" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg></Link>
        </div>
      </div>
    </div>
  );
}

// next/image ay nag-o-optimize ng src; para sa CSS background zoom, ang
// orihinal na URL ang gamit — pareho ring host (Supabase / public).
function zoomSrc(src: string) { return src; }
