// DELIVERY, RETURNS & WARRANTY (Joe 2026-09-24, "ibase mismo sa shipping fee
// natin at return process pati warranty"): ang pahinang ito ay sumusunod sa
// totoong proseso ng PAN — delivery fee kada lungsod (site.shipping, naka-edit
// sa IMS Site tab), kumpirmasyon ng petsa, ₱500 rescheduling fee, inspeksyon
// bago pumirma, at ang Product Warranty Certificate (6 buwan promo / 1 taon
// customized). Walang "free shipping" o "100-day returns" — hindi natin iyon
// proseso.
//
// PREMIUM (Joe 2026-10-07, ang "Shipping & warranty" ng mockup): "On this page"
// na card sa kaliwa na may Ask a question; ang mga lugar bilang chip; Delivery
// day bilang apat na numerong card at ang ₱500 na paalala; Warranty bilang
// dalawang gintong tile (6 months / 1 year), dalawang listahan (covered / not
// covered) at apat na numerong card para sa claim. Parehong teksto.
import Link from "next/link";
import { primeStoreContent } from "@/lib/content";

export const metadata = { title: "Delivery, Returns & Warranty — PAN Furniture" };
export const revalidate = 0;

type City = { name: string; fee: number };
type Province = { name: string; cities: City[] };

const H2 = "font-cormorant font-semibold text-[26px] leading-tight tracking-[-0.015em] text-ink mb-3";
const NUM = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <li className="pf-card flex gap-3.5 p-4 text-[13.5px] leading-relaxed text-stone">
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-goldSoft font-cormorant text-[15px] font-bold text-brownDeep shadow-[inset_0_0_0_1px_rgba(176,138,62,.35)]">{n}</span>
    <span>{children}</span>
  </li>
);
const DOT = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-2.5"><span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-goldDeep" /><span>{children}</span></li>
);

