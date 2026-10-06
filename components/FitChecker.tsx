"use client";

// FIT CHECKER (2026-09-04, measuring page mockup) — ilagay ang pinakamasikip
// na daanan (lapad × taas) at agad nakalista ang LAHAT ng produkto: Fits
// upright / Passes tilted (diagonal) / Will not pass. Ang packaged size ay
// sukat ng produkto + ~2" kada gilid, mula sa Product Management.

import { useState } from "react";

export type FitItem = { name: string; w: number; d: number; h: number };

const WHERE = ["Main door", "Bedroom door", "Hallway turn", "Stairs / landing", "Elevator"];

export default function FitChecker({ items }: { items: FitItem[] }) {
  const [w, setW] = useState(""), [h, setH] = useState(""), [where, setWhere] = useState(WHERE[0]);
  const W = Number(w), H = Number(h);
  const bad = W && H && (W < 12 || W > 120 || H < 24 || H > 144);
  const diag = Math.sqrt(W * W + H * H);
  const rows = items.map((p) => {
    const d = [p.w, p.d, p.h].sort((a, b) => a - b), s = d[0], m = d[1];
    const fits = (s <= W && m <= H) || (s <= H && m <= W);
    const tilted = !fits && s <= W && m <= diag * 0.95;
    return { ...p, kind: (fits ? "ok" : tilted ? "tight" : "no") as "ok" | "tight" | "no" };
  });
  const groups = [
    ["ok", "Fits upright", "Fits"],
    ["tight", "Passes tilted — send us a photo", "Tilted only"],
    ["no", "Will not pass this opening", "Won't pass"],
  ] as const;
  const tone = { ok: "border-l-[#7FC29B]", tight: "border-l-gold", no: "border-l-[#E08B7E] opacity-75" };
  const tag = { ok: "bg-[#1D2F25] text-[#7FC29B]", tight: "bg-[#33291A] text-gold", no: "bg-[#3A2320] text-[#E08B7E]" };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
      <label className="flex flex-col gap-1.5 text-[12px] font-semibold text-ink">Opening width
        <span className="relative block">
          <input value={w} onChange={(e) => setW(e.target.value)} type="number" inputMode="decimal" min={12} max={120} placeholder="e.g. 32" className="h-11 w-full rounded-xl bg-white shadow-[inset_0_0_0_1px_#D8CCB9] transition-shadow hover:shadow-[inset_0_0_0_1px_#B08A3E] focus:outline-none focus:shadow-[inset_0_0_0_1.5px_#B08A3E,0_0_0_3px_rgba(226,194,122,.3)] text-cream placeholder:text-cream/40 px-3 pr-10 text-sm" />
          <i className="absolute right-3 top-1/2 -translate-y-1/2 not-italic text-xs text-stone">in</i>
        </span>
      </label>
      <label className="flex flex-col gap-1.5 text-[12px] font-semibold text-ink">Opening height
        <span className="relative block">
          <input value={h} onChange={(e) => setH(e.target.value)} type="number" inputMode="decimal" min={24} max={144} placeholder="e.g. 80" className="h-11 w-full rounded-xl bg-white shadow-[inset_0_0_0_1px_#D8CCB9] transition-shadow hover:shadow-[inset_0_0_0_1px_#B08A3E] focus:outline-none focus:shadow-[inset_0_0_0_1.5px_#B08A3E,0_0_0_3px_rgba(226,194,122,.3)] text-cream placeholder:text-cream/40 px-3 pr-10 text-sm" />
          <i className="absolute right-3 top-1/2 -translate-y-1/2 not-italic text-xs text-stone">in</i>
        </span>
      </label>
      <label className="sm:col-span-2 flex flex-col gap-1.5 text-[12px] font-semibold text-ink">Where is it?
        <select value={where} onChange={(e) => setWhere(e.target.value)} className="h-11 rounded-xl bg-white px-3 text-sm text-ink shadow-[inset_0_0_0_1px_#D8CCB9] transition-shadow hover:shadow-[inset_0_0_0_1px_#B08A3E] focus:outline-none focus:shadow-[inset_0_0_0_1.5px_#B08A3E,0_0_0_3px_rgba(226,194,122,.3)]">
          {WHERE.map((o) => <option key={o}>{o}</option>)}
        </select>
      </label>
      <div className="sm:col-span-2 flex flex-col gap-1.5 mt-1" aria-live="polite">
        {!W || !H ? (
          <div className="rounded-xl bg-goldSoft text-brownDeep px-3.5 py-3 text-[13px] shadow-[inset_0_0_0_1px_rgba(176,138,62,.35)]">Enter width and height — the list below updates as you type.</div>
        ) : bad ? (
          <div className="rounded-xl bg-goldSoft text-brownDeep px-3.5 py-3 text-[13px] shadow-[inset_0_0_0_1px_rgba(176,138,62,.35)]">That does not look like a door: width is usually 24–48 in and height 78–96 in. Measure in inches between the jambs.</div>
        ) : (
          <>
            <div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-goldDeep mt-1.5">{where} · {W} × {H} in · diagonal {Math.round(diag)} in</div>
            {groups.map(([k, title, label]) => {
              const list = rows.filter((r) => r.kind === k);
              if (!list.length) return null;
              return (
                <div key={k} className="contents">
                  <div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-goldDeep mt-1.5">{title}</div>
                  {list.map((r) => (
                    <div key={r.name} className={`grid grid-cols-[1fr_auto] items-center gap-2.5 px-3 py-2.5 text-[13px] text-ink rounded-xl bg-white shadow-[inset_0_0_0_1px_#E4DACA] border-l-[3px] ${tone[r.kind]}`}>
                      <div className="min-w-0">{r.name}<span className="text-stone text-xs"> · packaged {r.w}×{r.d}×{r.h} in</span></div>
                      <span className={`whitespace-nowrap text-[10px] font-bold tracking-[0.1em] uppercase px-1.5 py-0.5 ${tag[r.kind]}`}>{label}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        )}
      </div>
    </form>
  );
}
