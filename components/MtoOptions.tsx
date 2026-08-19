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

export default function MtoOptions({ cfg, product, site }: { cfg: MtoItemConfig; product: Product; site: SiteContent }) {
  const { addToCart } = useStore();
  const router = useRouter();

  // ── Options mula sa config ──
  const sizes = cfg.sizes.filter((s) => s.on && s.label.trim());
  const addons = cfg.addons.filter((a) => a.on && a.label.trim());
  const choices = addons.filter((a) => a.type === "CHOICE");
  const checks = addons.filter((a) => a.type === "ADD-ON");
  const fields = addons.filter((a) => a.type === "FIELD");
  const fixed = addons.filter((a) => a.type === "FIXED");

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

  // ── State ──
  const [size, setSize] = useState(sizes[0]?.label ?? "");
  const [choicePick, setChoicePick] = useState<Record<string, boolean>>({});
  const [checkPick, setCheckPick] = useState<Record<string, boolean>>({});
  const [fieldVal, setFieldVal] = useState<Record<string, string>>({});
  const [fabric, setFabric] = useState("");
  const [fabOpen, setFabOpen] = useState(false);
  const [fabQ, setFabQ] = useState("");
  const [fabCol, setFabCol] = useState("");
  const [qty, setQty] = useState(1);
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

  // ── Presyo ──
  const sizePrice = sizes.find((s) => s.label === size)?.price ?? (sizes.length ? 0 : product.price);
  const addonTotal = addons.reduce((sum, a) => {
    const on = a.type === "ADD-ON" ? checkPick[a.label] : a.type === "CHOICE" ? choicePick[a.label] : false;
    return on && a.price ? sum + a.price : sum;
  }, 0);
  const total = (sizePrice ?? 0) + addonTotal;

  // ── Build summary (cart lines / quote ref) ──
  const pickedAddonLines = addons
    .filter((a) => (a.type === "ADD-ON" ? checkPick[a.label] : a.type === "CHOICE" ? choicePick[a.label] : false))
    .map((a) => ({ label: a.label, price: a.price ?? 0 }));
  const fieldLines = fields
    .filter((f) => (fieldVal[f.label] ?? "").trim())
    .map((f) => ({ label: `${f.label}: ${fieldVal[f.label].trim()}`, price: 0 }));

  function handleAdd(buyNow: boolean) {
    const baseLabel = [fabric || null, size || null].filter(Boolean).join(" / ") || product.name;
    const addOnLines = [...pickedAddonLines, ...fieldLines];
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

      {/* ── SIZE dropdown ── */}
      {sizes.length > 0 && (
        <Dropdown
          label="Size"
          value={size}
          placeholder="Select size…"
          options={sizes.map((s) => ({ label: s.label, note: (s.price ?? 0) > 0 ? formatPrice(s.price!) : undefined }))}
          onPick={setSize}
        />
      )}

      {/* ── CHOICE dropdowns (isang linya bawat isa) ── */}
      {choices.map((c) => (
        <Dropdown
          key={c.label}
          label={choiceName(c)}
          value={choicePick[c.label] ? c.label : ""}
          placeholder={`Select ${choiceName(c).toLowerCase()}…`}
          options={[{ label: c.label, note: (c.price ?? 0) > 0 ? `+${formatPrice(c.price!)}` : undefined }]}
          onPick={(v) => setChoicePick((p) => ({ ...p, [c.label]: v !== "" }))}
          clearable
        />
      ))}

      {/* ── FABRIC dropdown panel ── */}
      {fabrics.length > 0 && (
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
                      return (
                        <button
                          key={l.name}
                          type="button"
                          onClick={() => { setFabric(on ? "" : l.name); setFabOpen(false); }}
                          title={l.name}
                          className={`w-[92px] flex-none overflow-hidden rounded-md bg-white text-center ${on ? "border-2 border-cognac ring-2 ring-cognac/20" : "border border-sand hover:border-cognac"}`}
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
      )}

      {/* ── FIELD inputs ── */}
      {fields.map((f) => (
        <div key={f.label} className="grid grid-cols-[110px_1fr] items-center gap-3 py-1.5">
          <span className="text-sm text-stone">{f.label.split("—")[0].split(":")[0].trim()}</span>
          <input
            value={fieldVal[f.label] ?? ""}
            onChange={(e) => setFieldVal((p) => ({ ...p, [f.label]: e.target.value }))}
            placeholder={f.label}
            className="w-full rounded-lg border border-sand bg-transparent px-3 py-2.5 text-sm focus:border-cognac focus:outline-none"
          />
        </div>
      ))}

      {/* ── ADD-ON checkbox rows ── */}
      {checks.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm">
            Add-ons{" "}
            <span className="rounded bg-cognac/10 px-2 py-0.5 text-[11px] font-bold text-cognac">
              {checks.filter((a) => checkPick[a.label]).length} selected
            </span>
          </p>
          <div className="space-y-2">
            {checks.map((a) => {
              const on = !!checkPick[a.label];
              return (
                <label
                  key={a.label}
                  className={`flex cursor-pointer items-center gap-3 rounded border px-4 py-3 text-sm transition-colors ${on ? "border-cognac bg-cognac/5" : "border-stone/30 hover:border-stone/60"}`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => setCheckPick((p) => ({ ...p, [a.label]: !on }))}
                    className="accent-cognac"
                  />
                  <span className="min-w-0 flex-1">{a.label}</span>
                  {(a.price ?? 0) > 0 ? (
                    <span className="shrink-0 font-bold">+{formatPrice(a.price!)}</span>
                  ) : (
                    <span className="shrink-0 text-xs text-stone">confirmed on order</span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* ── FIXED as-is rows ── */}
      {fixed.map((f) => (
        <div key={f.label} className="mt-2 flex items-center gap-2 rounded border border-dashed border-olive/60 bg-linen px-3 py-2 text-sm">
          <span className="min-w-0 flex-1">{f.label}</span>
          <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-widest2 text-olive">as-is</span>
        </div>
      ))}

      {/* ── QTY + BUY / QUOTE ── */}
      <div className="mt-5 flex gap-3">
        <div className="flex items-center rounded border border-stone/40">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 hover:text-cognac" aria-label="Decrease quantity">−</button>
          <span className="w-8 text-center text-sm">{qty}</span>
          <button onClick={() => setQty(qty + 1)} className="px-4 py-3 hover:text-cognac" aria-label="Increase quantity">+</button>
        </div>
        {priced ? (
          <>
            <button
              onClick={() => handleAdd(false)}
              className="flex-1 rounded border border-espresso px-4 py-3 text-base font-medium text-espresso transition-colors hover:bg-espresso hover:text-cream"
            >
              {added ? "✓ Added to Cart" : "Add to cart"}
            </button>
            <button
              onClick={() => handleAdd(true)}
              className="flex-1 rounded bg-espresso px-4 py-3 text-base font-medium text-cream transition-colors hover:bg-cognac"
            >
              Buy now
            </button>
          </>
        ) : (
          handle && (
            <a
              href={messengerUrl(handle, `mto_${product.slug}`)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
                  e.preventDefault();
                  window.location.href = messengerUrl(handle, `mto_${product.slug}`);
                }
              }}
              className="flex flex-1 items-center justify-center rounded bg-espresso px-4 py-3 text-base font-medium text-cream transition-colors hover:bg-cognac"
            >
              Request a Quote
            </a>
          )
        )}
      </div>
      {!priced && (
        <p className="mt-2 rounded bg-linen px-3 py-2 text-xs text-stone">
          Your build ({[size, fabric].filter(Boolean).join(" · ") || "current selections"}) will be sent to our team on
          Messenger — we&apos;ll reply with a formal quotation.
        </p>
      )}
    </div>
  );
}

// "Wood Stain (6 stains)" → "Wood Stain"; "Design: Banana/…" → "Design".
function choiceName(a: MtoAddon): string {
  return a.label.split("(")[0].split(":")[0].split("—")[0].trim() || a.label;
}