export default async function ShippingPage() {
  const { site } = await primeStoreContent();
  // WALANG HALAGA NG FEE DITO (Joe 2026-09-24, "wag lagay ung delivery fee
  // mismo"): mga lugar lang na sineserbisyuhan; ang eksaktong bayad ay sa
  // Estimate your shipping at sa checkout.
  const provinces = ((site as { shipping?: { provinces?: Province[] } }).shipping?.provinces ?? [])
    .filter((p) => p.cities.length > 0)
    .map((p) => ({ name: p.name }));
  const toc = [["delivery", "Delivery fee by location"], ["schedule", "Delivery day"], ["returns", "Returns"], ["warranty", "Warranty"]];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-10">
      <p className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-goldDeep">Customer care</p>
      <h1 className="font-cormorant font-semibold text-[clamp(30px,3.6vw,40px)] leading-[1.05] tracking-[-0.02em] mt-2 mb-3">Delivery, Returns &amp; Warranty</h1>
      <p className="text-stone text-[15px] leading-relaxed max-w-[62ch] mb-8">
        Every PAN Furniture piece is delivered and set up by our own team. Here is exactly how delivery fees,
        scheduling, returns and the warranty work.
      </p>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 items-start">
        <aside className="pf-card p-4 lg:sticky lg:top-24">
          <p className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-goldDeep mb-2">On this page</p>
          <ul className="grid gap-0.5 text-[13.5px]">
            {toc.map(([id, t]) => <li key={id}><a href={`#${id}`} className="block rounded-lg px-2 py-1.5 text-ink transition-colors hover:bg-white hover:text-goldDeep">{t}</a></li>)}
          </ul>
          <Link href="/contact" className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white text-[13px] font-semibold text-ink shadow-[inset_0_0_0_1px_#C9B98F] transition hover:text-goldDeep hover:shadow-[inset_0_0_0_1.5px_#B08A3E]">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-goldDeep" aria-hidden><path d="M4 5h16v11H9l-5 4z" /></svg>Ask a question
          </Link>
        </aside>

        <div className="grid gap-10 text-stone leading-relaxed text-[14.5px]">
          <section id="delivery" className="scroll-mt-28">
            <h2 className={H2}>Delivery fee by location</h2>
            <p className="max-w-[66ch]">
              We deliver with our own trucks and crew, not a courier, so the fee depends on your city or
              municipality rather than on the size of the order. Use <b className="text-ink">Estimate your shipping</b> on
              any product page, or see the exact fee at checkout after you pick your city.
            </p>
            {provinces.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {provinces.map((p) => <span key={p.name} className="inline-flex h-8 items-center rounded-full bg-white px-3.5 text-[12.5px] font-semibold text-ink shadow-[inset_0_0_0_1px_#E0D5C1]">{p.name}</span>)}
              </div>
            )}
            <p className="mt-4 max-w-[66ch]">
              In-stock pieces ship within the week. Made-to-order pieces are built in our San Pedro, Laguna
              workshop and delivered in <b className="text-ink">4–6 weeks</b>.
            </p>
          </section>

          <section id="schedule" className="scroll-mt-28">
            <h2 className={H2}>Delivery day</h2>
            <ol className="grid gap-3 sm:grid-cols-2">
              <NUM n={1}>Once your piece is ready, we email and text you a proposed delivery date. Confirm it from the email, or reply to the text.</NUM>
              <NUM n={2}>On the day, you can follow the truck with live tracking, and we text you again when the team is nearby.</NUM>
              <NUM n={3}>Our team brings the piece into the room of your choice, sets it up and walks you through it.</NUM>
              <NUM n={4}>Inspect the piece, then sign the delivery form and the warranty certificate.</NUM>
            </ol>
            <p className="mt-4 flex items-start gap-2.5 rounded-xl bg-goldSoft px-4 py-3 text-[13px] text-brownDeep shadow-[inset_0_0_0_1px_rgba(176,138,62,.4)]">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="mt-0.5 shrink-0 text-goldDeep" aria-hidden><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
              <span><b>Need a different date?</b> Once a date is confirmed, moving it carries a
              one-time <b>₱500 rescheduling fee</b>, added to your balance. If nobody can receive
              the delivery on the confirmed date, the piece returns to our warehouse and we reschedule with you the same way.</span>
            </p>
          </section>

          <section id="returns" className="scroll-mt-28 border-t border-[#E6DCCB] pt-8">
            <h2 className={H2}>Returns</h2>
            <p className="max-w-[66ch]">
              Please inspect the piece before you sign. Damage, a missing part or a wrong item noted at delivery goes
              back with our team for <b className="text-ink">repair or replacement at no cost</b>. Anything you notice
              after delivery is handled under the warranty below.
            </p>
            <p className="mt-3 max-w-[66ch]">
              Made-to-order pieces are built to your chosen size, fabric and finish, so change-of-mind returns are not
              accepted once production has started. Ready-to-ship pieces follow the same inspect-before-signing rule.
            </p>
          </section>

          <section id="warranty" className="scroll-mt-28 border-t border-[#E6DCCB] pt-8">
            <h2 className={H2}>Warranty</h2>
            <p className="max-w-[66ch]">
              Every delivery comes with a signed <b className="text-ink">Product Warranty Certificate</b>. Keep it with
              your official receipt; both are required for a claim. Coverage runs from the delivery date:
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[["6 months", "for promo items"], ["1 year", "for customized items, unless stated otherwise on the certificate"]].map(([a, b]) => (
                <div key={a} className="rounded-2xl bg-[linear-gradient(180deg,#F8EFD8,#F1E3BF)] px-5 py-4 shadow-[inset_0_0_0_1px_rgba(176,138,62,.28),inset_0_1px_0_rgba(255,255,255,.7)]">
                  <p className="font-cormorant text-[26px] font-semibold leading-none text-brownDeep">{a}</p>
                  <p className="mt-1.5 text-[13px] text-brown">{b}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="pf-card p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-[15px] font-semibold text-ink">What is covered</h3>
                  <span className="rounded-full bg-[#E6F2EA] px-2.5 py-1 text-[10.5px] font-bold tracking-[0.1em] uppercase text-[#2F7D4F]">Free repair</span>
                </div>
                <p className="text-[13px] mb-2">Provided the item is used under normal conditions with proper care and maintenance:</p>
                <ul className="grid gap-1.5 text-[13.5px]">
                  <DOT>Manufacturing defects in materials and woodwork</DOT>
                  <DOT>Structural defects of frames and joints under normal household use</DOT>
                  <DOT>Defective mechanisms such as swivel plates, hinges and other moving hardware</DOT>
                  <DOT>Premature peeling or detachment of the surface finish not caused by misuse</DOT>
                </ul>
              </div>
              <div className="pf-card p-5">
                <h3 className="mb-3 text-[15px] font-semibold text-ink">What is not covered</h3>
                <ul className="grid gap-1.5 text-[13.5px]">
                  <DOT>Normal wear and tear, fading, or natural variation in wood, fabric and ceramic</DOT>
                  <DOT>Damage from misuse, accidents, abuse, or improper cleaning and maintenance</DOT>
                  <DOT>Damage from exposure to moisture, direct sunlight, heat, pests or flooding</DOT>
                  <DOT>Improper assembly, alteration or repair by unauthorized persons</DOT>
                  <DOT>Commercial, rental or non-household use, unless agreed in writing</DOT>
                  <DOT>Items with removed, altered or unreadable SKU labels and no proof of purchase</DOT>
                </ul>
              </div>
            </div>
            <p className="mt-3 text-[13.5px]">
              Repairs are complimentary. Pickup and delivery for warranty service are shouldered by the client.
            </p>

            <h3 className="mt-6 mb-3 text-[15px] font-semibold text-ink">How to claim</h3>
            <ol className="grid gap-3 sm:grid-cols-2">
              <NUM n={1}>Contact us within the warranty period through Messenger, Viber, WhatsApp or email.</NUM>
              <NUM n={2}>Present your Product Warranty Certificate together with the original official receipt.</NUM>
              <NUM n={3}>Send clear photos of the defect, or allow our team to inspect the item.</NUM>
              <NUM n={4}>Once validated, we repair, replace or service the item at our discretion.</NUM>
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
