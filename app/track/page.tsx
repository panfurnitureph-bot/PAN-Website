"use client";

// ORDER TRACKER — dito tinitingnan ng customer kung nasaan na ang order niya.
//
// Kailangan ng order number AT ng email o huling 4 ng cellphone: sunod-sunod
// ang order number, kaya kung ito lang ang hihingin, makikita ng kahit sino ang
// order ng iba. Ang PAN app ang humahawak ng pagsusuri (/api/track).

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatPrice, site } from "@/lib/products";
import PanLoader, { BtnRing } from "@/components/PanLoader";

type Stage = { name: string; done: boolean; current: boolean; at: string | null };
type Item = { qty?: number; description?: string; unitPrice?: number; image?: string | null };
type Result = {
  order_number: string;
  customer_name: string;
  placed_at: string | null;
  cancelled: boolean;
  status: string;
  stages: Stage[];
  items: Item[];
  total: number;
  paid: number;
  balance: number;
  address: string | null;
  scheduled_for: string | null;
  // Hiwalay sa items: bayad ito, hindi binili.
  shipping_fee: number;
  delivery_confirmed: boolean;
  // Opsyonal — walang nito ang mga lumang order. Tingnan ang deliveryLine().
  lead_weeks?: [number, number];
};

// Kailan darating — ito ang tinitingnan ng customer, hindi ang mga natapos na.
// Kung naka-schedule na, yun ang petsa. Kung hindi pa, tinatantya mula sa araw
// ng order + lead time, at malinaw na sinasabing tantiya lang.
function deliveryLine(r: Result): { label: string; value: string; firm: boolean } | null {
  if (r.cancelled) return null;
  if (r.stages.some((s) => s.name === "Delivered" && s.done)) {
    const at = r.stages.find((s) => s.name === "Delivered")?.at;
    return { label: "DELIVERED", value: fmtDate(at) ?? "Complete", firm: true };
  }
  if (r.delivery_confirmed && r.scheduled_for) {
    return { label: "SCHEDULED FOR", value: fmtDate(r.scheduled_for) ?? "", firm: true };
  }
  if (!r.placed_at) return null;
  const from = new Date(r.placed_at);
  if (isNaN(from.getTime())) return null;
  // Hindi lahat ng order ay may lead_weeks (mga lumang record, o hindi pa
  // naitatakda sa app). 4–6 na linggo ang standard, kaya yun ang default —
  // mas mabuti nang may tantiya kaysa mag-crash ang buong tracking page.
  const [lo, hi] = Array.isArray(r.lead_weeks) ? r.lead_weeks : [4, 6];
  const a = new Date(from);
  a.setDate(a.getDate() + lo * 7);
  const b = new Date(from);
  b.setDate(b.getDate() + hi * 7);
  const month = (d: Date) => d.toLocaleDateString("en-PH", { month: "long" });
  const value =
    month(a) === month(b)
      ? `${month(a)} ${a.getDate()}–${b.getDate()}`
      : `${month(a)} ${a.getDate()} – ${month(b)} ${b.getDate()}`;
  return { label: "ESTIMATED DELIVERY", value, firm: false };
}

// Sariling API route ang tinatawag, hindi diretso ang PAN app — ibang domain
// ito, kaya haharangin ng browser (CORS). Ang /api/track dito ang nagpapasa.

function fmtDate(s?: string | null) {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" });
}

// Maliit na label sa itaas ng bawat pangkat — kaparehong treatment ng buong site.
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-goldDeep mb-3">{children}</p>
  );
}

