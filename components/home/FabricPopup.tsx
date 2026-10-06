"use client";

// FABRIC POPUP (2026-09-04) — "See all 196 →" sa Made-to-order section:
// preview ng buong fabric library ng IMS (swatch photo kung meron, kulay kung
// wala). Ang piniling tela → collection page na dala ang fabric bilang query,
// para naka-preselect sa configurator.
// Bukas via `openFabrics()`; `openFabrics("Tahoe Gray")` = nakapili na ang telang iyon.
//
// PREMIUM NA ANYO (Joe 2026-10-07, "pag click ng kahit ano mang fabric diba
// dapat nalabas yan" — ang library ng mockup): header na "Fabric library /
// Choose a fabric", search, mga pamilya ng tela bilang pill (may "All"), grid
// ng card na may pangalan, at footer na "Cancel / Use this fabric". Ang
// pag-click sa tela ay PUMIPILI na lang; ang "Use this fabric" (o double-click)
// ang pumupunta sa PAREHONG lugar na pinupuntahan ng dating isang click.

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LibrarySwatch } from "@/lib/products";

const ORDER = ["Leather", "Tanya", "Cairo", "Sofia", "Bristol", "New Sahara", "Lafayette", "Madrid", "Feather", "Velbert", "Tahoe"];
const colOf = (n: string) => { const w = n.trim().split(/\s+/); return w[0]?.toLowerCase() === "new" && w[1] ? `${w[0]} ${w[1]}` : (w[0] ?? ""); };
const num = (s: string) => { const m = /(\d+)/.exec(s); return m ? +m[1] : 0; };
const EVENT = "pan:fabrics";

// Pagbukas mula sa MTO form: ang mga telang pinapayagan ng config, kung aling
// tela ang bawal ngayon (hal. leather habang naka-Lift Storage), at ang
// gagawin sa "Use this fabric" sa halip na pumunta sa Custom Bed page.
export type FabricOpenOpts = { name?: string; swatches?: LibrarySwatch[]; disabled?: (s: LibrarySwatch) => string | undefined; onUse?: (name: string) => void };

