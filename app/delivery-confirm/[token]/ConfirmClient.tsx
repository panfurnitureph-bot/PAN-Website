"use client";

// Confirm card — website look (cream/sand/olive), pindutin ang Confirm →
// website proxy → IMS API. Ang bagong estado ay ipinapakita agad.

import { useState } from "react";

const peso = (n: number) => `₱${(Number(n) || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  try { return new Date(`${iso}T00:00:00`).toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" }); }
  catch { return iso; }
};

export default function ConfirmClient({ token, summary }: {
  token: string;
  summary: {
    orderNumber: string | null;
    customerName: string | null;
    address: string | null;
    date: string | null;
    balance: number;
    alreadyConfirmed: boolean;
  };
}) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(summary.alreadyConfirmed);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setBusy(true); setError(null);
    try {
      const r = await fetch("/api/delivery-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const j = await r.json();
      if (!r.ok || j.error) { setError(j.error || "Something went wrong — please try again."); return; }
      setDone(true);
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white border border-sand rounded-lg p-6 sm:p-8">
      <div className="text-center border border-sand rounded-lg bg-linen px-5 py-6 mb-6">
        <p className="text-[11px] font-bold tracking-widest2 text-stone mb-1">ORDER</p>
        <p className="font-mono text-sm font-bold mb-4">{summary.orderNumber ?? ""}</p>
        <p className="text-[11px] font-bold tracking-widest2 text-stone mb-1">SCHEDULED DELIVERY DATE</p>
        <p className="font-cormorant text-2xl font-medium">{fmtDate(summary.date)}</p>
        {summary.address && <p className="text-stone text-xs mt-3 leading-relaxed">{summary.address}</p>}
        {summary.balance > 0 && (
          <p className="text-xs mt-4">
            Balance payable upon delivery: <span className="font-bold">{peso(summary.balance)}</span>
          </p>
        )}
      </div>

      {done ? (
        <div className="text-center rounded-lg border border-olive/30 bg-olive/5 px-5 py-6">
          <p className="text-2xl mb-2">✓</p>
          <p className="font-cormorant text-xl font-medium text-olive mb-1">Delivery confirmed — thank you!</p>
          <p className="text-stone text-xs leading-relaxed">
            Our team will deliver on {fmtDate(summary.date)}. A reminder will be sent as the date approaches.
          </p>
        </div>
      ) : (
        <>
          <button
            onClick={confirm}
            disabled={busy}
            className="w-full bg-ink text-white text-[13px] font-bold tracking-widest2 py-4 rounded hover:bg-espresso transition-colors disabled:opacity-60"
          >
            {busy ? "CONFIRMING…" : "CONFIRM DELIVERY"}
          </button>
          {error && <p className="mt-4 text-center text-xs text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>}
        </>
      )}
      <p className="mt-6 text-center text-[11px] text-stone/70">PAN Furniture · Operations Team</p>
    </div>
  );
}
