"use client";

// Confirm card — HALOS KAPAREHO ng email layout (brown header band + gold rule,
// cream date banner, labeled details rows, green CTA, footer strip) para iisa
// ang dating ng email at ng page na bubuksan nito.

import { useState } from "react";

const peso = (n: number) => `₱${(Number(n) || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  try { return new Date(`${iso}T00:00:00`).toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" }); }
  catch { return iso; }
};

function DetailRow({ label, value, bold }: { label: string; value: React.ReactNode; bold?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-[#efe9db]">
      <span className="text-[10px] font-bold tracking-widest2 uppercase text-[#8a8272] whitespace-nowrap pt-0.5">{label}</span>
      <span className={`font-cormorant text-right text-[15px] text-[#2b2620] ${bold ? "font-bold" : ""}`}>{value}</span>
    </div>
  );
}

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
    <div className="bg-white border border-[#e6dcc4] rounded-xl overflow-hidden shadow-sm">
      {/* Header band — kapareho ng email */}
      <div className="bg-[#4a3b1a] px-7 py-6 border-b-[3px] border-[#caa45a] flex items-center justify-between gap-4">
        <p className="font-cormorant font-bold text-xl tracking-[0.12em] text-[#f4ead8]">PAN FURNITURE</p>
        <p className="text-[9px] font-bold tracking-widest2 uppercase text-[#caa45a]">
          {done ? "Delivery Confirmed" : "Delivery Confirmation"}
        </p>
      </div>

      <div className="px-7 pt-7 pb-2">
        {done ? (
          /* Confirmed state — green banner gaya ng thank-you email */
          <div className="text-center rounded-lg border border-[#bfe0cc] bg-[#f0f7f2] px-6 py-7 mb-2">
            <p className="text-2xl mb-2">✅</p>
            <p className="font-cormorant text-xl font-bold text-[#1e5c3c] mb-1">Your delivery is confirmed</p>
            <p className="font-cormorant text-lg text-[#2b2620]">{fmtDate(summary.date)}</p>
            <p className="text-[11px] text-[#8a8272] mt-3 leading-relaxed">
              A reminder will be sent as your delivery date approaches.
            </p>
          </div>
        ) : (
          <>
            <p className="font-cormorant text-[15px] text-[#2b2620] mb-4">Dear {summary.customerName || "Valued Customer"},</p>
            <p className="font-cormorant text-[15px] leading-relaxed text-[#2b2620] mb-6">
              We are pleased to inform you that your order <b>{summary.orderNumber ?? ""}</b> has successfully passed our final quality inspection and is now ready for delivery.
            </p>
          </>
        )}

        {/* Date banner — cream + gold, kapareho ng email */}
        {!done && (
          <div className="text-center rounded-lg border border-[#caa45a] bg-[#faf6ec] px-6 py-5">
            <p className="text-[10px] font-bold tracking-widest2 uppercase text-[#8a8272] mb-2">Scheduled Delivery Date</p>
            <p className="font-cormorant text-2xl font-bold text-[#4a3b1a]">{fmtDate(summary.date)}</p>
          </div>
        )}

        {/* Details — labeled rows gaya ng email */}
        <div className="mt-5 mb-1">
          <DetailRow label="Order Number" value={<span className="font-mono text-[13px] font-bold">{summary.orderNumber ?? ""}</span>} />
          {summary.address && <DetailRow label="Delivery Address" value={summary.address} />}
          {summary.balance > 0 && <DetailRow label="Balance Due on Delivery" value={peso(summary.balance)} bold />}
        </div>

        {!done && (
          <p className="font-cormorant text-[15px] leading-relaxed text-[#2b2620] mt-5">
            To proceed, kindly confirm that someone will be available to receive the delivery on the scheduled date:
          </p>
        )}
      </div>

      {/* CTA — green button gaya ng email */}
      {!done && (
        <div className="px-7 pt-4 pb-7 text-center">
          <button
            onClick={confirm}
            disabled={busy}
            className="inline-block w-full sm:w-auto bg-[#2e7d52] hover:bg-[#256844] text-white text-[13px] font-bold tracking-widest2 px-14 py-4 rounded-lg transition-colors disabled:opacity-60"
          >
            {busy ? "CONFIRMING…" : "CONFIRM DELIVERY"}
          </button>
          <p className="text-[10px] text-[#8a8272] mt-3.5 leading-relaxed max-w-sm mx-auto">
            Should the schedule require adjustment, a reminder with rescheduling options will be sent as your delivery date approaches.
          </p>
          {error && <p className="mt-4 text-xs text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>}
        </div>
      )}

      {/* Footer strip — kapareho ng email */}
      <div className="bg-[#faf8f3] border-t border-[#efe9db] px-7 py-5">
        <p className="font-cormorant text-[13px] font-bold text-[#2b2620]">Thank you for choosing PAN Furniture.</p>
        <p className="text-[10px] text-[#8a8272] mt-1">Operations Team · PAN Furniture · panfurnitureph@gmail.com</p>
      </div>
    </div>
  );
}