export default function FabricPopup({ swatches }: { swatches: LibrarySwatch[] }) {
  const router = useRouter();
  const [on, setOn] = useState(false);
  const [tab, setTab] = useState(-1); // -1 = All
  const [q, setQ] = useState("");
  const [pick, setPick] = useState<string | null>(null);
  const [opts, setOpts] = useState<FabricOpenOpts>({});
  const grid = useRef<HTMLDivElement>(null);
  const list = opts.swatches ?? swatches;
  // HOVER PREVIEW (Joe 2026-09-06): malaking litrato ng tela na sumusunod sa
  // cursor habang naka-hover; nawawala pag-alis. Mouse lang — walang hover sa touch.
  const [hov, setHov] = useState<{ s: LibrarySwatch; x: number; y: number } | null>(null);
  const groups = useMemo(() => {
    const by = new Map<string, LibrarySwatch[]>();
    for (const s of list) { const c = colOf(s.name); if (!by.has(c)) by.set(c, []); by.get(c)!.push(s); }
    const cols = [...ORDER.filter((c) => by.has(c)), ...Array.from(by.keys()).filter((c) => !ORDER.includes(c))];
    return cols.map((c) => ({ name: c, items: by.get(c)!.sort((a, b) => num(a.name) - num(b.name) || a.name.localeCompare(b.name)) }));
  }, [list]);
  useEffect(() => {
    const open = (e: Event) => {
      const d = (e as CustomEvent<string | FabricOpenOpts | undefined>).detail;
      const o: FabricOpenOpts = typeof d === "string" ? { name: d } : d && typeof d === "object" ? d : {};
      setOpts(o);
      setPick(o.name ? o.name : null);
      setTab(-1); setQ(""); setOn(true); document.body.style.overflow = "hidden";
    };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener(EVENT, open);
    document.addEventListener("keydown", key);
    return () => { window.removeEventListener(EVENT, open); document.removeEventListener("keydown", key); };
  }, []);
  // Binuksan mula sa isang swatch: ipakita agad ang telang iyon sa listahan.
  useEffect(() => {
    if (on && pick) grid.current?.querySelector<HTMLElement>("[aria-pressed='true']")?.scrollIntoView({ block: "center" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);
  // PAINIT NG LAHAT NG TELA PAGBUKAS (Joe 2026-09-06, "may delay na 1-2s"): ang
  // bawat tab ay naghihintay noon sa network ng sarili nitong litrato. Ngayon,
  // pagbukas ng popup ay kinukuha na ng browser ang LAHAT ng swatch (12 kada
  // 60ms para hindi masakal ang koneksyon) — paglipat ng pamilya ay galing na
  // sa cache, agad na lumalabas.
  useEffect(() => {
    if (!on) return;
    const urls = groups.flatMap((gr) => gr.items.map((x) => x.swatch)).filter((u): u is string => !!u);
    let i = 0, t: ReturnType<typeof setTimeout> | null = null;
    const tick = () => {
      for (let k = 0; k < 12 && i < urls.length; k++, i++) { const im = new window.Image(); im.decoding = "async"; im.src = urls[i]; }
      if (i < urls.length) t = setTimeout(tick, 60);
    };
    tick();
    return () => { if (t) clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, groups]);
  function close() { setOn(false); setHov(null); document.body.style.overflow = ""; }
  // Parehong destinasyon ng dating pag-click sa tela — maliban kung may sariling
  // gagawin ang nagbukas (MTO form: pinipili ang tela sa build).
  function use(name: string) { close(); if (opts.onUse) opts.onUse(name); else router.push(`/collections/customized-bed?fabric=${encodeURIComponent(name)}`); }
  if (!on) return null;
  const pool = tab < 0 ? groups.flatMap((gr) => gr.items) : (groups[tab]?.items ?? []);
  const needle = q.trim().toLowerCase();
  const items = needle ? pool.filter((s) => s.name.toLowerCase().includes(needle) || (s.material ?? "").toLowerCase().includes(needle)) : pool;
  const picked = pick ? list.find((s) => s.name === pick) : undefined;
  const why = (s: LibrarySwatch) => opts.disabled?.(s);
  const pill = (active: boolean) => `h-8 shrink-0 rounded-full px-3.5 text-[12.5px] font-semibold transition-colors ${active ? "pf-dark" : "bg-white text-ink shadow-[inset_0_0_0_1px_#E0D5C1] hover:shadow-[inset_0_0_0_1px_#B08A3E]"}`;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-[#1A140C]/60 backdrop-blur-[3px]" onClick={(e) => { if (e.target === e.currentTarget) close(); }} role="dialog" aria-modal="true" aria-label="Choose a fabric">
      <div className="relative flex w-[min(740px,100%)] max-h-[90vh] min-h-[min(72vh,620px)] flex-col overflow-hidden rounded-[20px] bg-[#FBF7EF] shadow-[0_0_0_1px_rgba(226,194,122,.45),0_40px_80px_-30px_rgba(0,0,0,.8)]">
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#E8DDC9] bg-[linear-gradient(180deg,#fff,#FAF5EC)]">
          <div className="min-w-0">
            <p className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-goldDeep">Fabric library · {list.length} fabrics</p>
            <h2 className="font-cormorant text-[19px] font-semibold leading-tight tracking-[-0.01em] mt-1">Choose a fabric</h2>
          </div>
          <button onClick={close} aria-label="Close" className="grid place-items-center w-9 h-9 shrink-0 rounded-full bg-white text-ink shadow-[0_0_0_1.5px_#B08A3E,0_8px_16px_-10px_rgba(62,50,32,.5)] transition hover:bg-brownDeep hover:text-gold">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        <div className="px-5 pt-4">
          <label className="flex items-center gap-2.5 h-10 rounded-xl bg-white px-3.5 shadow-[inset_0_0_0_1px_#E0D5C1] focus-within:shadow-[inset_0_0_0_1.5px_#B08A3E]">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="shrink-0 text-stone" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search color or material" aria-label="Search color or material" className="min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-stone" />
          </label>
          <div className="flex flex-wrap gap-1.5 mt-3 max-sm:-mx-5 max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:px-5 max-sm:pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button type="button" onClick={() => setTab(-1)} className={pill(tab < 0)}>All</button>
            {groups.map((gr, i) => <button key={gr.name} type="button" onClick={() => setTab(i)} className={pill(i === tab)}>{gr.name}</button>)}
          </div>
        </div>

        {hov && hov.s.swatch && typeof window !== "undefined" && (() => {
          const W = 260, H = 300, M = 18;
          const left = Math.min(Math.max(hov.x + M, 8), window.innerWidth - W - 8);
          const top = hov.y + M + H > window.innerHeight - 8 ? Math.max(hov.y - M - H, 8) : hov.y + M;
          return (
            <div className="pointer-events-none fixed z-[70] overflow-hidden rounded-2xl bg-[#FBF7EF] shadow-[0_0_0_1px_rgba(226,194,122,.5),0_30px_50px_-20px_rgba(0,0,0,.6)]" style={{ left, top, width: W }} aria-hidden>
              <div className="relative h-[260px] w-full overflow-hidden" style={{ background: hov.s.color ?? "#D9CFC0" }}>
                <Image src={hov.s.swatch} alt="" fill unoptimized className="object-cover" sizes="260px" />
              </div>
              <div className="px-3 py-2">
                <p className="text-[12.5px] font-semibold text-ink truncate">{hov.s.name}</p>
                {hov.s.material && <p className="text-[11px] text-stone truncate">{hov.s.material}</p>}
              </div>
            </div>
          );
        })()}

        <div ref={grid} className="flex-1 overflow-y-auto px-5 py-4">
          {items.length > 0 ? (
            <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(96px,1fr))]">
              {items.map((s) => {
                const sel = s.name === pick;
                const ban = why(s);
                return (
                  <button key={s.name} type="button" title={ban ? `${s.name} — ${ban}` : s.name} aria-pressed={sel} disabled={!!ban} onClick={() => { if (!ban) setPick(s.name); }} onDoubleClick={() => { if (!ban) use(s.name); }}
                    onMouseEnter={(e) => setHov({ s, x: e.clientX, y: e.clientY })}
                    onMouseMove={(e) => setHov({ s, x: e.clientX, y: e.clientY })}
                    onMouseLeave={() => setHov(null)}
                    className={`group flex flex-col overflow-hidden rounded-xl bg-white text-center transition duration-200 hover:-translate-y-0.5 ${ban ? "cursor-not-allowed opacity-35" : ""} ${sel ? "shadow-[0_0_0_2px_#B08A3E,0_0_0_6px_rgba(226,194,122,.3),0_14px_22px_-14px_rgba(62,50,32,.6)]" : "shadow-[0_0_0_1px_#E0D5C1] hover:shadow-[0_0_0_1px_#B08A3E,0_14px_22px_-16px_rgba(62,50,32,.6)]"}`}>
                    <span className="relative block aspect-[4/3] w-full overflow-hidden" style={{ background: s.color ?? "#D9CFC0" }}>
                      {/* Maliit na 200px JPEG na (~8KB) mula sa Storage CDN — laktawan ang
                          next/image optimizer (bawat isa ay server resize noon = mabagal ang
                          unang bukas). */}
                      {s.swatch && <Image src={s.swatch} alt={s.name} fill unoptimized loading="eager" className="object-cover" sizes="120px" />}
                    </span>
                    <span className="block w-full truncate px-2 py-2 text-[11px] font-medium text-ink">{s.name}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-stone">No fabric matches &ldquo;{q}&rdquo;.</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-[#E8DDC9] bg-[linear-gradient(180deg,#FAF5EC,#F5EDDF)]">
          <span className="flex min-w-0 items-center gap-2.5 text-[12.5px] text-stone">
            {picked ? (
              <>
                <i aria-hidden className="relative block w-8 h-8 shrink-0 overflow-hidden rounded-lg shadow-[0_0_0_1px_#B08A3E]" style={{ background: picked.color ?? "#D9CFC0" }}>{picked.swatch && <Image src={picked.swatch} alt="" fill unoptimized className="object-cover" sizes="32px" />}</i>
                <b className="truncate font-semibold text-ink">{picked.name}</b>
              </>
            ) : "Pick a fabric"}
          </span>
          <span className="flex shrink-0 gap-2">
            <button type="button" onClick={close} className="h-10 rounded-xl bg-white px-4 sm:px-5 text-[13px] font-semibold text-ink shadow-[inset_0_0_0_1px_#C9B98F] transition-shadow hover:shadow-[inset_0_0_0_1px_#B08A3E]">Cancel</button>
            <button type="button" disabled={!picked} onClick={() => picked && use(picked.name)} className={`h-10 rounded-xl px-4 sm:px-5 text-[13px] font-bold transition ${picked ? "pf-dark hover:text-gold" : "bg-[#EDE4D3] text-[#A89B82] cursor-not-allowed"}`}>Use this fabric</button>
          </span>
        </div>
      </div>
    </div>
  );
}

// `name` = bubukas na nakapili na ang telang iyon. (Ang ibang uri ng argument,
// hal. ang MouseEvent kapag direktang ginamit bilang onClick, ay binabalewala.)
export function openFabrics(arg?: unknown) {
  const detail = typeof arg === "string" ? arg : arg && typeof arg === "object" && !("nativeEvent" in (arg as object)) ? (arg as FabricOpenOpts) : undefined;
  window.dispatchEvent(new CustomEvent(EVENT, { detail }));
}
