// DELIVERY, RETURNS & WARRANTY (Joe 2026-09-24, "ibase mismo sa shipping fee
// natin at return process pati warranty"): ang pahinang ito ay sumusunod sa
// totoong proseso ng PAN — delivery fee kada lungsod (site.shipping, naka-edit
// sa IMS Site tab), kumpirmasyon ng petsa, ₱500 rescheduling fee, inspeksyon
// bago pumirma, at ang Product Warranty Certificate (6 buwan promo / 1 taon
// customized). Walang "free shipping" o "100-day returns" — hindi natin iyon
// proseso.
import { primeStoreContent } from "@/lib/content";

export const metadata = { title: "Delivery, Returns & Warranty — PAN Furniture" };
export const revalidate = 0;

type City = { name: string; fee: number };
type Province = { name: string; cities: City[] };

export default async function ShippingPage() {
  const { site } = await primeStoreContent();
  // WALANG HALAGA NG FEE DITO (Joe 2026-09-24, "wag lagay ung delivery fee
  // mismo"): mga lugar lang na sineserbisyuhan; ang eksaktong bayad ay sa
  // Estimate your shipping at sa checkout.
  const provinces = ((site as { shipping?: { provinces?: Province[] } }).shipping?.provinces ?? [])
    .filter((p) => p.cities.length > 0)
    .map((p) => ({ name: p.name }));

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-3">Delivery, Returns &amp; Warranty</h1>
      <p className="text-stone leading-relaxed mb-10">
        Every PAN Furniture piece is delivered and set up by our own team. Here is exactly how delivery fees,
        scheduling, returns and the warranty work.
      </p>

      <div className="space-y-12 text-stone leading-relaxed">
        <section id="delivery">
          <h2 className="text-xl font-bold text-ink mb-3">Delivery fee by location</h2>
          <p>
            We deliver with our own trucks and crew, not a courier, so the fee depends on your city or
            municipality rather than on the size of the order. Use <b className="text-ink">Estimate your shipping</b> on
            any product page, or see the exact fee at checkout after you pick your city.
          </p>
          {provinces.length > 0 && (
            <p className="mt-3">
              <b className="text-ink">Areas we serve:</b> {provinces.map((p) => p.name).join(", ")}.
            </p>
          )}
          <p className="mt-4">
            In-stock pieces ship within the week. Made-to-order pieces are built in our San Pedro, Laguna
            workshop and delivered in <b className="text-ink">4–6 weeks</b>.
          </p>
        </section>

        <section id="schedule">
          <h2 className="text-xl font-bold text-ink mb-3">Delivery day</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Once your piece is ready, we email and text you a proposed delivery date. Confirm it from the email, or reply to the text.</li>
            <li>On the day, you can follow the truck with live tracking, and we text you again when the team is nearby.</li>
            <li>Our team brings the piece into the room of your choice, sets it up and walks you through it.</li>
            <li>Inspect the piece, then sign the delivery form and the warranty certificate.</li>
          </ol>
          <p className="mt-4">
            <b className="text-ink">Need a different date?</b> Once a date is confirmed, moving it carries a
            one-time <b className="text-ink">₱500 rescheduling fee</b>, added to your balance. If nobody can receive
            the delivery on the confirmed date, the piece returns to our warehouse and we reschedule with you the same way.
          </p>
        </section>

        <section id="returns">
          <h2 className="text-xl font-bold text-ink mb-3">Returns</h2>
          <p>
            Please inspect the piece before you sign. Damage, a missing part or a wrong item noted at delivery goes
            back with our team for <b className="text-ink">repair or replacement at no cost</b>. Anything you notice
            after delivery is handled under the warranty below.
          </p>
          <p className="mt-3">
            Made-to-order pieces are built to your chosen size, fabric and finish, so change-of-mind returns are not
            accepted once production has started. Ready-to-ship pieces follow the same inspect-before-signing rule.
          </p>
        </section>

        <section id="warranty">
          <h2 className="text-xl font-bold text-ink mb-3">Warranty</h2>
          <p>
            Every delivery comes with a signed <b className="text-ink">Product Warranty Certificate</b>. Keep it with
            your official receipt; both are required for a claim. Coverage runs from the delivery date:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li><b className="text-ink">6 months</b> for promo items</li>
            <li><b className="text-ink">1 year</b> for customized items, unless stated otherwise on the certificate</li>
          </ul>

          <h3 className="mt-6 mb-2 text-sm font-bold uppercase tracking-[0.12em] text-ink">What is covered</h3>
          <p>Provided the item is used under normal conditions with proper care and maintenance:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Manufacturing defects in materials and woodwork</li>
            <li>Structural defects of frames and joints under normal household use</li>
            <li>Defective mechanisms such as swivel plates, hinges and other moving hardware</li>
            <li>Premature peeling or detachment of the surface finish not caused by misuse</li>
          </ul>
          <p className="mt-3">
            Repairs are complimentary. Pickup and delivery for warranty service are shouldered by the client.
          </p>

          <h3 className="mt-6 mb-2 text-sm font-bold uppercase tracking-[0.12em] text-ink">What is not covered</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Normal wear and tear, fading, or natural variation in wood, fabric and ceramic</li>
            <li>Damage from misuse, accidents, abuse, or improper cleaning and maintenance</li>
            <li>Damage from exposure to moisture, direct sunlight, heat, pests or flooding</li>
            <li>Improper assembly, alteration or repair by unauthorized persons</li>
            <li>Commercial, rental or non-household use, unless agreed in writing</li>
            <li>Items with removed, altered or unreadable SKU labels and no proof of purchase</li>
          </ul>

          <h3 className="mt-6 mb-2 text-sm font-bold uppercase tracking-[0.12em] text-ink">How to claim</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Contact us within the warranty period through Messenger, Viber, WhatsApp or email.</li>
            <li>Present your Product Warranty Certificate together with the original official receipt.</li>
            <li>Send clear photos of the defect, or allow our team to inspect the item.</li>
            <li>Once validated, we repair, replace or service the item at our discretion.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
