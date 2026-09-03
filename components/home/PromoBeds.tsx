// PROMO BEDS (2026-09-04) — brown band: isang malaking featured bed (presyo
// kada size mula sa bedSizes ng Configurator, 2 kulay) + 2×2 ng iba pang
// promo bed. Nakatago kapag wala pang promo bed na published.

import Image from "next/image";
import Link from "next/link";
import { formatPrice, type HomepageContent, type Product } from "@/lib/products";

export default function PromoBeds({ products, copy }: { products: Product[]; copy?: HomepageContent["promoBeds"] }) {
  const beds = products.filter((p) => p.category === "bed");
  if (!beds.length) return null;
  const featured = beds.find((b) => b.slug === copy?.featuredSlug) ?? beds.find((b) => b.featured) ?? beds[0];
  const rest = beds.filter((b) => b.slug !== featured.slug).slice(0, 4);
  const sizes = (featured.bedSizes ?? []).filter((s) => s.enabled !== false && (s.price ?? 0) > 0);
  const colors: { name: string; hex?: string; swatch?: string }[] = (featured.colorSwatches ?? []).length ? featured.colorSwatches! : featured.colors.map((c) => ({ name: c }));
  const minPrice = Math.min(...beds.map((b) => b.priceFrom ?? b.price).filter((n) => n > 0));
  const foot = copy?.foot?.length ? copy.foot : ["30% downpayment to start", "4–6 weeks build to delivery", "6-month warranty on frame, foam and workmanship"];

  return (
    <section className="bg-brown text-cream py-12 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-end justify-between gap-4 mb-5 flex-wrap">
          <div>
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-gold">{copy?.eyebrow ?? "Promo Bed · made to order"}</p>
            <h2 className="font-cormorant font-semibold text-[clamp(22px,2.6vw,30px)] leading-[1.05] mt-1.5">{copy?.title ?? `Promo beds from ${formatPrice(minPrice)}`}</h2>
            {copy?.sub && <p className="text-sm mt-1.5 max-w-[60ch] text-cream/75">{copy.sub}</p>}
          </div>
          <Link href="/collections/bed" className="text-[11.5px] font-bold tracking-[0.14em] uppercase border-b-[1.5px] border-gold text-gold pb-0.5 whitespace-nowrap">See all promo beds →</Link>
        </div>

        <div className="grid md:grid-cols-[1.35fr_1fr] gap-4">
          <Link href={`/products/${featured.slug}`} className="group relative block min-h-[340px] md:min-h-[420px] bg-brownDeep overflow-hidden">
            <Image src={featured.images[0] ?? "/images/placeholder.jpg"} alt={featured.name} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" sizes="(min-width: 768px) 55vw, 100vw" />
            <span className="absolute top-3.5 left-3.5 bg-gold text-brownDeep text-[10px] font-bold tracking-[0.14em] uppercase px-2.5 py-1">Best seller</span>
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 bg-gradient-to-t from-ink/90 via-ink/60 to-transparent flex flex-col gap-2.5">
              <div className="font-cormorant text-2xl font-semibold">{featured.name}</div>
              {sizes.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {sizes.map((s) => (
                    <span key={s.size} className="border border-cream/35 px-2.5 py-1.5 text-xs flex flex-col min-w-[78px]">
                      <b className="text-[10px] tracking-[0.12em] uppercase text-gold font-bold">{s.size}</b>{formatPrice(s.price!)}
                    </span>
                  ))}
                </div>
              )}
              {colors.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-cream/80">
                  {colors.slice(0, 4).map((c) => <i key={c.name} className="w-[18px] h-[18px] rounded-full border-2 border-cream/60 inline-block overflow-hidden relative" style={{ background: c.hex ?? "#CFC2A8" }}>{c.swatch && <Image src={c.swatch} alt="" fill className="object-cover" sizes="18px" />}</i>)}
                  <span>{colors.map((c) => c.name).slice(0, 3).join(" · ")}</span>
                </div>
              )}
              <span className="inline-block w-max mt-0.5 bg-gold text-brownDeep text-[12px] font-bold tracking-[0.14em] uppercase px-5 py-3">Build this bed</span>
            </div>
          </Link>

          <div className="grid grid-cols-2 gap-4">
            {rest.map((b) => (
              <Link key={b.slug} href={`/products/${b.slug}`} className="group relative block min-h-[150px] md:min-h-[200px] bg-white overflow-hidden text-cream">
                <Image src={b.images[0] ?? "/images/placeholder.jpg"} alt={b.name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" sizes="(min-width: 768px) 22vw, 50vw" />
                <div className="absolute inset-x-0 bottom-0 px-3.5 py-3 bg-gradient-to-t from-ink/85 to-transparent flex flex-col">
                  <b className="font-semibold text-sm">{b.name}</b>
                  <span className="text-xs text-gold">from {formatPrice(b.priceFrom ?? b.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex gap-6 flex-wrap mt-5 pt-4 border-t border-gold/25 text-[12.5px] text-cream/75">
          {foot.map((f) => { const [b, ...r] = f.split(" "); return <span key={f}><b className="text-cream font-semibold">{b} {r[0] ?? ""}</b> {r.slice(1).join(" ")}</span>; })}
        </div>
      </div>
    </section>
  );
}
