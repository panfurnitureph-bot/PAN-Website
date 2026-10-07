"use client";

// CATEGORY ROWS (2026-09-04) — "Chairs · Swivel 9 | Dining 6 | …" na hilera
// kada grupo, awtomatiko: lumalabas lang ang row kapag ≥ minProducts ang
// buong grupo; nakatago ang tab na walang laman. Unang tab = pinakamarami.
// Ang grupo at tabs ay sa IMS → Website → Homepage.

import { useState } from "react";
import Rail from "./Rail";
import ProductCard from "@/components/ProductCard";
import { CATEGORY_TILES, DECOR_CATEGORIES, type HomepageContent, type Product } from "@/lib/products";

type Row = { title: string; tabs: { label: string; slug: string }[] };

export default function CategoryRows({ products, config }: { products: Product[]; config?: HomepageContent["categoryRows"] }) {
  const min = config?.minProducts ?? 4;
  const rows: Row[] = (config?.rows ?? []) as Row[];
  const built = rows
    .map((r) => {
      const tabs = r.tabs
        .map((t) => ({ ...t, items: products.filter((p) => p.category === t.slug) }))
        .filter((t) => t.items.length > 0)
        .sort((a, b) => b.items.length - a.items.length);
      const total = new Set(tabs.flatMap((t) => t.items.map((p) => p.slug))).size;
      return { title: r.title, tabs, total };
    })
    .filter((r) => r.total >= min && r.tabs.length > 0);
  // LAHAT NG MAY PRODUKTO AY LUMALABAS (Joe 2026-10-08, "para sure lalabas lahat
  // ung product"): ang category na may produkto pero wala sa alinmang row ng
  // IMS → Website → Homepage ay kusang nakukuha: ang decor (mugs, lamp, vase,
  // figurines) bilang "Decoration" na row, ang iba bilang "More". Parehong min.
  const covered = new Set(rows.flatMap((r) => r.tabs.map((t) => t.slug)));
  const left = [...new Set(products.map((p) => p.category))].filter((c) => c && !covered.has(c));
  const labelOf = (c: string) => CATEGORY_TILES.find((t) => t.slug === c)?.label ?? c.replace(/-/g, " ").replace(/\w/g, (ch) => ch.toUpperCase());
  const auto = (title: string, cats: string[]) => {
    const tabs = cats.map((c) => ({ label: labelOf(c), slug: c, items: products.filter((p) => p.category === c) })).filter((t) => t.items.length > 0).sort((a, b) => b.items.length - a.items.length);
    return { title, tabs, total: tabs.reduce((n, t) => n + t.items.length, 0) };
  };
  for (const r of [auto("Decoration", left.filter((c) => DECOR_CATEGORIES.includes(c))), auto("More", left.filter((c) => !DECOR_CATEGORIES.includes(c)))]) {
    if (r.total >= min && r.tabs.length > 0 && !built.some((b) => b.title === r.title)) built.push(r);
  }
  if (!built.length) return null;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col gap-12 md:gap-14 py-12 md:py-14">
      {built.map((r) => <RowView key={r.title} row={r} />)}
    </div>
  );
}

function RowView({ row }: { row: { title: string; tabs: { label: string; slug: string; items: Product[] }[] } }) {
  const [tab, setTab] = useState(0);
  const t = row.tabs[tab] ?? row.tabs[0];
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-1 flex-wrap">
        <div>
          <i className="pf-rule mb-3" />
          <h2 className="font-cormorant font-semibold text-[clamp(24px,2.7vw,32px)] leading-[1.1] tracking-[-0.02em]">{row.title}</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          {row.tabs.map((x, i) => (
            <button key={x.slug} type="button" onClick={() => setTab(i)} className={`h-9 rounded-full px-4 text-[13px] font-semibold transition-colors ${i === tab ? "pf-dark" : "bg-white text-ink shadow-[inset_0_0_0_1px_#E0D5C1] hover:shadow-[inset_0_0_0_1px_#B08A3E]"}`}>
              {x.label} <span className={`font-normal ml-1 tabular-nums ${i === tab ? "text-gold" : "text-stone"}`}>{x.items.length}</span>
            </button>
          ))}
        </div>
      </div>
      <Rail key={t.slug} title="" link={{ label: `All ${t.label} →`, href: `/collections/${t.slug}` }} autoplay={false}>
        {t.items.map((p) => <ProductCard key={p.slug} product={p} showStock />)}
      </Rail>
    </section>
  );
}