function TrackerInner() {
  const params = useSearchParams();
  // Naka-loob sa track pop-up (iframe)? — kung gayon, ang resulta ay INLINE
  // (hindi fixed overlay), para tama ang taas na iniuulat sa modal at walang
  // doble na backdrop/close.
  const embed = params.get("embed") === "1";
  const [order, setOrder] = useState(params.get("order") ?? "");
  const [verify, setVerify] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  // Escape para isara ang resulta — inaasahan ito sa kahit anong pop-up.
  // Hinaharangan din ang scroll sa likod habang bukas.
  useEffect(() => {
    if (!result) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setResult(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [result]);

  async function lookup(orderRef: string, verifyVal: string, token?: string) {
    setError("");
    setBusy(true);
    setResult(null);

    // Mabilis ang lookup — kung agad-agad, para itong kumikislap lang at hindi
    // halatang may nangyari. Hinihintay natin ang mga 2 segundo bago ipakita.
    const started = Date.now();
    const settle = async () => {
      const spent = Date.now() - started;
      if (spent < 2000) await new Promise((r) => setTimeout(r, 2000 - spent));
    };

    try {
      const qs = `order=${encodeURIComponent(orderRef.trim())}` +
        (verifyVal.trim() ? `&verify=${encodeURIComponent(verifyVal.trim())}` : "") +
        (token ? `&t=${encodeURIComponent(token)}` : "");
      const res = await fetch(`/api/track?${qs}`, { cache: "no-store" });
      const data = await res.json();
      await settle();
      if (!res.ok) {
        setError(data?.error ?? "We couldn't find that order.");
      } else {
        setResult(data as Result);
      }
    } catch {
      await settle();
      setError("Something went wrong. Please try again.");
    }
    setBusy(false);
  }

  function look(e: React.FormEvent) {
    e.preventDefault();
    lookup(order, verify);
  }

  // May lagdang token sa URL (mula sa FB alert na "Track order" na link)? —
  // buksan agad ang tracker, walang hinihinging email/telepono.
  useEffect(() => {
    const t = params.get("t");
    const ord = params.get("order");
    if (t && ord) lookup(ord, "", t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sa loob ng track pop-up: pag sinara/binuksan ulit, hinihiling ng parent na
  // ibalik sa form — instant, walang reload.
  useEffect(() => {
    function onReset(e: MessageEvent) {
      if (e.data?.type === "track-reset") {
        setResult(null);
        setError("");
        setBusy(false);
      }
    }
    window.addEventListener("message", onReset);
    return () => window.removeEventListener("message", onReset);
  }, []);

  const field = "w-full h-12 rounded-xl bg-white px-4 text-[14px] text-ink shadow-[inset_0_0_0_1px_#D8CCB9] transition-shadow hover:shadow-[inset_0_0_0_1px_#B08A3E] focus:outline-none focus:shadow-[inset_0_0_0_1.5px_#B08A3E,0_0_0_3px_rgba(226,194,122,.3)] placeholder:text-stone/60";

  return (
    <>
      {/* ---------- FORM ---------- */}
      {/* Sa pop-up, itago ang form kapag may resulta na o naghahanap — para ang
          resulta lang ang lumabas at tama ang taas ng modal. */}
      <div
        className="max-w-xl mx-auto px-4 sm:px-8 py-12 sm:py-16"
        hidden={embed && (busy || !!result)}
      >
        <div className="text-center mb-10">
          {/* olive, hindi cognac — ang cognac sa cream ay 3.55:1, kulang para
              sa maliit na teksto. Ang olive ay 9.49:1 at nasa palette pa rin. */}
          <p className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-goldDeep mb-3">
            Order tracker
          </p>
          <h1 className="font-cormorant font-semibold text-[clamp(30px,3.6vw,40px)] leading-[1.05] tracking-[-0.02em] mb-3">
            Track my delivery
          </h1>
          <p className="text-stone text-[14.5px] leading-relaxed">
            Enter your order number and the email or mobile number you used at checkout.
          </p>
        </div>

        <form onSubmit={look} className="pf-card p-5 sm:p-6">
          <label className="block mb-4">
            <span className="block text-[12px] font-semibold text-ink mb-1.5">
              Order number
            </span>
            <input
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              placeholder="ORD-000093"
              className={`${field} font-semibold tabular-nums tracking-[0.04em]`}
            />
          </label>
          <label className="block mb-5">
            <span className="block text-[12px] font-semibold text-ink mb-1.5">
              Email or mobile
            </span>
            <input
              value={verify}
              onChange={(e) => setVerify(e.target.value)}
              placeholder="you@email.com or 09171234567"
              className={field}
            />
          </label>
          <button
            type="submit"
            disabled={busy || !order.trim() || !verify.trim()}
            className="pf-dark pf-btn inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-bold hover:text-gold disabled:opacity-40 disabled:hover:translate-y-0"
          >
            {busy ? <><BtnRing /> Checking…</> : <>Track <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg></>}
          </button>
          {error && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-center text-[13px] text-red-800">{error}</p>
          )}
        </form>

        <p className="text-xs text-stone text-center mt-6 leading-relaxed">
          Can&apos;t find your order number? It&apos;s in your confirmation email, or{" "}
          <Link href="/contact" className="font-semibold text-ink border-b-[1.5px] border-goldDeep pb-px transition-colors hover:text-goldDeep">
            message us
          </Link>
          .
        </p>
      </div>

      {/* ---------- HABANG NAGHAHANAP ---------- */}
      {busy && (
        <div
          className={
            embed
              ? "flex items-center justify-center py-14 px-6"
              : "fixed inset-0 z-50 flex items-center justify-center bg-espresso/50 backdrop-blur-sm px-6"
          }
        >
          {/* Sa pop-up, ang modal na mismo ang cream na kahon — huwag nang
              doblehin ng kahon dito. */}
          <div
            className={
              embed
                ? "text-center"
                : "pf-pop bg-[#FBF7EF] rounded-[20px] px-10 py-9 text-center shadow-[0_0_0_1px_rgba(226,194,122,.45),0_40px_80px_-30px_rgba(0,0,0,.8)] max-w-xs w-full"
            }
          >
            <PanLoader label="This only takes a moment." size={128} />
            <p className="font-cormorant text-xl mt-3">Looking up your order</p>
          </div>
        </div>
      )}

      {/* ---------- RESULTA ---------- */}
      {result && (
        <div
          className={
            embed
              ? "bg-cream" // INLINE sa pop-up — walang fixed overlay
              : "pf-fade fixed inset-0 z-50 overflow-y-auto bg-[#1A140C]/60 backdrop-blur-[3px] p-4 sm:p-8"
          }
          onClick={embed ? undefined : () => setResult(null)}
        >
          <div
            className={
              embed
                ? "bg-cream overflow-hidden"
                : "pf-pop mx-auto max-w-xl bg-[#FBF7EF] rounded-[20px] overflow-hidden shadow-[0_0_0_1px_rgba(226,194,122,.45),0_40px_80px_-30px_rgba(0,0,0,.8)]"
            }
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header — madilim, para agad mabasa ang estado */}
            <div className="pf-band relative text-cream px-6 py-6 sm:px-8">
              {/* Sa pop-up, ang X ng modal ang nagsasara — huwag nang doblehin. */}
              {!embed && (
                <button
                  onClick={() => setResult(null)}
                  aria-label="Close"
                  className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-cream shadow-[inset_0_0_0_1px_rgba(226,194,122,.4)] transition hover:bg-gold hover:text-brownDeep"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6 6 18" /></svg>
                </button>
              )}
              <p className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-gold mb-1.5">
                Order
              </p>
              <p className="text-[17px] font-semibold tabular-nums tracking-[0.04em] mb-3">{result.order_number}</p>
              <p className="inline-flex items-center gap-2 rounded-full bg-gold/[.12] px-3.5 py-1.5 text-[13px] font-semibold text-[#FBF4E4] shadow-[inset_0_0_0_1px_rgba(226,194,122,.45)]">
                <span className={`h-2 w-2 rounded-full ${result.cancelled ? "bg-red-400" : "bg-gold pf-ping"}`} />
                {result.cancelled ? "Cancelled" : result.status}
              </p>
              <p className="text-sm text-[#CFC2A4] mt-3">
                {result.customer_name}
                {fmtDate(result.placed_at) && <> · placed {fmtDate(result.placed_at)}</>}
              </p>

            </div>

            {/* Timeline */}
            {!result.cancelled && (
              <div className="px-6 py-6 sm:px-8 border-b border-[#EBE2D2]">
                <SectionLabel>Progress</SectionLabel>
                <ol>
                  {result.stages.map((s, i) => {
                    const last = i === result.stages.length - 1;
                    return (
                      <li key={s.name} className="flex gap-4">
                        {/* Marka + guhit na nag-uugnay. Magkaibang HUGIS ang
                            tatlong estado, hindi lang kulay — ✓ ang tapos,
                            malaki at may singsing ang kasalukuyan, guwang ang
                            hindi pa naaabot. */}
                        <div className="flex flex-col items-center">
                          <span
                            className={`shrink-0 rounded-full flex items-center justify-center transition-all ${
                              s.current
                                ? "w-7 h-7 bg-white shadow-[0_0_0_2px_#B08A3E,0_0_0_6px_rgba(226,194,122,.25)] -ml-2 mt-0"
                                : s.done
                                  ? "w-6 h-6 bg-brownDeep text-gold shadow-[0_0_0_1.5px_#B08A3E] -ml-1.5 mt-0.5"
                                  : "w-6 h-6 bg-white shadow-[inset_0_0_0_1.5px_#D8CCB9] -ml-1.5 mt-0.5"
                            }`}
                          >
                            {s.current && <span className="w-2.5 h-2.5 rounded-full bg-goldDeep" />}
                            {!s.current && s.done && <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12.5l4.5 4.5L19 7" /></svg>}
                          </span>
                          {!last && (
                            <span
                              className={`w-[2px] flex-1 min-h-[34px] rounded-full ${s.done ? "bg-[linear-gradient(180deg,#B08A3E,#E2C27A)]" : "bg-[#E6DCCB]"}`}
                            />
                          )}
                        </div>
                        <div className={last ? "pb-0" : "pb-5"}>
                          <p
                            className={`leading-none ${
                              s.current
                                ? "text-[16px] font-semibold text-ink mt-1"
                                : s.done
                                  ? "text-[15px] font-semibold text-ink mt-0.5"
                                  : "text-[15px] text-stone/60 mt-0.5"
                            }`}
                          >
                            {s.name}
                            {s.current && (
                              <span className="ml-2 align-middle rounded-full bg-goldSoft px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] uppercase text-brownDeep">
                                Now
                              </span>
                            )}
                          </p>
                          {fmtDate(s.at) && (
                            <p className="text-[13px] text-stone mt-1">{fmtDate(s.at)}</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            {/* Produkto */}
            {result.items.length > 0 && (
              <div className="px-6 py-6 sm:px-8 border-b border-[#EBE2D2]">
                <SectionLabel>Your order</SectionLabel>
                {result.items.map((it, i) => {
                  // Ang description ay pangalan sa unang linya, tapos bullet
                  // bawat detalye (kulay, sukat, frame, kategorya) — mula sa
                  // checkout. Hinihiwalay natin para may hierarchy.
                  const lines = String(it.description ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
                  const title = lines[0] ?? "";
                  const details = lines.slice(1).map((l) => l.replace(/^[•·-]\s*/, ""));
                  const qty = it.qty ?? 1;
                  return (
                    <div key={i} className="flex gap-4 py-4 border-b border-[#EBE2D2] first:pt-0 last:border-0 last:pb-0">
                      {it.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={it.image}
                          alt=""
                          className="w-[72px] h-[72px] object-contain p-1.5 rounded-[14px] pf-stage mix-blend-multiply shadow-[inset_0_0_0_1px_rgba(176,138,62,.25)] shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-cormorant text-[16px] font-semibold leading-snug tracking-[-0.01em]">
                          {qty > 1 && <span className="text-stone">{qty}× </span>}
                          {title}
                        </p>
                        {details.length > 0 && (
                          <ul className="mt-1.5 space-y-0.5">
                            {details.map((d, x) => (
                              <li key={x} className="flex items-start gap-2 text-[12.5px] text-stone leading-relaxed"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-goldDeep" />
                                {d}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <p className="font-cormorant text-[16px] font-semibold whitespace-nowrap tabular-nums">
                        {formatPrice((it.unitPrice ?? 0) * qty)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bayad */}
            <div className="px-6 py-6 sm:px-8 border-b border-[#EBE2D2] text-sm">
              <SectionLabel>PAYMENT</SectionLabel>
              {result.shipping_fee > 0 && (
                <>
                  <div className="flex justify-between py-1.5">
                    <span className="text-stone">Items</span>
                    <span className="tabular-nums">
                      {formatPrice(result.total - result.shipping_fee)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-stone">Shipping</span>
                    <span className="tabular-nums">{formatPrice(result.shipping_fee)}</span>
                  </div>
                </>
              )}
              <div className={`flex justify-between py-1.5 ${result.shipping_fee > 0 ? "border-t border-[#EBE2D2] mt-1 pt-2.5" : ""}`}>
                <span className="text-stone">Order total</span>
                <span className="tabular-nums">{formatPrice(result.total)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-stone">Paid</span>
                <span className="tabular-nums font-semibold text-[#2F7D4F]">{formatPrice(result.paid)}</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-[#EBE2D2] mt-2 pt-3 font-cormorant text-[18px] font-semibold">
                <span>{result.balance === 0 ? "Fully paid" : "Balance"}</span>
                <span className="tabular-nums">{formatPrice(result.balance)}</span>
              </div>
            </div>

            {/* Delivery — kailan at saan, magkasama. Dito hinahanap ng
                customer ang petsa, hindi sa header kasama ng status. */}
            {(() => {
              const when = deliveryLine(result);
              if (!when && !result.address) return null;
              return (
                <div className="px-6 py-6 sm:px-8 border-b border-[#EBE2D2] text-sm">
                  <SectionLabel>Delivery</SectionLabel>

                  {when && (
                    <div className={`rounded-2xl bg-[linear-gradient(180deg,#FFFDF8,#FBF4E4)] px-4 py-3.5 shadow-[inset_0_0_0_1px_rgba(176,138,62,.3)] ${result.address ? "mb-4" : ""}`}>
                      <p className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-goldDeep mb-1">
                        {when.label}
                      </p>
                      <p className="font-cormorant text-[24px] font-semibold leading-tight tracking-[-0.01em] text-ink">{when.value}</p>
                      {!when.firm && (
                        <p className="text-xs text-stone mt-1.5">
                          We&apos;ll confirm the exact date once it&apos;s ready to ship.
                        </p>
                      )}
                    </div>
                  )}

                  {result.address && <p className="leading-relaxed">{result.address}</p>}
                </div>
              );
            })()}

            {/* Tulong */}
            <div className="px-6 py-6 sm:px-8 bg-[linear-gradient(180deg,#FAF5EC,#F5EDDF)] text-sm">
              <SectionLabel>Need help?</SectionLabel>
              <p className="text-stone leading-relaxed">
                <a href={`mailto:${site.contact.email}`} className="font-semibold text-ink border-b-[1.5px] border-goldDeep pb-px transition-colors hover:text-goldDeep">
                  {site.contact.email}
                </a>
                {" · "}
                <a href={`tel:${site.contact.phone}`} className="font-semibold text-ink border-b-[1.5px] border-goldDeep pb-px transition-colors hover:text-goldDeep">
                  {site.contact.phone}
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-lg mx-auto px-6 py-24 text-center text-sm text-stone">Loading…</div>
      }
    >
      <TrackerInner />
    </Suspense>
  );
}
