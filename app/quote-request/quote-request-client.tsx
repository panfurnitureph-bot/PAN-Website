"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/components/store";
import { formatPrice, type SiteContent } from "@/lib/products";
import { messengerHandle, messengerUrl } from "@/lib/messenger";

// PANGKAT-PANGKAT ANG BUILD, hindi isang mahabang listahan — parehong hati ng
// quotation at ng Messenger echo, kaya kilala na ng customer ang porma bago
// pa dumating ang dokumento: ang bagay, ang idinagdag dito, at ang dingding na
// may sariling sukat.
//
// WALANG Size/Fabric ANG IBANG PRODUKTO (ang side table ay taas at kulay ng
// kahoy lang). Doon, ang mga natitira ANG produkto — hindi "Add-ons", na
// parang may pangunahing bahagi pang nawawala.
function groupLines(lines: { label: string; price?: number }[]) {
  const seen = new Set<string>();
  const raw = lines
    .map((l) => ({ ...l, label: String(l.label).replace(/^[•·-]\s*/, "").trim() }))
    .filter((l) => {
      const k = l.label.toLowerCase();
      if (!l.label || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  const hasWall = raw.some((l) => /^double walling\b/i.test(l.label));
  const isWall = (l: string) =>
    hasWall && /^(double walling|frame dimension|height|thickness|width|decorative nails|gold accent)\b/i.test(l);
  // Ang mga SUKAT ay bahagi ng bagay mismo, hindi idinagdag dito: ang taas at
  // lalim ng sofa ang sofa. Sa "Add-ons", parang may pinili pang dagdag ang
  // customer gayong sinusukat lang niya ang binibili.
  const isMeasure = (l: string) => /\b\d/.test(l) && /^(total |armrest |backrest |seat |headboard )?(height|width|thickness|depth|length)\b/i.test(l);
  const wallLines = raw.filter((l) => isWall(l.label));
  const nonWall = raw.filter((l) => !isWall(l.label));
  // ANG Size/Fabric ANG TANDA NA MAY PANGKAT. Kapag wala ang alinman, ang
  // buong listahan ANG produkto — ang side table ay taas at kulay ng kahoy,
  // at ang paghahati niyon ay naglalagay ng magkapatid na linya sa magkaibang
  // pangkat na parang may pinili pang dagdag ang customer.
  const core = nonWall.some((l) => /^(size|fabric)\b/i.test(l.label));
  const isItem = (l: string) => /^(size|fabric)\b/i.test(l) || isMeasure(l);
  const itemLines = core ? nonWall.filter((l) => isItem(l.label)) : nonWall;
  const rest = core ? nonWall.filter((l) => !isItem(l.label)) : [];
  return [
    { title: "The item", lines: itemLines },
    ...(rest.length ? [{ title: "Add-ons", lines: rest }] : []),
    ...(wallLines.length ? [{ title: "Double walling", lines: wallLines }] : []),
  ].filter((g) => g.lines.length);
}

export default function QuoteRequestClient({ site }: { site: SiteContent }) {
  const { quote, removeFromQuote, quoteTotal, clearQuote } = useStore();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const PROVINCES =
    (site as unknown as { shipping?: { provinces?: { name: string; cities: { name: string; fee: number }[] }[] } }).shipping
      ?.provinces ?? [];
  const cityList = PROVINCES.find((p) => p.name === province)?.cities ?? [];
  const shipFee = cityList.find((c) => c.name === city)?.fee ?? null;
  const handle = messengerHandle((site as unknown as { social?: { facebook?: string } }).social?.facebook);

  async function send() {
    if (!handle) return;
    // Ang lugar ang nagtatakda ng shipping fee sa quotation, kaya ito lang ang
    // talagang kailangan — ang pangalan at mobile ay nakukuha rin sa Messenger.
    if (!(province && city)) {
      setErr("Please choose your delivery location — it sets the shipping fee on your quotation.");
      return;
    }
    setErr(null);
    setSending(true);
    const slots = quote.map(({ id: _id, summary: _s, state: _st, ...rest }) => rest);
    let mtoRef: string | null = null;
    try {
      const res = await fetch("/api/send-mto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Ang unang produkto ay nasa ugat pa rin: may lumang IMS build sa
          // gitna ng deploy na `build` lang ang binabasa.
          sku: slots[0]?.sku,
          slug: slots[0]?.slug,
          name: slots[0]?.name,
          category: slots[0]?.category,
          image: slots[0]?.image ?? null,
          address: `${city}, ${province}`,
          contact: mobile.trim() || null,
          customer: name.trim() || null,
          build: slots[0]?.build,
          builds: slots,
        }),
        signal: AbortSignal.timeout(20000),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; mto_number?: string };
      if (data.ok && data.mto_number) mtoRef = data.mto_number;
    } catch {
      /* relay down — Messenger link pa rin ang fallback */
    }
    setSending(false);
    // Naipadala na — linisin, para hindi maisama sa susunod na request.
    clearQuote();
    const url = messengerUrl(handle, mtoRef ? `mto_${mtoRef}` : `mto_${slots[0]?.slug ?? "request"}`);
    if (/Android|iPhone|iPad/i.test(navigator.userAgent)) window.location.href = url;
    else window.open(url, "_blank", "noopener,noreferrer");
  }

  // Ang listahan ay galing sa localStorage kaya blangko sa unang render;
  // walang ipinapakitang "walang laman" hangga't hindi pa nababasa — kung
  // hindi, kumukurap ang mensahe bago lumitaw ang tunay na listahan.
  if (!hydrated) {
    return <div className="mx-auto max-w-6xl px-6 py-16" />;
  }

  if (!quote.length) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="mb-2 text-2xl font-semibold">Your quote request</h1>
        <p className="mb-6 text-sm text-stone">
          Nothing here yet. Configure a made-to-order piece and choose <b className="text-ink">Add to request</b> to
          price several together.
        </p>
        <Link
          href="/collections/bed"
          className="inline-block rounded border border-ink px-5 py-3 text-xs font-bold uppercase tracking-widest2 transition-colors hover:bg-ink hover:text-cream"
        >
          Browse made to order
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <nav className="mb-6 text-xs text-stone">
        <Link href="/" className="hover:text-cognac">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Your quote request</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* ── ANG MGA PRODUKTO, BUONG BUILD ── */}
        <div>
          <h1 className="text-2xl font-semibold">Your quote request</h1>
          <p className="mb-5 text-sm text-stone">
            {quote.length} {quote.length === 1 ? "product" : "products"} · one delivery
          </p>

          {quote.map((b, i) => (
            <div key={b.id} className="flex gap-4 border-b border-sand py-5 last:border-0">
              <span className="w-4 shrink-0 pt-1 text-xs tabular-nums text-stone">{i + 1}</span>
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-sand bg-linen">
                {b.image ? <Image src={b.image} alt="" fill sizes="64px" className="object-cover" /> : null}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-semibold">{b.name}</span>
                  {b.category && (
                    <span className="text-[10px] uppercase tracking-widest2 text-stone">{b.category}</span>
                  )}
                  <span className="ml-auto font-bold tabular-nums">
                    {b.build?.priced && b.build?.total ? formatPrice(b.build.total) : "For quotation"}
                  </span>
                  {/* EDIT — balik sa made-to-order ng MISMONG produkto, dala
                      ang slot id: pinapalitan nito ang item na ito imbes na
                      magdagdag ng bago. */}
                  <span className="flex shrink-0 items-center gap-3 text-xs">
                    <Link href={`/products/${b.slug}?edit=${b.id}`} className="font-semibold text-cognac hover:underline">
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeFromQuote(b.id)}
                      aria-label={`Remove ${b.name} from your request`}
                      className="text-stone hover:text-ink"
                    >
                      ✕
                    </button>
                  </span>
                </div>

                {/* BAWAT LINYA, hindi pinutol na buod — dito tinitingnan ng
                    customer kung tama ang pagkakabuo ng pangalawang kama. */}
                {groupLines(b.build?.lines ?? []).map((g) => (
                  <div key={g.title} className="mt-2">
                    <p className="text-[9px] font-extrabold uppercase tracking-widest2 text-cognac">{g.title}</p>
                    <ul className="mt-0.5 space-y-0.5">
                      {g.lines.map((l) => (
                        <li key={l.label} className="text-[12px] leading-snug text-stone">
                          {l.label}
                          {Number(l.price) > 0 && (
                            <span className="ml-1.5 text-[10px] font-semibold text-cognac">
                              +{formatPrice(Number(l.price))}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-4 flex items-baseline border-t-2 border-ink pt-3">
            <span className="text-sm font-bold text-stone">Estimate, before delivery</span>
            <span className="ml-auto text-xl font-extrabold tabular-nums">
              {quoteTotal > 0 ? formatPrice(quoteTotal) : "For quotation"}
            </span>
          </div>
          <p className="mt-2 rounded bg-linen px-3 py-2 text-xs text-stone">
            An estimate only. Our team replies on Messenger with a formal quotation confirming the final total.
          </p>
        </div>

        {/* ── TINATANONG MINSAN, HINDI KADA PRODUKTO ── */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-lg border border-sand p-4">
            <div className="grid grid-cols-[74px_1fr] items-center gap-3 py-1">
              <span className="text-sm text-stone">Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-sand bg-transparent px-3 py-2 text-sm focus:border-cognac focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-[74px_1fr] items-center gap-3 py-1">
              <span className="text-sm text-stone">Mobile</span>
              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                inputMode="tel"
                placeholder="09XX XXX XXXX"
                className="w-full rounded-lg border border-sand bg-transparent px-3 py-2 text-sm focus:border-cognac focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-[74px_1fr] items-center gap-3 py-1">
              <span className="text-sm text-stone">Province</span>
              <select
                value={province}
                onChange={(e) => { setProvince(e.target.value); setCity(""); }}
                className="w-full rounded-lg border border-sand bg-transparent px-3 py-2 text-sm focus:border-cognac focus:outline-none"
              >
                <option value="">Select province…</option>
                {PROVINCES.map((p) => (<option key={p.name} value={p.name}>{p.name}</option>))}
              </select>
            </div>
            <div className="grid grid-cols-[74px_1fr] items-center gap-3 py-1">
              <span className="text-sm text-stone">City</span>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!province}
                className="w-full rounded-lg border border-sand bg-transparent px-3 py-2 text-sm focus:border-cognac focus:outline-none disabled:opacity-50"
              >
                <option value="">{province ? "Select city…" : "Choose a province first"}</option>
                {cityList.map((c) => (<option key={c.name} value={c.name}>{c.name}</option>))}
              </select>
            </div>

            {shipFee !== null && (
              <p className="mt-2 flex items-baseline gap-2 rounded bg-linen px-3 py-2 text-xs">
                <span className="text-stone">Estimated shipping to {city}</span>
                <span className="ml-auto font-bold text-cognac">{formatPrice(shipFee)}</span>
              </p>
            )}
            <p className="mt-2 text-[11px] leading-snug text-stone">
              Delivery is quoted <b className="text-ink">once for the whole request</b> — one van, one fee. Final fee is
              confirmed after we check your exact address.
            </p>
          </div>

          {err && (
            <p className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{err}</p>
          )}

          {handle && (
            <button
              type="button"
              onClick={() => void send()}
              disabled={sending}
              className="mt-3 flex w-full items-center justify-center rounded bg-espresso px-4 py-3 text-base font-medium text-cream transition-colors hover:bg-cognac disabled:cursor-not-allowed disabled:bg-stone/50"
            >
              {sending ? "Sending…" : `Send request · ${quote.length} ${quote.length === 1 ? "product" : "products"}`}
            </button>
          )}
          <Link
            href="/collections/bed"
            className="mt-2 block rounded border border-ink py-3 text-center text-xs font-bold uppercase tracking-widest2 transition-colors hover:bg-ink hover:text-cream"
          >
            Keep browsing
          </Link>
          <p className="mt-2 rounded bg-linen px-3 py-2 text-[11px] text-stone">
            Your builds will be sent to our team on Messenger — we&apos;ll reply there with a formal quotation.
          </p>
        </div>
      </div>
    </div>
  );
}
