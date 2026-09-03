"use client";

// FABRIC POPUP (2026-09-04) — "See all 196 →" sa Made-to-order section:
// preview lang ng buong fabric library ng IMS, tabs kada collection, grid ng
// tela (swatch photo kung meron, kulay kung wala). Click ng tela → collection
// page na dala ang fabric bilang query, para naka-preselect sa configurator.
// Bukas via `window.dispatchEvent(new Event("pan:fabrics"))`.

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { LibrarySwatch } from "@/lib/products";

const ORDER = ["Leather", "Tanya", "Cairo", "Sofia", "Bristol", "New Sahara", "Lafayette", "Madrid", "Feather", "Velbert", "Tahoe"];
const colOf = (n: string) => { const w = n.trim().split(/\s+/); return w[0]?.toLowerCase() === "new" && w[1] ? `${w[0]} ${w[1]}` : (w[0] ?? ""); };
const num = (s: string) => { const m = /(\d+)/.exec(s); return m ? +m[1] : 0; };

export default function FabricPopup({ swatches }: { swatches: LibrarySwatch[] }) {
  const router = useRouter();
  const [on, setOn] = useState(false);
  const [tab, setTab] = useState(0);
  const groups = useMemo(() => {
    const by = new Map<string, LibrarySwatch[]>();
    for (const s of swatches) { const c = colOf(s.name); if (!by.has(c)) by.set(c, []); by.get(c)!.push(s); }
    const cols = [...ORDER.filter((c) => by.has(c)), ...Array.from(by.keys()).filter((c) => !ORDER.includes(c))];
    return cols.map((c) => ({ name: c, items: by.get(c)!.sort((a, b) => num(a.name) - num(b.name) || a.name.localeCompare(b.name)) }));
  }, [swatches]);
  useEffect(() => {
    const open = () => { setOn(true); document.body.style.overflow = "hidden"; };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("pan:fabrics", open);
    document.addEventListener("keydown", key);
    return () => { window.removeEventListener("pan:fabrics", open); document.removeEventListener("keydown", key); };
  }, []);
  function close() { setOn(false); document.body.style.overflow = ""; }
  if (!on) return null;
  const g = groups[tab] ?? groups[0];
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/55" onClick={(e) => { if (e.target === e.currentTarget) close(); }} role="dialog" aria-modal="true" aria-label="Pick your fabric">
      <div className="relative bg-cream w-[min(1100px,100%)] max-h-[92vh] min-h-[min(70vh,640px)] overflow-auto p-5 md:p-7 shadow-2xl">
        <button onClick={close} aria-label="Close" className="absolute top-0 right-0 z-10 w-9 h-9 bg-ink text-white text-xl hover:bg-brown">×</button>
        <div className="pr-10 mb-3">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-goldDeep">{swatches.length} fabrics · real swatches at both showrooms</p>
          <h2 className="font-cormorant text-[26px] font-semibold leading-tight mt-1">Pick your fabric</h2>
        </div>
        <div className="flex flex-wrap gap-0.5 border-b border-sand mb-4">
          {groups.map((gr, i) => (
            <button key={gr.name} type="button" onClick={() => setTab(i)} className={`relative px-2.5 py-2 text-[11.5px] font-semibold tracking-[0.1em] uppercase ${i === tab ? "text-ink after:absolute after:left-2.5 after:right-2.5 after:-bottom-px after:h-0.5 after:bg-goldDeep" : "text-stone"}`}>
              {gr.name} <span className="font-normal text-stone ml-1 tabular-nums">{gr.items.length}</span>
            </button>
          ))}
        </div>
        {g && (
          <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(92px,1fr))]">
            {g.items.map((s) => (
              <button key={s.name} type="button" title={s.name} onClick={() => { close(); router.push(`/collections/customized-bed?fabric=${encodeURIComponent(s.name)}`); }} className="group flex flex-col gap-1.5 text-center">
                <span className="relative block aspect-square border border-black/10 overflow-hidden transition-transform group-hover:scale-[1.06] group-hover:shadow-lg" style={{ background: s.color ?? "#D9CFC0" }}>
                  {s.swatch && <Image src={s.swatch} alt={s.name} fill className="object-cover" sizes="110px" />}
                </span>
                <span className="text-[11px] font-medium text-ink truncate">{s.name.replace(g.name + " ", "")}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function openFabrics() { window.dispatchEvent(new Event("pan:fabrics")); }
