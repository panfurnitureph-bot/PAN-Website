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
import { homepage, products, swatchLibrary, CATEGORY_TILES, categoryTileImage, findManyByPrefix } from "@/lib/products";
import { primeStoreContent } from "@/lib/content";
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
import QuickView from "@/components/home/QuickView";
import FabricPopup from "@/components/home/FabricPopup";
import MessengerModal from "@/components/home/MessengerModal";

export const revalidate = 0;

export default async function HomePage() {
  const { site } = await primeStoreContent();
  const h = homepage;
  const listed = products.filter((p) => p.categoryListed !== false);
  // Best sellers: IMS picks (Website → Homepage); kung blangko, ang mga
  // featured/new na produkto.
  const picked = findManyByPrefix(h.bestSelling?.productPrefixes ?? []);
  const best = (picked.length ? picked : [...listed].sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.isNew) - Number(a.isNew))).slice(0, 10);
  const tiles = CATEGORY_TILES.filter((t) => listed.some((p) => p.category === t.slug));
  const handle = messengerHandle((site as unknown as { social?: { facebook?: string } }).social?.facebook);
  const mtoImage = listed.find((p) => p.category === "customized-bed")?.images[0] ?? listed.find((p) => p.category === "bed")?.images[0];

  return (
    <div>
      <HeroSlideshow slides={h.heroSlides} />
      <TrustBar items={h.trustBar} />

      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-1">
        <Rail title="Shop by category" n={[7, 5, 4, 3]}>
          {tiles.map((t) => (
            <Link key={t.slug} href={`/collections/${t.slug}`} className="group flex flex-col gap-2 text-center text-[12.5px] font-medium">
              <span className="relative block aspect-square bg-sand overflow-hidden">
                <Image src={categoryTileImage(t.slug)} alt={t.label} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" sizes="(min-width: 1100px) 160px, 40vw" />
              </span>
              {t.label}
            </Link>
          ))}
        </Rail>
      </section>

      {best.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-1">
          <Rail title={h.bestSelling?.title || "Best sellers"} sub="The most-ordered pieces this month." link={{ label: "Shop all →", href: "/collections/new-in" }}>
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
      <QuickView />
      <FabricPopup swatches={swatchLibrary} />
      <MessengerModal handle={handle} />
    </div>
  );
}
