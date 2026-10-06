"use client";

// "Reviews on Google" — rating header, masonry na review cards
// (avatar initials, stars, comment, photos, petsa), LOAD MORE.
// Pag-click ng review card: lightbox modal — photo sa kaliwa (may
// arrows para lumipat ng review), buong review sa kanan.
// Editable ang laman sa content/homepage.json → googleReviews.

import Image from "next/image";
import Marquee from "@/components/home/Marquee";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { averageRating, type HomepageContent, type Product } from "@/lib/products";

const AVATAR_COLORS = ["#7C5CBF", "#3B82C4", "#C4763B", "#4C9A6E", "#B85C7C", "#5C7CB8"];

type Review = {
  name: string;
  rating: number;
  date: string;
  text: string;
  photos: string[];
  product?: string; // slug/prefix ng product na ipapakita sa modal
};

// Stable na "review count" para sa product card sa modal
function fakeCount(slug: string): number {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) % 97;
  return 20 + (h % 150);
}

function Stars({ n }: { n: number }) {
  return (
    <span className="text-goldDeep tracking-wider text-sm">
      {"★".repeat(n)}
      {"☆".repeat(5 - n)}
    </span>
  );
}

// Branded "CUSTOM MADE" na card na may TUNAY na larawan sa taas at ang review
// bilang quote sa ibaba — parehong itsura ng dating generated na card, pero
// naka-CSS kaya awtomatiko para sa kahit anong review na may larawan (walang
// kailangang i-generate na image, gumagana sa Vercel).
function ReviewCardImage({
  photo,
  text,
  rating,
  compact = false,
}: {
  photo: string;
  text: string;
  rating: number;
  compact?: boolean;
}) {
  const quote = compact && text.length > 150 ? text.slice(0, 147).trimEnd() + "…" : text;
  return (
    <div className="bg-[#f6efe1] overflow-hidden">
      {/* Larawan sa taas */}
      <div className="relative aspect-[4/3] bg-sand">
        <Image src={photo} alt="Customer photo" fill className="object-cover" sizes="(min-width:768px) 440px, 100vw" />
      </div>
      {/* Branded na ibaba: logo, CUSTOM MADE, quote, verified, stars */}
      <div className="relative px-5 pt-8 pb-6 text-center -mt-8">
        <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-16 h-16 rounded-full bg-[#f6efe1] p-1 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/pan-seal.png" alt="PAN Furniture" className="w-full h-full object-contain rounded-full" />
        </div>
        <p className="text-[10px] tracking-[0.3em] text-stone/70 font-semibold mb-3">CUSTOM MADE</p>
        <p className="font-serif italic text-[15px] leading-relaxed text-ink/90 mb-4">“{quote}”</p>
        <p className="text-[9px] tracking-[0.25em] text-stone/60 mb-1">— VERIFIED GOOGLE REVIEW</p>
        <p className="text-cognac text-sm tracking-widest mb-1">{"★".repeat(rating)}{"☆".repeat(5 - rating)}</p>
        <p className="text-[10px] tracking-[0.2em] text-stone/70 font-semibold">
          PAN FURNITURE · 4.8★ ON GOOGLE
        </p>
      </div>
    </div>
  );
}

function Avatar({ name, index, size = "w-10 h-10" }: { name: string; index: number; size?: string }) {
  return (
    <span
      className={`${size} rounded-full text-cream flex items-center justify-center font-bold shrink-0`}
      style={{ backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
    >
      {name.charAt(0)}
    </span>
  );
}

// Hanapin ang product sa listahang ipinasa ng server — EXACT slug muna,
// saka prefix match (kapareho ng findByPrefix, pero sa props na listahan;
// ang module-level na `products` ay luma kapag nasa browser).
function findByPrefixIn(list: Product[], prefix: string): Product | undefined {
  return (
    list.find((p) => p.slug === prefix) ??
    list.find((p) => p.slug.startsWith(prefix))
  );
}

// ---------- LIGHTBOX MODAL — kapareho ng tunay na site ----------
function ReviewModal({
  items,
  index,
  onClose,
  onNav,
  products,
}: {
  items: Review[];
  index: number;
  onClose: () => void;
  onNav: (i: number) => void;
  products: Product[];
}) {
  const r = items[index];
  const [photoIdx, setPhotoIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);

  // Product na naka-link sa review (para sa product card + SHOP NOW)
  const product = r.product ? findByPrefixIn(products, r.product) : undefined;
  // Kaliwang photo: HI-RES product images (1200px) — ang review photos
  // ay maliliit na thumbnails (135px) kaya blurred kapag pinalaki.
  // Kung walang naka-link na product, saka lang gagamitin ang review photos.
  const gallery = product ? product.images : r.photos;
  const prodRating = product ? (averageRating(product) ?? 4.9) : 4.9;
  const prodCount = product ? (product.reviews.length || fakeCount(product.slug)) : 0;
  const prodTitle = product
    ? product.colors[0] && product.colors[0] !== "Default"
      ? `${product.name} | ${product.colors[0]}`
      : product.name
    : "";

  // Arrows: una, iikutin ang PHOTOS ng kasalukuyang review;
  // kapag naubos na, saka lilipat sa susunod/nakaraang review.
  const prev = useCallback(() => {
    if (photoIdx > 0) {
      setPhotoIdx(photoIdx - 1);
    } else {
      onNav((index - 1 + items.length) % items.length);
    }
  }, [photoIdx, index, items.length, onNav]);
  const next = useCallback(() => {
    if (photoIdx < gallery.length - 1) {
      setPhotoIdx(photoIdx + 1);
    } else {
      onNav((index + 1) % items.length);
    }
  }, [photoIdx, gallery.length, index, items.length, onNav]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  // Reset kapag lumipat ng review
  useEffect(() => {
    setPhotoIdx(0);
    setExpanded(false);
    setLikes(0);
    setDislikes(0);
  }, [index]);

  const longText = r.text.length > 180;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto grid md:grid-cols-[48%_52%]">
        {/* ---------- LEFT: MALAKING PHOTO + ARROWS ---------- */}
        <div className="relative aspect-square md:aspect-auto md:min-h-[560px] bg-[#f7f0e4] overflow-y-auto">
          {gallery.length > 0 &&
            (gallery[photoIdx].includes("/card-") ? (
              // Generated na card — ipakita buo (contain).
              <Image
                src={gallery[photoIdx]}
                alt={`Photo by ${r.name}`}
                fill
                className="md:rounded-l-xl object-contain"
                sizes="(min-width: 768px) 440px, 100vw"
              />
            ) : (
              // Tunay na larawan → branded na card na may larawan + quote.
              <ReviewCardImage photo={gallery[photoIdx]} text={r.text} rating={r.rating} />
            ))}
          <button
            onClick={prev}
            aria-label="Previous review"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-cream/70 hover:bg-cream text-ink flex items-center justify-center text-xl transition-colors"
          >
            ‹
          </button>
          <button
            onClick={next}
            aria-label="Next review"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-cream/70 hover:bg-cream text-ink flex items-center justify-center text-xl transition-colors"
          >
            ›
          </button>
          {gallery.length > 1 && (
            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-2">
              {gallery.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIdx(i)}
                  aria-label={`Photo ${i + 1}`}
                  className={`w-2 h-2 rounded-full ${i === photoIdx ? "bg-cream" : "bg-cream/50"}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ---------- RIGHT: PRODUCT CARD + REVIEW ---------- */}
        <div className="relative p-6">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 text-stone hover:text-ink text-2xl leading-none"
          >
            ×
          </button>

          {/* Product card — rating, pangalan, SHOP NOW */}
          {product && (
            <div className="flex gap-4 items-start pr-8">
              <Link
                href={`/products/${product.slug}`}
                className="relative w-24 h-24 bg-[#F1EAE0] border border-sand rounded overflow-hidden shrink-0"
              >
                <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="96px" />
              </Link>
              <div>
                <p className="flex items-center gap-1.5 text-sm">
                  <strong>{prodRating.toFixed(1)}</strong>
                  <Stars n={Math.round(prodRating)} />
                  <span className="text-stone">({prodCount})</span>
                </p>
                <Link
                  href={`/products/${product.slug}`}
                  className="block font-bold text-lg leading-snug mt-1 hover:text-cognac transition-colors"
                >
                  {prodTitle}
                </Link>
                <Link
                  href={`/products/${product.slug}`}
                  className="inline-block mt-3 bg-espresso text-cream px-5 py-2 text-xs font-bold tracking-widest2 rounded hover:bg-cognac transition-colors"
                >
                  SHOP NOW
                </Link>
              </div>
            </div>
          )}

          {/* Reviewer + petsa */}
          <div className={`flex items-center gap-3 ${product ? "mt-6" : "pr-8"}`}>
            <Avatar name={r.name} index={index} />
            <div className="text-sm">
              <p className="font-bold">{r.name}</p>
              <p className="flex items-center gap-2">
                <Stars n={r.rating} />
                <span className="text-stone text-xs">{r.date}</span>
              </p>
            </div>
          </div>

          {/* Buong review text + READ MORE/SHOW LESS. Kung ang ipinapakitang
              larawan ay ang "CUSTOM MADE" card, naka-embed na ang teksto doon —
              huwag nang ulitin dito. */}
          {/* Ang larawan sa kaliwa (generated card O branded na larawang-card)
              ay may naka-embed nang review — kaya ipinapakita lang natin ang
              plain na teksto dito kung WALANG larawan. */}
          {gallery.length === 0 && (
            <>
              <div className="mt-4 text-sm text-ink/90 leading-relaxed whitespace-pre-line">
                {expanded || !longText ? r.text : r.text.slice(0, 180) + "…"}
              </div>
              {longText && (
                <div className="text-center">
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-3 text-xs font-bold tracking-widest2 text-stone hover:text-ink"
                  >
                    {expanded ? "SHOW LESS" : "READ MORE"}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Thumbs */}
          <div className="flex gap-5 mt-5 text-sm">
            <button
              onClick={() => setLikes(likes + 1)}
              className="flex items-center gap-1.5 text-stone hover:text-ink"
              aria-label="Helpful"
            >
              👍 {likes}
            </button>
            <button
              onClick={() => setDislikes(dislikes + 1)}
              className="flex items-center gap-1.5 text-stone hover:text-ink"
              aria-label="Not helpful"
            >
              👎 {dislikes}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// "2026-07" → "July 2026"; ang ibang anyo ng petsa ay ipinapakita kung paano ito nakasulat.
function niceDate(d: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(d ?? "");
  return m ? `${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][Number(m[2]) - 1] ?? ""} ${m[1]}`.trim() : d;
}

const GMARK = (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
    <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.7h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" />
    <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.400 1-2.600 0-4.800-1.800-5.600-4.100H3.100v2.600C4.700 19.800 8.100 22 12 22z" />
    <path fill="#FBBC05" d="M6.4 13.9c-.2-.6-.3-1.200-.3-1.900s.1-1.300.3-1.900V7.500H3.100C2.400 8.900 2 10.400 2 12s.4 3.100 1.100 4.500l3.300-2.600z" />
    <path fill="#EA4335" d="M12 6c1.500 0 2.800.5 3.800 1.500l2.900-2.900C17 3 14.700 2 12 2 8.100 2 4.700 4.200 3.100 7.500l3.300 2.600C7.200 7.800 9.400 6 12 6z" />
  </svg>
);

// ---------- SECTION ----------
export default function GoogleReviews({
  googleReviews,
  products,
}: {
  googleReviews: HomepageContent["googleReviews"];
  products: Product[];
}) {
  const { title, rating, count } = googleReviews;
  // Ipakita lang ang 4–5 na bituin — itinatago ang mababang rating sa
  // storefront. Reviews na walang rating ay ipinapalagay na mataas (para hindi
  // matanggal ang mga lumang record na walang score).
  const items = googleReviews.items.filter((r) => (r.rating ?? 5) >= 4);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="reviews" className="max-w-7xl mx-auto px-4 sm:px-8 py-12 md:py-14">
      {/* Format ng mockup (Joe 2026-10-07, "gawin mo ung format na nasa artifact"):
          text card — bituin, panipi, ang review (hanggang anim na linya), pangalan,
          petsa at G — sa tuloy-tuloy na carousel. Parehong mga review (4–5 bituin)
          at parehong lightbox sa pag-click; doon pa rin makikita ang mga larawan. */}
      <Marquee
        title={title}
        sub={<span className="inline-flex items-center gap-2 flex-wrap text-[13px]">{GMARK}<b className="font-cormorant text-[15px] font-bold text-ink">{rating}</b><span className="text-[14px] tracking-[1px] text-goldDeep" aria-hidden>★★★★★</span><span>{count.toLocaleString()} reviews · verified on Google</span></span>}
        n={[4, 3, 2, 1]}
        speed={36}
      >
        {items.map((r, i) => {
          const stars = Math.max(0, Math.min(5, Math.round(r.rating ?? 5)));
          return (
            <div
              key={r.name + r.date}
              onClick={() => setOpenIdx(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setOpenIdx(i)}
              className="pf-card pf-lift relative flex h-full min-h-[280px] flex-col gap-3 px-[22px] pt-[22px] pb-[18px] cursor-pointer"
            >
              <span aria-hidden className="absolute top-1.5 right-[18px] select-none font-cormorant font-semibold text-[72px] leading-none text-goldSoft">“</span>
              <span className="relative text-[16px] tracking-[2px] text-[#C99A2E]" aria-label={`${stars} out of 5 stars`}>
                {"★".repeat(stars)}<i className="not-italic text-[#DDD2C3]">{"★".repeat(5 - stars)}</i>
              </span>
              <p className="relative flex-1 text-[15px] leading-[1.6] text-ink/90 line-clamp-6">{r.text}</p>
              <div className="flex items-center gap-2.5 pt-3.5 border-t border-sand">
                <span className="grid place-items-center w-[38px] h-[38px] shrink-0 rounded-full bg-[linear-gradient(180deg,#F7EED6,#EBDDB6)] text-brown font-bold">{r.name.charAt(0)}</span>
                <div className="min-w-0 flex-1">
                  <b className="block text-[13px] font-semibold leading-snug">{r.name}</b>
                  <small className="text-stone text-xs">{niceDate(r.date)}</small>
                </div>
                <span title="Posted on Google" className="grid place-items-center w-[30px] h-[30px] shrink-0 rounded-full bg-white shadow-[inset_0_0_0_1px_#E4DACA]">{GMARK}</span>
              </div>
            </div>
          );
        })}
      </Marquee>

      <div className="text-center mt-8 space-y-4">
        <p className="flex items-center justify-center gap-2 text-sm text-stone">
          <span className="font-bold text-lg">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </span>
          <span className="hover:text-ink cursor-pointer">Show all Reviews</span>
        </p>
      </div>

      {/* Lightbox */}
      {openIdx !== null && (
        <ReviewModal
          items={items}
          index={openIdx}
          onClose={() => setOpenIdx(null)}
          onNav={setOpenIdx}
          products={products}
        />
      )}
    </section>
  );
}
