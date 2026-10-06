"use client";

// CART PAGE — items, qty controls, totals, checkout (payment naka-off,
// nagpapakita ng "contact us to order" — tingnan ang lib/checkout.ts).
//
// PREMIUM (Joe 2026-10-07, ang Cart ng mockup): "Your cart" na may bilang at
// paalala, bawat item bilang card (litrato sa cream na entablado, pangalan,
// kategorya at kung in stock, mga detalye bilang tuldok, stepper, Remove,
// Save for later, kabuuan at "each"), at Order summary na card (Subtotal,
// Delivery, Total, Downpayment to start 30%, Checkout, Continue shopping,
// tatlong paalala). Parehong cart store at parehong kuwenta ng subtotal.
// "Save for later" = inililipat sa Wishlist at inaalis sa cart.

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatPrice, CATEGORY_TILES } from "@/lib/products";
import { useStore } from "@/components/store";
import { toast } from "@/components/Toast";

const ARROW = <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
const LINK = "text-[13.5px] font-semibold text-ink border-b-[1.5px] border-goldDeep pb-px transition-colors hover:text-goldDeep";

// Ang `products` ay galing sa page.tsx (server) — doon lang nakukuha ang
// sariwang laman mula sa Supabase.
export default function CartClient({ products }: { products: Product[] }) {
  const { cart, removeFromCart, setQty, wishlist, toggleWishlist } = useStore();

  // I-join ang cart items sa product data
  const rows = cart
    .map((item) => ({ item, product: products.find((p) => p.slug === item.slug) }))
    .filter((r) => r.product); // laktawan kung tinanggal na ang product sa JSON

  const subtotal = rows.reduce(
    (sum, r) => sum + (r.item.unitPrice ?? r.product!.price) * r.item.qty,
    0
  );
  const count = rows.reduce((n, r) => n + r.item.qty, 0);
  const anyMto = rows.some((r) => (r.product!.stock ?? 0) <= 0);

  if (rows.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16 md:py-24">
        <div className="pf-card text-center py-16 px-6">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-goldSoft text-brownDeep shadow-[inset_0_0_0_1px_rgba(176,138,62,.35)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 7h12l1 14H5L6 7z" /><path d="M9 7a3 3 0 016 0" /></svg>
          </span>
          <h1 className="font-cormorant font-semibold text-[30px] leading-tight tracking-[-0.02em] mb-2">Your cart is empty</h1>
          <p className="text-stone mb-6">Your cart is waiting to be filled. Start shopping!</p>
          <Link
            href="/collections/sofas"
            className="pf-dark pf-btn inline-flex h-12 items-center gap-2 rounded-full px-7 text-[14px] font-bold hover:text-gold"
          >
            Shop sofas {ARROW}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 md:py-8">
      <div className="mb-6">
        <h1 className="font-cormorant font-semibold text-[clamp(30px,3.6vw,40px)] leading-[1.05] tracking-[-0.02em]">Your cart</h1>
        <p className="text-stone text-[14.5px] mt-2">{count} {count === 1 ? "item" : "items"}{anyMto ? " · made to order pieces ship in 4–6 weeks" : ""}</p>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_368px] gap-5 lg:gap-7 items-start">
        {/* Items */}
        <div data-stagger className="pf-card divide-y divide-[#EBE2D2] overflow-hidden">
          {rows.map(({ item, product }) => {
            const unit = item.unitPrice ?? product!.price;
            const cat = CATEGORY_TILES.find((t) => t.slug === product!.category)?.label ?? product!.categoryTitle ?? product!.category.replace(/-/g, " ");
            const inStock = (product!.stock ?? 0) > 0;
            const specs = [item.baseLabel ?? item.color, ...(item.addOns ?? []).map((a) => `+ ${a.label}${a.price > 0 ? ` ${formatPrice(a.price)}` : ""}`)].filter(Boolean);
            const saved = wishlist.includes(product!.slug);
            return (
              <div key={`${item.slug}-${item.color}`} className="grid grid-cols-[80px_minmax(0,1fr)] sm:grid-cols-[96px_minmax(0,1fr)_auto] gap-x-4 gap-y-3 p-4 sm:p-5">
                <Link href={`/products/${product!.slug}`} className="relative block aspect-square overflow-hidden rounded-[14px] pf-stage shadow-[inset_0_0_0_1px_rgba(176,138,62,.25)]">
                  <Image src={item.image || product!.images[0]} alt={product!.name} fill className="object-contain p-2 mix-blend-multiply" sizes="96px" />
                </Link>
                <div className="min-w-0">
                  <Link href={`/products/${product!.slug}`} className="font-cormorant text-[18px] sm:text-[19px] font-semibold leading-tight tracking-[-0.01em] hover:text-goldDeep">
                    {product!.name}
                  </Link>
                  <p className="text-[13px] text-stone mt-0.5">{cat} · {inStock ? "in stock, ships this week" : "made to order"}</p>
                  {specs.length > 0 && (
                    <ul className="mt-2 grid gap-1 text-[13px] text-stone">
                      {specs.map((s, i) => (
                        <li key={i} className="flex items-start gap-2"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-goldDeep" />{s}</li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3.5">
                    <div className="flex h-10 items-center overflow-hidden rounded-xl bg-white shadow-[inset_0_0_0_1px_#E0D5C1] transition-shadow hover:shadow-[inset_0_0_0_1px_#B08A3E]">
                      <button onClick={() => setQty(item.slug, item.color, item.qty - 1)} className="h-full w-9 text-[17px] text-brown transition-colors hover:bg-[#F6EFE0] hover:text-brownDeep" aria-label="Decrease">−</button>
                      <span className="w-8 text-center text-sm font-semibold tabular-nums">{item.qty}</span>
                      <button onClick={() => setQty(item.slug, item.color, item.qty + 1)} className="h-full w-9 text-[17px] text-brown transition-colors hover:bg-[#F6EFE0] hover:text-brownDeep" aria-label="Increase">+</button>
                    </div>
                    <button onClick={() => { removeFromCart(item.slug, item.color); toast("Removed"); }} className={LINK}>Remove</button>
                    <button onClick={() => { if (!saved) toggleWishlist(product!.slug); removeFromCart(item.slug, item.color); toast("Saved to wishlist"); }} className={LINK}>Save for later</button>
                  </div>
                </div>
                <div className="col-start-2 sm:col-start-3 text-left sm:text-right">
                  <p className="font-cormorant text-[20px] font-semibold tabular-nums tracking-[-0.01em]">{formatPrice(unit * item.qty)}</p>
                  {item.qty > 1 && <p className="text-[12.5px] text-stone tabular-nums">{formatPrice(unit)} each</p>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <aside className="pf-card overflow-hidden lg:sticky lg:top-24">
          <h2 className="border-b border-[#EBE2D2] px-5 py-4 text-[15px] font-semibold">Order summary</h2>
          <div className="px-5 py-4 text-[14px]">
            <div className="flex justify-between py-2">
              <span className="text-stone">Subtotal</span>
              <span className="font-semibold tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            {/* Walang "Shipping FREE" dito — hindi libre ang shipping; ang fee
                ay nakadepende sa address at kinukuwenta sa checkout. */}
            <div className="flex justify-between py-2">
              <span className="text-stone">Delivery</span>
              <span className="font-semibold">Calculated at checkout</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-[#EBE2D2] pt-4 mt-2">
              <span className="font-cormorant text-[20px] font-semibold">Total</span>
              <span className="font-cormorant text-[24px] font-semibold tabular-nums tracking-[-0.01em]">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 text-[13.5px]">
              <span className="text-stone">Downpayment to start (30%)</span>
              <span className="font-semibold tabular-nums">{formatPrice(Math.round(subtotal * 0.3))}</span>
            </div>
            <Link
              href="/checkout"
              className="pf-dark pf-btn mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-bold hover:text-gold"
            >
              Checkout {ARROW}
            </Link>
            <Link href="/collections/sofas" className={`${LINK} mt-4 inline-block`}>Continue shopping</Link>
            <ul className="mt-5 grid gap-2 text-[12.5px] text-stone">
              {[
                ["Up to 1 year warranty certificate", <path key="a" d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z" />],
                ["Delivered and set up by our own team", <g key="b"><path d="M1 7h12v9H1zM13 10h5l3 3v3h-8z" /><circle cx="6" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></g>],
                ["GCash, Maya, BDO, BPI or cash", <g key="c"><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /></g>],
              ].map(([t, icon]) => (
                <li key={t as string} className="flex items-center gap-2.5"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-goldDeep" aria-hidden>{icon}</svg>{t as string}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
