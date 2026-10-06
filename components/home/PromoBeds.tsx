// PROMO BEDS (2026-09-04) — brown band: isang malaking featured bed (presyo
// kada size mula sa bedSizes ng Configurator, kulay) + 2×2 ng iba pang promo
// bed. Pinagmumulan: published na Promo Bed na produkto. Ang IMS → Website
// Content → Promo Beds ay may (1) featured photo override, (2) bed cards na
// litrato na pumapalit sa product photo kapag magkapareho ang pangalan, at
// (3) fallback na laman habang wala pang published na kama. Nakatago kapag
// wala pareho.

import Image from "next/image";
import Link from "next/link";
import { formatPrice, type HomepageContent, type Product } from "@/lib/products";

type Card = { name?: string; price?: string; image?: string; sizes?: string; colors?: string; sizeList?: { size: string; price: string }[]; colorList?: { name: string; image?: string; focus?: string; hex?: string }[] };
type Tile = { key: string; name: string; href: string; image: string; from: number; sizes: { size: string; price: number }[]; colors: { name: string; hex?: string; swatch?: string; focus?: string }[] };

const num = (s: string) => Number(String(s).replace(/[^\d.]/g, "")) || 0;
const norm = (s: string) => s.trim().toLowerCase();
// Pinakamababang presyo sa listahan (0 kapag walang laman) — "from ₱…".
const minOf = (ns: number[]) => { const ps = ns.filter((n) => n > 0); return ps.length ? Math.min(...ps) : 0; };

