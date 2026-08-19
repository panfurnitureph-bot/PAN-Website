"use client";

// MADE-TO-ORDER OPTIONS PANEL (Phase 2, 2026-08-20) — ito ang lumalabas sa
// product page kapag ang item ay may PUBLISHED config sa IMS (Website → MTO
// Configurator, website_item_config). Pumapalit ito sa classic na price/
// colors/sizes/add-ons/buy blocks ng ProductDetail.
//
// Mga patakaran (approved mock):
// • Sizes at CHOICE options = one-line enterprise dropdown (label kaliwa,
//   napili sa gitna, presyo kasama, ✓ sa panel).
// • Fabric = dropdown panel na may search + collection chips + swatch cards
//   na may pangalan; ang fabricsOff at ang leather ban (Sofa/Sofa Bed) ay
//   galing sa config/team rules.
// • Lahat ng on-sizes may presyo → running total + Add to cart / Buy now.
//   May blankong presyo → "Price upon quotation" + Request a Quote
//   (Messenger; papalitan ng MTO webhook sa Phase 3).

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice, swatchLibrary, type LibrarySwatch, type Product, type SiteContent } from "@/lib/products";
import type { MtoAddon, MtoItemConfig } from "@/lib/content";
import { messengerHandle, messengerUrl } from "@/lib/messenger";
import { useStore } from "@/components/store";

// Kolek­syon mula sa pangalan ng swatch ("New Sahara" = dalawang salita).
const colOf = (n: string) => {
  const w = n.trim().split(/\s+/);
  return w[0]?.toLowerCase() === "new" && w[1] ? `${w[0]} ${w[1]}` : (w[0] ?? "");
};
const COLLECTION_ORDER = ["leather", "tanya", "cairo", "madrid", "sofia", "bristol", "lafayette", "feather", "velbert", "tahoe", "new sahara"];
const colRank = (c: string) => {
  const i = COLLECTION_ORDER.indexOf(c.toLowerCase());
  return i < 0 ? 999 : i;
};
// Team rule: bawal ang leather sa Sofa at Sofa Bed.
const noLeatherCategory = (c: string) => c === "Sofa" || c === "Sofa Bed";

// ½-FRACTION display (parehong gawi ng IMS): 3.5 → "3 ½", ±½ ang steps.
function fmtHalf(n: number): string {
  if (!isFinite(n) || n <= 0) return "0";
  const w = Math.floor(n);
  const fr = n - w;
  if (Math.abs(fr - 0.5) < 0.001) return w ? `${w} ½` : "½";
  return String(n);
}
function parseHalf(v: string): number {
  const s = String(v ?? "").trim();
  if (!s) return 0;
  const half = /½/.test(s) || /\b1\/2\b/.test(s) ? 0.5 : 0;
  const m = /([\d.]+)/.exec(s.replace(/\b1\/2\b/, "").replace(/½/, ""));
  return (m ? parseFloat(m[1]) : 0) + half;
}

function SwatchTile({ s, className }: { s: LibrarySwatch; className?: string }) {
  if (s.swatch)
    return (
      <span className={`relative block ${className ?? ""}`}>
        <Image src={s.swatch} alt={s.name} fill className="object-cover" sizes="92px" />
      </span>
    );
  return <span className={`block ${className ?? ""}`} style={{ backgroundColor: s.color ?? "#ddd" }} />;
}

