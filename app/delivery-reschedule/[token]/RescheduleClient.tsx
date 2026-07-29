"use client";

// Calendar month grid (bukas hanggang +60 araw ang clickable) + time-window
// chips. Ang bagong petsa ay AUTO-CONFIRMED — walang dagdag na hakbang.
// Website look: cream/sand/olive/cormorant.

import { useMemo, useState } from "react";

const WINDOWS = ["9–11 AM", "11 AM–1 PM", "1–3 PM", "3–5 PM"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fmt = (isoStr: string) => {
  try { return new Date(`${isoStr}T00:00:00`).toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" }); }
  catch { return isoStr; }
};

export default function RescheduleClient({ token, summary }: {
  token: string;
  summary: { orderNumber: string | null; customerName: string | null; currentDate: string | null };
}) {
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [win, setWin] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const min = useMemo(() => { const d = new Date(today); d.setDate(d.getDate() + 1); return d; }, [today]);
  const max = useMemo(() => { const d = new Date(today); d.setDate(d.getDate() + 60); return d; }, [today]);
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const cells = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const out: (Date | null)[] = Array.from({ length: first.getDay() }, () => null);
    const dim = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= dim; d++) out.push(new Date(view.getFullYear(), view.getMonth(), d));
    return out;
  }, [view]);

  const submit = async () => {
    if (!picked) return;
    setBusy(true); setError(null);
    try {
      const r = await fetch("/api/delivery-reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, date: picked, timeWindow: win }),
      });
      const j = await r.json();
      if (!r.ok || j.error) { setError(j.error || "Something went wrong — please try again."); return; }
      setDone(j.date ?? picked);
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="bg-white border border-sand rounded-lg p-6 sm:p-8 text-center">
        <p className="text-2xl mb-2">✓</p>
        <p className="font-cormorant text-2xl font-medium text-olive mb-2">New delivery date confirmed!</p>
        <p className="text-sm font-bold mb-3">{fmt(done)}{win ? ` · ${win}` : ""}</p>
        <p className="text-stone text-xs leading-relaxed">
          Order {summary.orderNumber ?? ""} — no further action needed. A reminder will be sent as the new date approaches.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-sand rounded-lg p-5 sm:p-7">
      <p className="text-center text-xs text-stone mb-5">
        Order <span className="font-mono font-bold text-ink">{summary.orderNumber ?? ""}</span>
        {summary.currentDate && <> · currently scheduled <b className="text-ink">{fmt(summary.currentDate)}</b></>}
      </p>

      {/* Calendar */}
      <div className="border border-sand rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <button type="button" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
            disabled={view <= new Date(today.getFullYear(), today.getMonth(), 1)}
            className="h-9 w-9 rounded border border-sand text-stone disabled:opacity-30 hover:border-cognac transition-colors">‹</button>
          <p className="font-cormorant text-lg font-medium">{MONTHS[view.getMonth()]} {view.getFullYear()}</p>
          <button type="button" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
            disabled={new Date(view.getFullYear(), view.getMonth() + 1, 1) > max}
            className="h-9 w-9 rounded border border-sand text-stone disabled:opacity-30 hover:border-cognac transition-colors">›</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold tracking-widest2 text-stone/70 mb-1">
          {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map((d) => <span key={d}>{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <span key={`e${i}`} />;
            const dISO = iso(d);
            const selectable = d >= min && d <= max;
            const sel = picked === dISO;
            return (
              <button key={dISO} type="button" disabled={!selectable} onClick={() => setPicked(dISO)}
                className={
                  sel
                    ? "h-10 rounded bg-ink text-sm font-bold text-white"
                    : selectable
                      ? "h-10 rounded border border-sand text-sm text-ink hover:border-cognac hover:bg-linen transition-colors"
                      : "h-10 rounded text-sm text-stone/30"
                }>
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time windows */}
      {picked && (
        <div className="mt-5">
          <p className="text-[11px] font-bold tracking-widest2 text-stone mb-2">PREFERRED TIME · {fmt(picked).toUpperCase()}</p>
          <div className="flex flex-wrap gap-2">
            {WINDOWS.map((w) => (
              <button key={w} type="button" onClick={() => setWin(win === w ? null : w)}
                className={win === w
                  ? "rounded-full bg-ink px-4 py-2 text-xs font-bold text-white"
                  : "rounded-full border border-sand px-4 py-2 text-xs font-semibold text-stone hover:border-cognac transition-colors"}>
                {w}
              </button>
            ))}
          </div>
        </div>
      )}

      <button type="button" onClick={submit} disabled={busy || !picked}
        className="mt-6 w-full bg-ink text-white text-[13px] font-bold tracking-widest2 py-4 rounded hover:bg-espresso transition-colors disabled:opacity-50">
        {busy ? "SAVING…" : picked ? `CONFIRM NEW DATE — ${fmt(picked).toUpperCase()}` : "PICK A DATE ABOVE"}
      </button>
      {error && <p className="mt-4 text-center text-xs text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>}
      <p className="mt-5 text-center text-[11px] text-stone/70">Your new date is confirmed immediately — no further steps needed.</p>
    </div>
  );
}
