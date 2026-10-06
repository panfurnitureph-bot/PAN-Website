// HELP (Joe 2026-10-07, ang "Help" ng mockup): "Help, delivery and warranty" —
// tatlong card (Delivery, Returns, Warranty), ang karaniwang tanong bilang
// accordion sa kaliwa, at "Talk to us" na card sa kanan (Messenger, WhatsApp /
// Viber, email, showrooms, Track my delivery). Ang mga sagot ay sumusunod sa
// totoong proseso ng PAN (dating template na FAQ ang nandito: free shipping,
// 100-day guarantee, financing — hindi natin proseso).
import Link from "next/link";
import { primeStoreContent } from "@/lib/content";
import { contactLinks } from "@/lib/products";
import { messengerHandle } from "@/lib/messenger";

export const metadata = { title: "Help, delivery and warranty — PAN Furniture" };
export const revalidate = 0;

const FAQS = [
  { q: "How much is the delivery fee?", a: "It depends on your city or municipality. Pick your city on any product page or at checkout and the exact fee appears before you pay." },
  { q: "Can I change my delivery date?", a: "Yes. Once your piece is ready we propose a date by email and text. Confirm it or pick another one. After a date is confirmed, moving it carries a one-time ₱500 rescheduling fee, added to your balance." },
  { q: "How do I pay?", a: "A 30% downpayment confirms your order, through QR Ph (GCash, Maya, GoTyme or any bank app) or card. The balance is settled before delivery, by GCash, Maya, BDO, BPI or cash." },
  { q: "What does the warranty cover?", a: "Manufacturing defects in materials and woodwork, structural defects of frames and joints under normal household use, defective mechanisms such as swivel plates and hinges, and premature peeling of the surface finish not caused by misuse. Coverage is 6 months on promo items and 1 year on customized pieces, from the delivery date." },
  { q: "How do I make a warranty claim?", a: "Message us within the warranty period on Messenger, Viber, WhatsApp or email with your Product Warranty Certificate and official receipt, plus clear photos of the defect. Once validated, we repair, replace or service the item." },
];

const ICON = {
  truck: <><path d="M1 7h12v9H1zM13 10h5l3 3v3h-8z" /><circle cx="6" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></>,
  returns: <><path d="M21 12a9 9 0 11-3-6.7" /><path d="M21 4v4h-4" /></>,
  shield: <><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z" /><path d="m9 12 2 2 4-4" /></>,
};

export default async function FaqsPage() {
  const { site } = await primeStoreContent();
  const links = contactLinks(site);
  const c = site.contact as { email?: string; phone?: string };
  const handle = messengerHandle((site as unknown as { social?: { facebook?: string } }).social?.facebook);
  const phone = links.whatsapp || links.viber || c.phone || "";
  const cards = [
    ["truck", "Delivery by our own team", "We deliver with our own trucks and crew. The fee depends on your city and is shown before you pay. Made-to-order pieces arrive in 4–6 weeks."],
    ["returns", "Returns", "Inspect the piece before you sign. Damage or a wrong item noted at delivery goes back with our team for repair or replacement at no cost."],
    ["shield", "Warranty", "Every delivery comes with a signed certificate: 6 months on promo items and 1 year on customized pieces."],
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-10">
      <h1 className="font-cormorant font-semibold text-[clamp(30px,3.6vw,40px)] leading-[1.05] tracking-[-0.02em] mb-2">Help, delivery and warranty</h1>
      <p className="text-stone text-[15px] leading-relaxed mb-7">How delivery fees, scheduling, returns and the warranty work.</p>

      <div data-stagger className="grid gap-4 md:grid-cols-3 mb-6">
        {cards.map(([k, t, p]) => (
          <div key={t} className="pf-card pf-lift p-5">
            <span className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-goldSoft text-brownDeep shadow-[inset_0_0_0_1px_rgba(176,138,62,.35)]">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{ICON[k]}</svg>
            </span>
            <h2 className="font-cormorant text-[19px] font-semibold tracking-[-0.01em]">{t}</h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-stone">{p}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-start">
        <section className="pf-card overflow-hidden">
          <h2 className="border-b border-[#EBE2D2] px-5 py-3.5 text-[15px] font-semibold">Common questions</h2>
          <div className="divide-y divide-[#EBE2D2]">
            {FAQS.map((f) => (
              <details key={f.q} className="group open:bg-[linear-gradient(180deg,#FBF4E4,#FAF5EC)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[14.5px] font-semibold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full bg-[#F3EADB] text-brownDeep shadow-[inset_0_0_0_1px_#E0D5C1] transition group-open:rotate-45 group-open:bg-brownDeep group-open:text-gold group-open:shadow-none">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  </span>
                </summary>
                <p className="pf-rise -mt-1 max-w-[62ch] px-5 pb-5 text-sm leading-relaxed text-stone">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <aside className="pf-card overflow-hidden lg:sticky lg:top-24">
          <h2 className="border-b border-[#EBE2D2] px-5 py-3.5 text-[15px] font-semibold">Talk to us</h2>
          <div className="grid gap-3 px-5 py-4 text-[13.5px]">
            <a href={handle ? `https://m.me/${handle}` : "/contact"} target={handle ? "_blank" : undefined} rel="noopener noreferrer" className="pf-dark pf-btn inline-flex h-11 items-center justify-center gap-2 rounded-xl text-[13.5px] font-bold hover:text-gold">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 5h16v11H9l-5 4z" /></svg>Message us on Messenger
            </a>
            {phone && <p className="flex justify-between gap-3 py-1"><span className="text-stone">WhatsApp and Viber</span><a href={links.whatsappHref || `tel:${phone}`} className="font-semibold text-ink hover:text-goldDeep">{phone}</a></p>}
            {c.email && <p className="flex justify-between gap-3 py-1"><span className="text-stone">Email</span><a href={`mailto:${c.email}`} className="font-semibold text-ink hover:text-goldDeep break-all">{c.email}</a></p>}
            <p className="flex justify-between gap-3 py-1"><span className="text-stone">Showrooms</span><Link href="/#showrooms" className="font-semibold text-ink hover:text-goldDeep">2 · see hours</Link></p>
            <Link href="/track" className="mt-1 inline-flex h-11 items-center justify-center rounded-xl bg-white text-[13.5px] font-semibold text-ink shadow-[inset_0_0_0_1px_#C9B98F] transition hover:text-goldDeep hover:shadow-[inset_0_0_0_1.5px_#B08A3E]">Track my delivery</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