// ── Enterprise dropdown: centered value, chevron kanan, panel na may ✓ ──
function Dropdown({
  label,
  value,
  placeholder,
  options,
  onPick,
  clearable,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: { label: string; note?: string }[];
  onPick: (v: string) => void;
  clearable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const cur = options.find((o) => o.label === value);
  return (
    <div className="grid grid-cols-[110px_1fr] items-center gap-3 py-1.5">
      <span className="text-sm text-stone">{label}</span>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`relative w-full rounded-lg border bg-transparent px-9 py-2.5 text-center text-sm font-semibold transition-colors ${open ? "border-cognac ring-2 ring-cognac/20" : "border-sand hover:border-stone/50"}`}
        >
          {cur ? (
            <>
              {cur.label}
              {cur.note && <span className="ml-1.5 text-xs font-medium text-stone">{cur.note}</span>}
            </>
          ) : (
            <span className="font-normal text-stone/70">{placeholder}</span>
          )}
          <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-stone transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
        </button>
        {open && (
          <div className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-60 overflow-auto rounded-lg border border-sand bg-white p-1 shadow-xl">
            {clearable && (
              <button type="button" onClick={() => { onPick(""); setOpen(false); }} className="relative w-full rounded-md px-8 py-2 text-center text-sm text-stone/70 hover:bg-linen">
                {placeholder}
                {!value && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-bold text-cognac">✓</span>}
              </button>
            )}
            {options.map((o) => {
              const on = o.label === value;
              return (
                <button
                  key={o.label}
                  type="button"
                  onClick={() => { onPick(o.label); setOpen(false); }}
                  className={`relative w-full rounded-md px-8 py-2 text-center text-sm hover:bg-linen ${on ? "bg-linen font-bold" : ""}`}
                >
                  {o.label}
                  {o.note && <span className="ml-1.5 text-xs text-stone">{o.note}</span>}
                  {on && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-bold text-cognac">✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MtoOptions({ cfg, product, site, locked }: { cfg: MtoItemConfig; product: Product; site: SiteContent; locked?: boolean }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const router = useRouter();
  const wished = wishlist.includes(product.slug);

  // ── Options mula sa config ──
  const sizes = cfg.sizes.filter((s) => s.on && s.label.trim());
  const addons = cfg.addons.filter((a) => a.on && a.label.trim());
  const choices = addons.filter((a) => a.type === "CHOICE");
  const checks = addons.filter((a) => a.type === "ADD-ON");
  const fixed = addons.filter((a) => a.type === "FIXED");

  // CHOICE GROUPING (2026-08-20): ang "Legs: Standard" at "Legs: Round" ay
  // IISANG "Legs" dropdown na may dalawang option — hindi tag-isang dropdown.
  // Suportado rin ang single row na "Legs: Standard/Round" (hinahati sa "/").
  type ChoiceOpt = { value: string; full: string; price: number | null };
  const choiceGroups: { name: string; options: ChoiceOpt[] }[] = [];
  for (const c of choices) {
    const m = /^([^:]+):\s*(.+)$/.exec(c.label);
    const gname = m ? m[1].trim() : choiceName(c);
    const optsRaw = m ? m[2].split("/").map((s) => s.trim()).filter(Boolean) : [c.label];
    let g = choiceGroups.find((x) => x.name.toLowerCase() === gname.toLowerCase());
    if (!g) {
      g = { name: gname, options: [] };
      choiceGroups.push(g);
    }
    for (const o of optsRaw) g.options.push({ value: o, full: m ? `${gname}: ${o}` : c.label, price: c.price ?? null });
  }

  // Priced mode: LAHAT ng on-sizes may presyo (>0). Kung walang size rows,
  // priced kapag may base price ang product.
  const priced = sizes.length ? sizes.every((s) => (s.price ?? 0) > 0) : product.price > 0;

  // ── Fabric library — tanggal ang naka-off at ang leather kung bawal ──
  const fabrics = useMemo(
    () =>
      swatchLibrary
        .filter((l) => !cfg.fabricsOff.includes(l.name))
        .filter((l) => !(noLeatherCategory(cfg.category) && /leather/i.test(l.name)))
        .sort((a, b) => colRank(colOf(a.name)) - colRank(colOf(b.name)) || a.name.localeCompare(b.name, undefined, { numeric: true })),
    [cfg],
  );
  const collections = useMemo(() => Array.from(new Set(fabrics.map((l) => colOf(l.name)))), [fabrics]);

  // FIELD rows — itago ang fabric/upholstery na free-text kapag may fabric
  // picker na (doble kung hindi); ang iba (hal. Top Material) ay lalabas.
  const fields = addons
    .filter((a) => a.type === "FIELD")
    .filter((f) => !(fabrics.length > 0 && /fabric|upholster/i.test(f.label)));

  // ── State ──
  const measures = (cfg.measurements ?? []).filter((m) => m.on && m.label.trim());
  const [measVal, setMeasVal] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const m of measures) init[m.label] = m.def ?? 0;
    return init;
  });
  const [size, setSize] = useState(sizes[0]?.label ?? "");
  // Napiling option kada choice group (value = option value, hal. "Standard").
  const [choiceSel, setChoiceSel] = useState<Record<string, string>>({});
  const [checkPick, setCheckPick] = useState<Record<string, boolean>>({});
  const [fieldVal, setFieldVal] = useState<Record<string, string>>({});
  const [fabric, setFabric] = useState("");
  const [fabOpen, setFabOpen] = useState(false);
  const [fabQ, setFabQ] = useState("");
  const [fabCol, setFabCol] = useState("");
  const [qty, setQty] = useState(1);
  // ADD-ONS card collapse (mock: − HIDE / + SHOW)
  const [addOpen, setAddOpen] = useState(true);
  const [added, setAdded] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!fabOpen) return;
    const close = (e: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) setFabOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [fabOpen]);

  const selFabric = fabrics.find((l) => l.name === fabric) ?? null;

  // ── BUILT-IN CATEGORY RULES (team, parehong nasa IMS builder/mock) ──
  // Lift Storage = Platform Style base → bawal drawers/pullout (Tufted lang);
  // pullout dapat kasya sa lapad ng size; leather ↔ Lift ban; drawers /
  // pullout / footboard = tig-iisang pipiliin; below Queen = drawers O
  // pullout lang, hindi pareho.
  const bedW = (() => {
    const m = /(\d+)\s*X\s*\d+/i.exec(size || "");
    return m ? +m[1] : 99;
  })();
  const isLift = (l: string) => /lift/i.test(l);
  const isDrawer = (l: string) => /drawer/i.test(l);
  const isPullout = (l: string) => /pullout/i.test(l);
  const isFootboard = (l: string) => /tufted|footboard/i.test(l);
  const liftOn = checks.some((a) => isLift(a.label) && checkPick[a.label]);
  const leatherFabric = /leather/i.test(fabric);
  function banReason(label: string): string | null {
    if (isLift(label) && leatherFabric) return "not available with leather fabric — change the fabric first";
    if ((isDrawer(label) || isPullout(label)) && liftOn) return "not available with Lift Storage (Tufted only)";
    if (isPullout(label)) {
      const m = /(\d+)\s*X\s*\d+/i.exec(label);
      if (m && +m[1] >= bedW) return `does not fit ${size.split(" ")[0] || "this size"}`;
    }
    return null;
  }
  // Effective pick = naka-check AT hindi banned (auto-lapse kapag nag-iba
  // ang size/fabric/lift at naging bawal).
  const isPicked = (label: string) => !!checkPick[label] && !banReason(label);
  function toggleCheck(label: string) {
    if (banReason(label)) return;
    setCheckPick((p) => {
      const next = { ...p, [label]: !p[label] };
      if (next[label]) {
        // Tig-iisa kada grupo: drawers, pullout, footboard.
        const clearGroup = (test: (l: string) => boolean) => {
          for (const a of checks) if (a.label !== label && test(a.label)) next[a.label] = false;
        };
        if (isDrawer(label)) clearGroup(isDrawer);
        if (isPullout(label)) clearGroup(isPullout);
        if (isFootboard(label)) clearGroup(isFootboard);
        // Below Queen (lapad < 60): drawers O pullout lang — hindi pareho.
        if (bedW < 60) {
          if (isDrawer(label)) clearGroup(isPullout);
          if (isPullout(label)) clearGroup(isDrawer);
        }
      }
      return next;
    });
  }

  // ── Presyo ──
  const sizePrice = sizes.find((s) => s.label === size)?.price ?? (sizes.length ? 0 : product.price);
  const pickedChoices = choiceGroups
    .map((g) => g.options.find((o) => o.value === choiceSel[g.name]))
    .filter((o): o is ChoiceOpt => !!o);
  const addonTotal =
    checks.reduce((sum, a) => (isPicked(a.label) && a.price ? sum + a.price : sum), 0) +
    pickedChoices.reduce((sum, o) => sum + (o.price ?? 0), 0);
  const total = (sizePrice ?? 0) + addonTotal;

  // ── Build summary (cart lines / quote ref) ──
  const pickedAddonLines = [
    ...checks.filter((a) => isPicked(a.label)).map((a) => ({ label: a.label, price: a.price ?? 0 })),
    ...pickedChoices.map((o) => ({ label: o.full, price: o.price ?? 0 })),
  ];
  const fieldLines = fields
    .filter((f) => (fieldVal[f.label] ?? "").trim())
    .map((f) => ({ label: `${f.label}: ${fieldVal[f.label].trim()}`, price: 0 }));
  const measureLines = measures
    .filter((m) => (measVal[m.label] ?? 0) > 0)
    .map((m) => ({ label: `${m.label}: ${fmtHalf(measVal[m.label])} ${m.unit}`, price: 0 }));

  function handleAdd(buyNow: boolean) {
    const baseLabel = [fabric || null, size || null].filter(Boolean).join(" / ") || product.name;
    const addOnLines = [...measureLines, ...pickedAddonLines, ...fieldLines];
    const variantKey = addOnLines.length ? `${baseLabel} + ${addOnLines.map((a) => a.label).join("+")}` : baseLabel;
    addToCart(product.slug, variantKey, qty, total, {
      baseLabel,
      basePrice: sizePrice ?? 0,
      addOns: addOnLines,
    });
    if (buyNow) router.push("/checkout");
    else {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  }

  const handle = messengerHandle((site as unknown as { social?: { facebook?: string } }).social?.facebook);

  // ── REQUEST A QUOTE (Phase 3): ipadala ang build sa PAN app → MTO ref →
  // Messenger redirect (ref mto_<MTO-000042>; fallback mto_<slug>). ──
  const [quoteSending, setQuoteSending] = useState(false);
  const [quoteRef, setQuoteRef] = useState<string | null>(null);
  async function submitQuote() {
    if (!handle) return;
    setQuoteSending(true);
    const buildLines = [
      ...(size ? [{ label: `Size: ${size}`, price: sizes.find((s) => s.label === size)?.price ?? 0 }] : []),
      ...(fabric ? [{ label: `Fabric: ${fabric}`, price: 0 }] : []),
      ...measureLines.map((l) => ({ label: l.label, price: 0 })),
      ...pickedAddonLines.map((l) => ({ label: l.label, price: l.price })),
      ...fieldLines.map((l) => ({ label: l.label, price: 0 })),
    ];
    // Kung may napiling lugar sa shipping estimator, isama — nagiging address
    // hint sa MTO request at basehan ng auto delivery-fee sa quotation.
    let where = "";
    if (shipCity && shipProvince) where = `${shipCity}, ${shipProvince}`;
    else {
      try {
        const saved = JSON.parse(localStorage.getItem("pb_ship_loc") ?? "{}") as { province?: string; city?: string };
        if (saved.city && saved.province) where = `${saved.city}, ${saved.province}`;
      } catch { /* wala pang napiling lugar */ }
    }
    let mtoRef: string | null = null;
    try {
      const res = await fetch("/api/send-mto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: cfg.sku,
          slug: product.slug,
          name: product.name,
          category: cfg.category,
          image: product.images[0] ?? null,
          address: where || null,
          build: { size, fabric, lines: buildLines, total, priced },
        }),
        signal: AbortSignal.timeout(20000),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; mto_number?: string };
      if (data.ok && data.mto_number) mtoRef = data.mto_number;
    } catch {
      /* relay down — Messenger link pa rin ang fallback */
    }
    setQuoteSending(false);
    setQuoteRef(mtoRef);
    const url = messengerUrl(handle, mtoRef ? `mto_${mtoRef}` : `mto_${product.slug}`);
    if (/Android|iPhone|iPad/i.test(navigator.userAgent)) window.location.href = url;
    else window.open(url, "_blank", "noopener,noreferrer");
  }

  // ── READY UNIT (Buy Now — ships this week) ──
  // May stock ang item: default view = ang yari nang unit (as-is specs, unit
  // price, Ships this week, Buy now); ang "MADE TO ORDER — CUSTOMIZE" button
  // ang lumilipat sa configurator, at may "BUY NOW — SHIPS THIS WEEK" pabalik.
  const px = product as unknown as { mtoReadySpecs?: string; mtoReadyPrice?: number };
  const readySpecs = String(px.mtoReadySpecs ?? "")
    .split("\n")
    .map((s) => s.trim().replace(/^[•·\-]\s*/, ""))
    .filter(Boolean);
  const readyPrice = Number(px.mtoReadyPrice ?? product.price ?? 0);
  const readyAvail = (product.stock ?? 0) > 0 && readyPrice > 0;
  // LOCKED (as-is item): laging ready/as-is view — walang customize.
  const [view, setView] = useState<"ready" | "mto">(locked || readyAvail ? "ready" : "mto");
  // Ipaalam sa ProductDetail ang view — "— Made to Order" ang title suffix
  // kapag nasa customize view (gaya ng mock).
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("mto-view", { detail: locked ? "ready" : view }));
  }, [view, locked]);

  function handleBuyReady(buyNow: boolean) {
    addToCart(product.slug, "Ready unit — as configured", qty, readyPrice, {
      baseLabel: "Ready unit — as configured",
      basePrice: readyPrice,
      addOns: readySpecs.map((l) => ({ label: l, price: 0 })),
    });
    if (buyNow) router.push("/checkout");
    else {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  }

  // ── Shipping estimator (kapareho ng classic page; rates sa site.json) ──
  const SHIP_PROVINCES = ((site as unknown as { shipping?: { provinces?: { name: string; cities: { name: string; fee: number }[] }[] } }).shipping?.provinces ?? []);
  const [shipOpen, setShipOpen] = useState(false);
  const [shipProvince, setShipProvince] = useState("");
  const [shipCity, setShipCity] = useState("");
  const shipCityList = SHIP_PROVINCES.find((p) => p.name === shipProvince)?.cities ?? [];
  const shipFee = shipCityList.find((c) => c.name === shipCity)?.fee ?? null;
  const shipBlock = (
    <div className="mt-4 text-sm">
      <button type="button" onClick={() => setShipOpen((v) => !v)} className="flex items-center gap-2 text-ink hover:text-cognac transition-colors">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-olive">
          <path d="M1 7h12v9H1zM13 10h5l3 3v3h-8z" />
          <circle cx="6" cy="18" r="1.8" />
          <circle cx="17" cy="18" r="1.8" />
        </svg>
        <span className="border-b border-ink/40">Estimate your shipping</span>
        <span className="text-stone text-xs">{shipOpen ? "▲" : "▼"}</span>
      </button>
      {shipOpen && (
        <div className="mt-3 border border-stone/25 rounded p-3 bg-linen/40 space-y-2">
          <select value={shipProvince} onChange={(e) => { setShipProvince(e.target.value); setShipCity(""); }} className="w-full border border-stone/30 bg-white px-3 py-2 text-sm rounded focus:outline-none focus:border-cognac">
            <option value="">Select province</option>
            {SHIP_PROVINCES.map((p) => (<option key={p.name} value={p.name}>{p.name}</option>))}
          </select>
          <select
            value={shipCity}
            disabled={!shipProvince}
            onChange={(e) => { setShipCity(e.target.value); try { localStorage.setItem("pb_ship_loc", JSON.stringify({ province: shipProvince, city: e.target.value })); } catch {} }}
            className="w-full border border-stone/30 bg-white px-3 py-2 text-sm rounded focus:outline-none focus:border-cognac disabled:bg-sand/40 disabled:text-stone"
          >
            <option value="">{shipProvince ? "Select city / town" : "Select a province first"}</option>
            {shipCityList.map((c) => (<option key={c.name} value={c.name}>{c.name}</option>))}
          </select>
          {shipFee !== null && (
            <div className="pt-2 border-t border-sand space-y-1.5">
              <p className="flex justify-between items-baseline">
                <span className="text-stone">Estimated shipping to {shipCity}</span>
                <span className="font-bold text-cognac">{formatPrice(shipFee)}</span>
              </p>
              <p className="text-[11px] text-stone leading-snug">
                Estimate only. Final fee is confirmed after we check your exact address — you&apos;ll pin your location at
                checkout. Far-end or boundary areas may differ.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const heartBtn = (
    <button
      onClick={() => toggleWishlist(product.slug)}
      aria-label="Add to wishlist"
      className="border border-stone/40 rounded px-4 hover:border-cognac"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill={wished ? "#B87333" : "none"} stroke={wished ? "#B87333" : "#1A1A1A"} strokeWidth="1.6">
        <path d="M12 21C7 16.5 3 13 3 8.8 3 6 5.2 4 7.8 4c1.7 0 3.2.9 4.2 2.3C13 4.9 14.5 4 16.2 4 18.8 4 21 6 21 8.8c0 4.2-4 7.7-9 12.2z" />
      </svg>
    </button>
  );

  // Availability card — nagpapalit ang delivery text ayon sa view at stock.
  const shipsNow = view === "ready" && (product.stock ?? 0) > 0;
  const etaCard = (
    <div className="mt-4 border border-sand rounded-lg overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 bg-green-50/60 border-b border-sand">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-60 animate-ping" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-600" />
        </span>
        <span className="text-sm font-bold text-green-800">{shipsNow ? "In stock" : "Made to order"}</span>
      </div>
      <div className="px-4 py-3 text-sm">
        {shipsNow ? (
          <>
            <p className="font-medium text-ink">Ships this week</p>
            <p className="text-xs text-stone">Ready unit — in stock in San Pedro, Laguna</p>
          </>
        ) : (
          <>
            <p className="font-medium text-ink">Delivery in 4–6 weeks</p>
            <p className="text-xs text-stone">Made to order in San Pedro, Laguna</p>
          </>
        )}
      </div>
    </div>
  );

  if (locked || view === "ready") {
    return (
      <div>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-3xl font-bold">{formatPrice(readyPrice)}</span>
        </div>
        <hr className="border-sand my-5" />
        {/* As-is spec sheet ng yari nang unit — MOCK STYLE: bold value + gray
            label sub, presyo/"included" sa kanan (galing sa config prices). */}
        {readySpecs.length > 0 && (
          <div className="rounded-lg border border-sand overflow-hidden">
            <div className="p-3 space-y-2">
              {readySpecs.map((l) => {
                const m = /^([^:]+):\s*(.+)$/.exec(l);
                const label = m ? m[1].trim() : "";
                const value = m ? m[2].trim() : l;
                // Hanapin ang presyo ng linyang ito sa config: size price,
                // add-on +₱, choice option, o "included".
                let price = "";
                if (/^size$/i.test(label)) {
                  const sz = sizes.find((s) => s.label.toLowerCase() === value.toLowerCase() || s.label.toLowerCase().startsWith(value.toLowerCase().split(" ")[0]));
                  if (sz && (sz.price ?? 0) > 0) price = formatPrice(sz.price!);
                } else {
                  const ad = addons.find((a) => a.label.toLowerCase() === l.toLowerCase() || a.label.toLowerCase() === value.toLowerCase());
                  if (ad) price = (ad.price ?? 0) > 0 ? `+${formatPrice(ad.price!)}` : "included";
                  else {
                    let hit: ChoiceOpt | undefined;
                    for (const g of choiceGroups) {
                      hit = g.options.find((o) => o.full.toLowerCase() === l.toLowerCase() || (g.name.toLowerCase() === label.toLowerCase() && o.value.toLowerCase() === value.toLowerCase()));
                      if (hit) break;
                    }
                    if (hit) price = (hit.price ?? 0) > 0 ? `+${formatPrice(hit.price!)}` : "included";
                    else if (/color|fabric|upholster/i.test(label)) price = "included";
                  }
                }
                return (
                  <div key={l} className="flex items-center gap-3 rounded border border-sand bg-transparent px-4 py-3 text-sm">
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold leading-tight">{value}</span>
                      {label && <span className="block text-xs text-stone">{label}</span>}
                    </span>
                    {price && (
                      <span className={`shrink-0 ${price === "included" ? "text-xs text-stone" : "font-bold"}`}>{price}</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 border-t border-sand bg-linen px-4 py-2">
              <span className="rounded bg-espresso px-2 py-0.5 text-[9px] font-extrabold tracking-widest2 text-cream">AS-IS</span>
              <span className="text-xs text-stone">Built exactly as specified — this unit is ready for delivery.</span>
            </div>
          </div>
        )}
        {shipBlock}
        {etaCard}
        <div className="mt-3 flex gap-3">
          <div className="flex items-center rounded border border-stone/40">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 hover:text-cognac" aria-label="Decrease quantity">−</button>
            <span className="w-8 text-center text-sm">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="px-4 py-3 hover:text-cognac" aria-label="Increase quantity">+</button>
          </div>
          <button onClick={() => handleBuyReady(false)} className="flex-1 rounded border border-espresso px-4 py-3 text-base font-medium text-espresso transition-colors hover:bg-espresso hover:text-cream">
            {added ? "✓ Added to Cart" : "Add to cart"}
          </button>
          <button onClick={() => handleBuyReady(true)} className="flex-1 rounded bg-espresso px-4 py-3 text-base font-medium text-cream transition-colors hover:bg-cognac">
            Buy now
          </button>
          {heartBtn}
        </div>
        {!locked && (
          <button
            onClick={() => setView("mto")}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded border border-ink py-3 px-4 text-sm font-bold tracking-widest2 transition-colors hover:bg-ink hover:text-cream"
          >
            ✎ MADE TO ORDER — CUSTOMIZE
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* ── PRICE CARD ── */}
      <div className="flex items-baseline gap-3 flex-wrap">
        {priced ? (
          <>
            <span className="text-3xl font-bold">{formatPrice(total)}</span>
            <span className="text-xs text-stone">starting · changes per size/add-on</span>
          </>
        ) : (
          <>
            <span className="text-2xl font-bold">Price upon quotation</span>
            <span className="text-xs text-stone">the team will send it via Messenger after reviewing your build</span>
          </>
        )}
      </div>
      <hr className="border-sand my-5" />

      {/* ── MEASUREMENTS — one-line ±½ steppers ("3 ½") ── */}
      {measures.length > 0 && (
        <div className="mb-3 rounded-lg border border-sand px-4 py-2">
          <p className="mb-1 text-sm">Measurements</p>
          {measures.map((m) => {
            const v = measVal[m.label] ?? 0;
            return (
              <div key={m.label} className="grid grid-cols-[110px_1fr] items-center gap-3 border-b border-dashed border-sand py-1.5 last:border-b-0">
                <span className="text-sm text-stone">{m.label}</span>
                <div className="flex max-w-[220px] items-stretch">
                  <button
                    type="button"
                    onClick={() => setMeasVal((p) => ({ ...p, [m.label]: Math.max(0, (p[m.label] ?? 0) - 0.5) }))}
                    className="w-9 rounded-l border border-sand font-bold hover:text-cognac"
                    aria-label={`Decrease ${m.label}`}
                  >
                    −
                  </button>
                  <input
                    value={fmtHalf(v)}
                    onChange={(e) => setMeasVal((p) => ({ ...p, [m.label]: parseHalf(e.target.value) }))}
                    inputMode="decimal"
                    className="w-full min-w-0 border-y border-sand bg-transparent text-center text-sm font-semibold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setMeasVal((p) => ({ ...p, [m.label]: (p[m.label] ?? 0) + 0.5 }))}
                    className="w-9 rounded-r border border-sand font-bold hover:text-cognac"
                    aria-label={`Increase ${m.label}`}
                  >
                    +
                  </button>
                  <span className="ml-2 self-center text-xs text-stone">{m.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── SIZE dropdown ── */}
      {sizes.length > 0 && (
        <div className="mb-3 rounded-lg border border-sand px-4 py-2">
        <Dropdown
          label="Size"
          value={size}
          placeholder="Select size…"
          options={sizes.map((s) => ({ label: s.label, note: (s.price ?? 0) > 0 ? formatPrice(s.price!) : undefined }))}
          onPick={(v) => {
            setSize(v);
            // Pareho ng classic size chips: ang Dimensions tab (FrameDiagram)
            // ay sumusunod sa napiling size via pb-size-change.
            window.dispatchEvent(new CustomEvent("pb-size-change", { detail: v.split(" ")[0] }));
          }}
        />
        </div>
      )}

      {/* ── CHOICE dropdowns — isang dropdown kada group, options sa loob ── */}
      {choiceGroups.map((g) => (
        <div key={g.name} className="mb-3 rounded-lg border border-sand px-4 py-2">
        <Dropdown
          key={g.name}
          label={g.name}
          value={choiceSel[g.name] ?? ""}
          placeholder={`Select ${g.name.toLowerCase()}…`}
          options={g.options.map((o) => ({ label: o.value, note: (o.price ?? 0) > 0 ? `+${formatPrice(o.price!)}` : undefined }))}
          onPick={(v) => setChoiceSel((p) => ({ ...p, [g.name]: v }))}
          clearable
        />
        </div>
      ))}

      {/* ── FABRIC dropdown panel ── */}
      {fabrics.length > 0 && (
        <div className="mb-3 rounded-lg border border-sand px-4 py-2">
        <div className="grid grid-cols-[110px_1fr] items-center gap-3 py-1.5">
          <span className="text-sm text-stone">Fabric</span>
          <div ref={fabRef} className="relative">
            <button
              type="button"
              onClick={() => setFabOpen((v) => !v)}
              className={`relative flex w-full items-center justify-center gap-2 rounded-lg border bg-transparent px-9 py-2.5 text-sm font-semibold transition-colors ${fabOpen ? "border-cognac ring-2 ring-cognac/20" : "border-sand hover:border-stone/50"}`}
            >
              {selFabric ? (
                <>
                  <SwatchTile s={selFabric} className="h-[18px] w-[18px] shrink-0 overflow-hidden rounded border border-black/10" />
                  <span className="truncate">{selFabric.name}</span>
                </>
              ) : (
                <span className="font-normal text-stone/70">Select fabric…</span>
              )}
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-stone transition-transform ${fabOpen ? "rotate-180" : ""}`}>▾</span>
            </button>
            {fabOpen && (
              <div className="absolute right-0 top-full z-30 mt-1.5 w-[330px] max-w-[92vw] rounded-lg border border-sand bg-white p-2.5 shadow-xl">
                <input
                  value={fabQ}
                  onChange={(e) => setFabQ(e.target.value)}
                  placeholder="Search color…"
                  className="mb-2 w-full rounded-md border border-sand px-3 py-1.5 text-sm focus:border-cognac focus:outline-none"
                />
                <div className="mb-2 flex gap-1 overflow-x-auto pb-1">
                  {["", ...collections].map((c) => {
                    const on = fabCol === c;
                    return (
                      <button
                        key={c || "all"}
                        type="button"
                        onClick={() => setFabCol(on && c ? "" : c)}
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${on || (!fabCol && !c) ? "border-espresso bg-espresso text-cream" : "border-sand bg-white text-stone hover:bg-linen"}`}
                      >
                        {c || "All"}
                      </button>
                    );
                  })}
                </div>
                <div className="flex max-h-56 flex-wrap content-start gap-1.5 overflow-auto">
                  {fabrics
                    .filter((l) => !fabCol || colOf(l.name) === fabCol)
                    .filter((l) => !fabQ.trim() || l.name.toLowerCase().includes(fabQ.trim().toLowerCase()))
                    .map((l) => {
                      const on = l.name === fabric;
                      // Leather ↔ Lift Storage ban (team rule) — disabled ang
                      // leather habang naka-Lift.
                      const leatherBan = liftOn && /leather/i.test(l.name);
                      return (
                        <button
                          key={l.name}
                          type="button"
                          disabled={leatherBan}
                          onClick={() => { if (leatherBan) return; setFabric(on ? "" : l.name); setFabOpen(false); }}
                          title={leatherBan ? `${l.name} — not available with Lift Storage` : l.name}
                          className={`w-[92px] flex-none overflow-hidden rounded-md bg-white text-center ${leatherBan ? "cursor-not-allowed border border-sand opacity-30" : on ? "border-2 border-cognac ring-2 ring-cognac/20" : "border border-sand hover:border-cognac"}`}
                        >
                          <SwatchTile s={l} className="h-9 w-full" />
                          <span className={`block truncate px-1 py-0.5 text-[9px] leading-tight ${on ? "font-bold text-ink" : "text-stone"}`}>
                            {l.name}
                            {on ? " ✓" : ""}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* ── FIELD inputs ── */}
      {fields.map((f) => (
        <div key={f.label} className="mb-3 rounded-lg border border-sand px-4 py-2">
        <div className="grid grid-cols-[110px_1fr] items-center gap-3 py-1.5">
          <span className="text-sm text-stone">{f.label.split("—")[0].split(":")[0].trim()}</span>
          <input
            value={fieldVal[f.label] ?? ""}
            onChange={(e) => setFieldVal((p) => ({ ...p, [f.label]: e.target.value }))}
            placeholder={f.label}
            className="w-full rounded-lg border border-sand bg-transparent px-3 py-2.5 text-sm focus:border-cognac focus:outline-none"
          />
        </div>
        </div>
      ))}

      {/* ── ADD-ON checkbox rows ── */}
      {checks.length > 0 && (
        <div className="mb-3 overflow-hidden rounded-lg border border-sand">
          <button type="button" onClick={() => setAddOpen((v) => !v)} className="flex w-full items-center gap-2 border-b border-sand bg-linen px-4 py-2.5 text-left">
            <span className="text-xs font-bold tracking-widest2">ADD-ONS</span>
            <span className="rounded bg-cognac/10 px-2 py-0.5 text-[10px] font-bold tracking-widest2 text-cognac">{checks.filter((a) => isPicked(a.label)).length} SELECTED</span>
            <span className="ml-auto text-xs text-stone">{addOpen ? "− HIDE" : "+ SHOW"}</span>
          </button>
          {addOpen && (
          <div className="p-3">
          <div className="space-y-2">
            {checks.map((a) => {
              const ban = banReason(a.label);
              const on = isPicked(a.label);
              return (
                <label
                  key={a.label}
                  className={`flex items-center gap-3 rounded border px-4 py-3 text-sm transition-colors ${ban ? "cursor-not-allowed border-stone/20 opacity-50" : on ? "cursor-pointer border-cognac bg-cognac/5" : "cursor-pointer border-stone/30 hover:border-stone/60"}`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={!!ban}
                    onChange={() => toggleCheck(a.label)}
                    className="accent-cognac"
                  />
                  <span className="min-w-0 flex-1">
                    {/* RED STRIKETHROUGH sa banned — mabilis maintindihang bawal */}
                    {ban ? <s className="decoration-red-600 decoration-2">{a.label}</s> : a.label}
                    {ban && <span className="block text-xs text-stone">{ban}</span>}
                  </span>
                  {(a.price ?? 0) > 0 ? (
                    <span className="shrink-0 font-bold">+{formatPrice(a.price!)}</span>
                  ) : (
                    <span className="shrink-0 text-xs text-stone">confirmed on order</span>
                  )}
                </label>
              );
            })}
          </div>
          {liftOn && (
            <p className="mt-2 rounded bg-linen px-3 py-2 text-xs text-stone">
              Lift Storage — Platform Style base; drawers/pullout are no longer available (Tufted only).
            </p>
          )}
          </div>
          )}
        </div>
      )}

      {/* ── FIXED as-is rows ── */}
      {fixed.map((f) => (
        <div key={f.label} className="mt-2 flex items-center gap-2 rounded border border-dashed border-olive/60 bg-linen px-3 py-2 text-sm">
          <span className="min-w-0 flex-1">{f.label}</span>
          <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-widest2 text-olive">as-is</span>
        </div>
      ))}

      {shipBlock}
      {etaCard}

      {/* ── QTY + BUY / QUOTE ── */}
      <div className="mt-3 flex gap-3">
        <div className="flex items-center rounded border border-stone/40">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 hover:text-cognac" aria-label="Decrease quantity">−</button>
          <span className="w-8 text-center text-sm">{qty}</span>
          <button onClick={() => setQty(qty + 1)} className="px-4 py-3 hover:text-cognac" aria-label="Increase quantity">+</button>
        </div>
        {/* MADE TO ORDER = laging Request a Quote (mock behavior) — Phase 3:
            ipinapadala muna ang BUONG build sa PAN app (MTO request), saka
            nire-redirect sa Messenger na may ref mto_<MTO-number> para
            ma-echo ng IMS ang build sa thread. */}
        {handle && (
          <button
            type="button"
            disabled={quoteSending}
            onClick={() => void submitQuote()}
            className="flex flex-1 items-center justify-center rounded bg-espresso px-4 py-3 text-base font-medium text-cream transition-colors hover:bg-cognac disabled:opacity-60"
          >
            {quoteSending ? "Sending…" : "Request a Quote"}
          </button>
        )}
        {heartBtn}
      </div>
      {quoteRef && (
        <p className="mt-2 rounded border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-800">
          ✓ Quote request sent — {quoteRef} · opening Messenger…
        </p>
      )}
      <p className="mt-2 rounded bg-linen px-3 py-2 text-xs text-stone">
        Your build ({[size, fabric].filter(Boolean).join(" · ") || "current selections"}) will be sent to our team on
        Messenger — we&apos;ll reply with a formal quotation{priced ? " confirming the final total" : ""}.
      </p>
      {/* Balik sa yari nang unit — same button style ng CUSTOMIZE */}
      {readyAvail && (
        <button
          onClick={() => setView("ready")}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded border border-ink py-3 px-4 text-sm font-bold tracking-widest2 transition-colors hover:bg-ink hover:text-cream"
        >
          ● BUY NOW — SHIPS THIS WEEK
        </button>
      )}
    </div>
  );
}

// "Wood Stain (6 stains)" → "Wood Stain"; "Design: Banana/…" → "Design".
function choiceName(a: MtoAddon): string {
  return a.label.split("(")[0].split(":")[0].split("—")[0].trim() || a.label;
}