export default function PromoBeds({ products, copy }: { products: Product[]; copy?: HomepageContent["promoBeds"] }) {
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
    }));
  }
  if (!tiles.length) return null;

  const featured = tiles[0];
  const featuredImage = (copy as { featuredImage?: string } | undefined)?.featuredImage || featured.image;
  const rest = tiles.slice(1, 5);
  const minPrice = Math.min(...tiles.map((t) => t.from).filter((n) => n > 0));
  const foot = copy?.foot?.length ? copy.foot : ["30% downpayment to start", "4–6 weeks build to delivery", "6-month warranty on frame, foam and workmanship"];

  // PREMIUM NA ANYO (Joe 2026-10-07, "design lang talaga") — parehong laman at
  // link ng dati: featured na kama (litrato, Best seller, sizes/presyo, kulay,
  // Build this bed) sa cream na entablado sa kaliwa; sa kanan ang eyebrow,
  // pamagat, sub, ang ibang kama (litrato, pangalan, "from"), ang foot lines
  // at "See all promo beds". Ang presyo sa pamagat ay ginto lang ang kulay.
  const title = copy?.title || (Number.isFinite(minPrice) ? `Promo beds from ${formatPrice(minPrice)}` : "Promo beds");
  const factIcon = (f: string) =>
    /warrant/i.test(f) ? <><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z" /><path d="m9 12 2 2 4-4" /></>
    : /week|day|build/i.test(f) ? <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>
    : /mattress|foam/i.test(f) ? <path d="M3 15h18v4H3zM5 15v-3a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3" />
    : <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /></>;
  const arrow = <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>;

  return (
    <section className="pf-band relative py-12 md:py-16">
      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(226,194,122,.7)_25%,rgba(226,194,122,.7)_75%,transparent)]" />
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(226,194,122,.7)_25%,rgba(226,194,122,.7)_75%,transparent)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid gap-8 lg:gap-14 lg:grid-cols-[0.95fr_1.05fr] items-center">
        <Link href={featured.href} className="group relative isolate flex flex-col min-h-[400px] lg:min-h-[560px] lg:self-stretch rounded-[22px] sm:rounded-[26px] overflow-hidden text-cream bg-[radial-gradient(ellipse_at_50%_46%,#fff_0,#FBF6EC_46%,#EFE4D0_100%)] shadow-[0_0_0_1px_rgba(226,194,122,.55),0_0_0_8px_rgba(226,194,122,.08),0_40px_70px_-36px_rgba(0,0,0,.95)]">
          <span className="absolute z-[2] left-4 top-4 sm:left-5 sm:top-5 inline-flex items-center h-7 px-3 rounded-full bg-brownDeep text-gold text-[10px] font-bold tracking-[0.18em] uppercase">Best seller</span>
          <div className="relative flex-1 min-h-[230px]">
            <i aria-hidden className="absolute left-[16%] right-[16%] bottom-[9%] h-6 rounded-[50%] bg-[radial-gradient(closest-side,rgba(62,50,32,.3),transparent)]" />
            <Image src={featuredImage} alt={featured.name} fill className="object-contain p-[7%] pt-[12%] mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.04]" sizes="(min-width: 1024px) 45vw, 100vw" />
          </div>
          <div className="relative z-[2] m-2.5 sm:m-3.5 mt-0 sm:mt-0 rounded-[18px] px-4 py-4 sm:px-5 flex flex-col gap-2.5 bg-[#2E2518]/90 backdrop-blur-md shadow-[inset_0_0_0_1px_rgba(226,194,122,.35),0_18px_30px_-18px_rgba(0,0,0,.7)]">
            <div className="font-cormorant text-[21px] sm:text-2xl font-semibold tracking-[-0.015em] text-[#FBF4E4]">{featured.name}</div>
            {featured.sizes.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {featured.sizes.map((s) => (
                  <span key={s.size} className="rounded-xl shadow-[inset_0_0_0_1px_rgba(226,194,122,.4)] px-3 py-1.5 text-xs flex flex-col min-w-[78px]">
                    <b className="text-[10px] tracking-[0.12em] uppercase text-gold font-bold">{s.size}</b>{formatPrice(s.price)}
                  </span>
                ))}
              </div>
            ) : featured.from > 0 ? (
              <div className="text-sm text-cream/85">from {formatPrice(featured.from)}</div>
            ) : null}
            {featured.colors.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-[#D8CBB0]">
                {featured.colors.slice(0, 4).map((c) => <i key={c.name} title={c.name} className="w-[22px] h-[22px] rounded-full border-2 border-cream/60 inline-block overflow-hidden relative" style={{ background: c.hex ?? "#CFC2A8" }}>{c.swatch && <Image src={c.swatch} alt="" fill className="object-cover" style={{ objectPosition: c.focus || "50% 50%" }} sizes="24px" />}</i>)}
                <span>{featured.colors.map((c) => c.name).slice(0, 3).join(" · ")}</span>
              </div>
            )}
            <span className="pf-gold inline-flex items-center justify-center gap-2 w-full sm:w-max mt-0.5 h-[46px] px-6 rounded-full text-[13.5px] font-bold">Build this bed {arrow}</span>
          </div>
        </Link>

        <div className="min-w-0">
          <p className="inline-flex items-center gap-3 text-[11px] font-bold tracking-[0.2em] uppercase text-gold"><i aria-hidden className="w-7 h-px bg-gold" />{copy?.eyebrow ?? "Promo Bed · made to order"}</p>
          <h2 className="font-cormorant font-semibold text-[clamp(28px,3.5vw,42px)] leading-[1.05] tracking-[-0.02em] mt-3.5 text-[#FBF4E4] [text-wrap:balance]">
            {title.split(/(₱[\d,.]+)/).map((part, i) => i % 2 ? <em key={i} className="not-italic bg-[linear-gradient(180deg,#F3DDA4,#C99F4A)] bg-clip-text text-transparent">{part}</em> : part)}
          </h2>
          {copy?.sub && <p className="text-[15px] leading-relaxed mt-2.5 max-w-[58ch] text-[#D8CBB0]">{copy.sub}</p>}

          {rest.length > 0 && (
            <div className="grid gap-2.5 sm:grid-cols-2 mt-6">
              {rest.map((b) => (
                <Link key={b.key} href={b.href} className="group flex items-center gap-3.5 rounded-[18px] p-2.5 pr-3.5 bg-white/[.04] shadow-[inset_0_0_0_1px_rgba(226,194,122,.22)] transition-colors hover:bg-gold/[.12] hover:shadow-[inset_0_0_0_1px_rgba(226,194,122,.6)]">
                  <span className="relative w-[72px] h-[72px] shrink-0 rounded-[14px] overflow-hidden pf-stage">
                    <Image src={b.image} alt={b.name} fill className="object-contain p-1.5 mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.06]" sizes="72px" />
                  </span>
                  <span className="flex flex-col min-w-0 flex-1">
                    <b className="font-cormorant font-semibold text-[16.5px] leading-tight text-[#F4EAD8] group-hover:text-white">{b.name}</b>
                    {b.from > 0 && <span className="text-xs text-gold mt-0.5">from {formatPrice(b.from)}</span>}
                  </span>
                  <i aria-hidden className="grid place-items-center w-9 h-9 shrink-0 rounded-full text-gold shadow-[inset_0_0_0_1px_rgba(226,194,122,.45)] transition group-hover:bg-gold group-hover:text-brownDeep group-hover:shadow-none">{arrow}</i>
                </Link>
              ))}
            </div>
          )}

          <div className="grid sm:grid-cols-2 mt-6 border-y border-gold/[.18] text-[13px] text-[#CFC2A4]">
            {foot.map((f, k) => { const [b, ...r] = f.split(" "); return (
              <span key={f} className={`flex items-center gap-3 py-3.5 sm:py-4 ${k % 2 ? "sm:pl-5 sm:border-l sm:border-gold/[.18]" : "sm:pr-4"} ${k > 0 ? "max-sm:border-t max-sm:border-gold/[.18]" : ""} ${k > 1 ? "sm:border-t sm:border-gold/[.18]" : ""}`}>
                <i aria-hidden className="grid place-items-center w-[38px] h-[38px] shrink-0 rounded-full text-gold bg-gold/[.08] shadow-[inset_0_0_0_1px_rgba(226,194,122,.45)]"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">{factIcon(f)}</svg></i>
                <span><b className="text-[#F7EEDC] font-semibold">{b} {r[0] ?? ""}</b> {r.slice(1).join(" ")}</span>
              </span>
            ); })}
          </div>

          <Link href="/collections/bed" className="pf-gold inline-flex items-center gap-2 h-[50px] px-6 mt-6 rounded-full text-sm font-bold whitespace-nowrap">See all promo beds {arrow}</Link>
        </div>
      </div>
    </section>
  );
}
