// HOMEPAGE (2026-09-04, redesign) — order:
//  1 Hero slideshow           2 Trust bar (4 na totoong pangako)
//  3 Shop by category (rail)  4 Best sellers (rail, IMS picks)
//  5 Ready to ship (stock)    6 Promo beds (featured + 2×2)
//  7 Category rows (tabs)     8 Made to order, made here (+ fabric popup)
//  9 Video reviews           10 In real life (UGC)
// 11 FAQs                    12 Google reviews
// 13 Showrooms + contact
// Ang produkto, stock, kulay at tela ay galing sa IMS data (web_products,
// web_swatches); ang copy ay sa Website → Homepage. Ang mga lumang section
// (press bar, banners, split, testimonials, pre-footer) ay hindi na
// nire-render — nasa repo pa rin ang components.

import Image from "next/image";
import Link from "next/link";
import { homepage, products, swatchLibrary, CATEGORY_TILES, categoryTileImage } from "@/lib/products";
import { primeStoreContent } from "@/lib/content";
import FitImage from "@/components/FitImage";
import { messengerHandle } from "@/lib/messenger";
import HeroSlideshow from "@/components/HeroSlideshow";
import ProductCard from "@/components/ProductCard";
import VideoReviews from "@/components/VideoReviews";
import UgcGrid from "@/components/UgcGrid";
import FaqAccordion from "@/components/FaqAccordion";
import GoogleReviews from "@/components/GoogleReviews";
import ScrollTop from "@/components/ScrollTop";
import Rail from "@/components/home/Rail";
import TrustBar from "@/components/home/TrustBar";
import ReadyToShip from "@/components/home/ReadyToShip";
import PromoBeds from "@/components/home/PromoBeds";
import CategoryRows from "@/components/home/CategoryRows";
import MadeToOrder from "@/components/home/MadeToOrder";
import Showrooms from "@/components/home/Showrooms";
import MessengerModal from "@/components/home/MessengerModal";

export const revalidate = 0;

export default async function HomePage() {
  const { site, bestSellers } = await primeStoreContent();
  const h = homepage;
  const listed = products.filter((p) => p.categoryListed !== false);
  // Best sellers: awtomatiko mula sa IMS orders (web_content.best_sellers,
  // top 10 ng huling 90 araw); walang laman pa = featured/new na produkto.
  const bySlug = new Map(listed.map((p) => [p.slug, p]));
  const auto = bestSellers.map((s) => bySlug.get(s)).filter((p): p is NonNullable<typeof p> => !!p);
  const best = (auto.length ? auto : [...listed].sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.isNew) - Number(a.isNew))).slice(0, 10);
  // LAHAT ng category ang nasa tiles (2026-09-04): ang may published na
  // produkto = litrato + link; ang wala pa = "Coming soon" na PAN tile, hindi
  // clickable. Kusang nagiging tunay na tile pag may na-publish.
  const tiles = CATEGORY_TILES.map((t) => ({ ...t, live: listed.some((p) => p.category === t.slug) }));
  const handle = messengerHandle((site as unknown as { social?: { facebook?: string } }).social?.facebook);
  const mtoImage = listed.find((p) => p.category === "customized-bed")?.images[0] ?? listed.find((p) => p.category === "bed")?.images[0];

  return (
    <div>
      <HeroSlideshow slides={h.heroSlides} />
      <TrustBar items={h.trustBar} />

      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-1">
        <Rail title="Shop by category" n={[7, 5, 4, 3]}>
          {tiles.map((t) =>
            t.live ? (
              <Link key={t.slug} href={`/collections/${t.slug}`} className="group pf-card pf-lift flex h-full flex-col overflow-hidden text-left">
                {/* Uniform na tile (2026-09-04): buong litrato (contain) - pareho ang
                    dating ng product photo at ng category photo, walang putol.
                    Premium (2026-10-07): cream na entablado, natutunaw ang puting
                    background ng litrato (multiply), pangalan at arrow sa ibaba. */}
                <span className="relative block aspect-square pf-stage overflow-hidden border-b border-goldDeep/20">
                  {/* Ang zoom sa hover ay nasa balot na may sariling entablado, para
                      hindi maputol ang multiply ng litrato habang gumagalaw. */}
                  <span className="absolute inset-0 pf-stage transition-transform duration-500 ease-out group-hover:scale-[1.06]">
                    <FitImage src={categoryTileImage(t.slug)} alt={t.label} className="mix-blend-multiply" sizes="(min-width: 1100px) 160px, 40vw" />
                  </span>
                </span>
                <span className="flex flex-1 items-center justify-between gap-2 px-2.5 py-2.5 sm:px-3.5 sm:py-3 font-cormorant font-semibold text-[12.5px] sm:text-[14.5px] leading-tight">
                  <span className="min-w-0">{t.label}</span>
                  <i aria-hidden className="hidden lg:grid place-items-center w-7 h-7 shrink-0 rounded-full bg-brownDeep text-gold text-[13px] not-italic transition group-hover:translate-x-0.5 group-hover:bg-gold group-hover:text-brownDeep">→</i>
                </span>
              </Link>
            ) : (
              <div key={t.slug} className="pf-card flex h-full flex-col overflow-hidden text-left text-stone" aria-label={`${t.label} — coming soon`}>
                <span className="relative flex aspect-square flex-col items-center justify-center gap-2 pf-band text-cream overflow-hidden">
                  <Image src="/images/pan-logo.png" alt="PAN Furniture" width={72} height={72} className="w-[46%] h-auto drop-shadow-[0_2px_6px_rgba(0,0,0,.35)]" />
                  <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-gold">Coming soon</span>
                  <span className="absolute inset-x-3 bottom-2.5 border-t border-gold/25" />
                </span>
                <span className="flex flex-1 items-center px-2.5 py-2.5 sm:px-3.5 sm:py-3 font-cormorant font-semibold text-[12.5px] sm:text-[14.5px] leading-tight">{t.label}</span>
              </div>
            ),
          )}
        </Rail>
      </section>

      {best.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-1">
          <Rail title="Best sellers" sub={auto.length ? "The most-ordered pieces of the last 90 days." : "Featured pieces."} link={{ label: "Shop all →", href: "/collections/new-in" }}>
            {best.map((p) => <ProductCard key={p.slug} product={p} />)}
          </Rail>
        </section>
      )}

      <div className="mt-12"><ReadyToShip products={listed} copy={h.readyToShip} /></div>
      <PromoBeds products={listed} copy={h.promoBeds} />
      <CategoryRows products={listed} config={h.categoryRows} />
      <MadeToOrder copy={h.mto} swatches={swatchLibrary} fallbackImage={mtoImage} />

      <VideoReviews videoReviews={h.videoReviews} />
      <UgcGrid ugc={h.ugc} products={products} />
      <FaqAccordion />
      <GoogleReviews googleReviews={h.googleReviews} products={products} />
      <Showrooms copy={h.showrooms} />

      <ScrollTop />
      <MessengerModal handle={handle} />
    </div>
  );
}
