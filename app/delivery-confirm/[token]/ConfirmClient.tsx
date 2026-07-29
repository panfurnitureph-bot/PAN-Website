"use client";

// Confirm card — SAME NA SAME sa confirmation email (Initial Notice artifact):
// PAN seal + wordmark sa brown band, "Good news" heading, cream/gold date
// banner, 1-2-3 steps, details na may Item, ISANG green Confirm button,
// questions block, dark espresso footer. Tatlong estado: form → loading →
// confirmed (hindi sabay-sabay).

import { useState } from "react";

const peso = (n: number) => `₱${(Number(n) || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
const fmtLong = (iso: string | null) => {
  if (!iso) return "—";
  try { return new Date(`${iso}T00:00:00`).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" }); }
  catch { return iso; }
};
const weekdayOf = (iso: string | null) => {
  if (!iso) return "";
  try { return new Date(`${iso}T00:00:00`).toLocaleDateString("en-PH", { weekday: "long" }); }
  catch { return ""; }
};

function DetailRow({ label, value, bold }: { label: string; value: React.ReactNode; bold?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-[#efe9db]">
      <span className="text-xs text-[#8a8272] whitespace-nowrap pt-0.5">{label}</span>
      <span className={`text-right text-[13px] leading-relaxed text-[#2b2620] ${bold ? "font-bold" : "font-medium"}`}>{value}</span>
    </div>
  );
}

function Steps({ confirmed = false }: { confirmed?: boolean }) {
  return (
    <div className="flex items-center justify-center mt-6 mb-1">
      <div className="flex flex-col items-center">
        {confirmed
          ? <span className="w-9 h-9 rounded-full bg-[#2e7d52] text-white font-bold flex items-center justify-center">✓</span>
          : <span className="w-9 h-9 rounded-full bg-[#caa45a] text-white font-cormorant font-bold flex items-center justify-center">1</span>}
        <span className={`text-[9px] font-bold tracking-widest2 mt-1.5 ${confirmed ? "text-[#2e7d52]" : "text-[#4a3b1a]"}`}>{confirmed ? "CONFIRMED" : "CONFIRM"}</span>
      </div>
      <span className={`w-12 border-t-2 mx-2 mb-5 ${confirmed ? "border-[#2e7d52]" : "border-[#e0d7c3]"}`} />
      <div className="flex flex-col items-center">
        {confirmed
          ? <span className="w-9 h-9 rounded-full bg-[#caa45a] text-white font-cormorant font-bold flex items-center justify-center">2</span>
          : <span className="w-9 h-9 rounded-full border border-[#d8cfba] text-[#8a8272] font-cormorant flex items-center justify-center">2</span>}
        <span className={`text-[9px] tracking-widest2 mt-1.5 ${confirmed ? "font-bold text-[#4a3b1a]" : "text-[#8a8272]"}`}>PREPARE</span>
      </div>
      <span className="w-12 border-t-2 border-[#e0d7c3] mx-2 mb-5" />
      <div className="flex flex-col items-center">
        <span className="w-9 h-9 rounded-full border border-[#d8cfba] text-[#8a8272] font-cormorant flex items-center justify-center">3</span>
        <span className="text-[9px] tracking-widest2 text-[#8a8272] mt-1.5">DELIVER</span>
      </div>
    </div>
  );
}

export default function ConfirmClient({ token, summary }: {
  token: string;
  summary: {
    orderNumber: string | null;
    customerName: string | null;
    address: string | null;
    item?: string | null;
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

  const ord = summary.orderNumber ?? "";
  const refNo = `DC-${ord.replace(/^ORD-/, "")}-01`;

  return (
    <div className="rounded-xl overflow-hidden border border-[#e6dcc4] shadow-sm">
      {/* Header: seal + wordmark (kapareho ng email) */}
      <div className="bg-[#4a3b1a] px-7 pt-7 pb-6 border-b-[3px] border-[#caa45a] text-center">
        <span className="inline-flex w-16 h-16 items-center justify-center rounded-full border-2 border-[#caa45a] font-cormorant font-bold tracking-[0.15em] text-[#caa45a]">PAN</span>
        <p className="font-cormorant font-bold text-2xl tracking-[0.3em] text-[#f4ead8] mt-3.5">PAN&nbsp;FURNITURE</p>
      </div>

      <div className="bg-white px-7 pt-7 pb-2">
        {busy ? (
          /* LOADING — spinner lang */
          <div className="text-center px-6 py-14 mb-4">
            <span className="inline-block h-10 w-10 rounded-full border-4 border-[#e6dcc4] border-t-[#2e7d52] animate-spin" />
            <p className="text-sm font-medium text-[#2b2620] mt-5">Confirming your delivery…</p>
            <p className="text-[11px] text-[#8a8272] mt-1">Please wait a moment.</p>
          </div>
        ) : done ? (
          /* CONFIRMED — "booked" layout, kapareho ng confirmed email */
          <>
            <p className="text-[10px] font-bold tracking-widest2 uppercase text-[#2e7d52] mb-2">Confirmed ✓</p>
            <p className="font-cormorant text-2xl font-bold text-[#2b2620] mb-3">Thank you — your delivery is booked.</p>
            <p className="text-[13px] leading-relaxed text-[#57534b] mb-6">
              The date below is reserved for you. On delivery day, we will send a <b className="text-[#2b2620]">live tracking link</b> so you can follow our team as they approach.
            </p>
            <div className="text-center rounded-lg border border-[#bfe0cc] bg-[#f0f7f2] px-6 py-5">
              <p className="text-[10px] font-bold tracking-widest2 uppercase text-[#2e7d52] mb-2">Confirmed Delivery</p>
              <p className="font-cormorant text-[26px] font-bold text-[#1e5c3c] leading-tight">{fmtLong(summary.date)}</p>
              <p className="text-xs text-[#8a8272] mt-1.5">{weekdayOf(summary.date)}</p>
            </div>
            <Steps confirmed />
            <div className="mt-4 mb-1">
              <DetailRow label="Order" value={<span className="font-mono text-[13px] font-bold">{ord}</span>} />
              {summary.address && <DetailRow label="Delivery address" value={<b>{summary.address}</b>} />}
              {summary.balance > 0 && <DetailRow label="Amount due on arrival (COD)" value={peso(summary.balance)} bold />}
            </div>
            <div className="text-xs leading-[1.9] text-[#57534b] mt-5">
              <b className="text-[#2b2620]">Before our team arrives:</b><br />
              · Please ensure someone is available at the address on delivery day.<br />
              {summary.balance > 0 && <>· Prepare the exact balance — QR payment is also accepted on arrival.<br /></>}
              · If access requires an elevator booking or involves narrow passages, let us know in advance.
            </div>
            <div className="border-t border-[#efe9db] mt-5 pt-4 pb-4 flex items-start gap-2.5">
              <span className="inline-flex w-7 h-7 shrink-0 items-center justify-center rounded-full border border-[#d8cfba] font-cormorant text-[#8a8272]">?</span>
              <p className="text-[11px] leading-relaxed text-[#6b6353]">
                <b className="text-[#2b2620]">Plans changed?</b> A reminder with rescheduling options will be sent before your delivery — or message us on{" "}
                <a href="https://m.me/1223308547524374" target="_blank" rel="noreferrer" className="text-[#2563eb] underline">Messenger</a>.
              </p>
            </div>
          </>
        ) : (
          <>
            <p className="text-[10px] font-bold tracking-widest2 uppercase text-[#8a8272] mb-2">Delivery Confirmation</p>
            <p className="font-cormorant text-2xl font-bold text-[#2b2620] mb-3">Good news — your order is ready.</p>
            <p className="text-[13px] leading-relaxed text-[#57534b] mb-6">
              Your order has completed crafting and passed our quality inspection. We have reserved the delivery date below — please confirm to secure your slot.
            </p>

            {/* Date banner */}
            <div className="text-center rounded-lg border border-[#caa45a] bg-[#faf6ec] px-6 py-5">
              <p className="text-[10px] font-bold tracking-widest2 uppercase text-[#8a8272] mb-2">Scheduled Delivery</p>
              <p className="font-cormorant text-[26px] font-bold text-[#4a3b1a] leading-tight">{fmtLong(summary.date)}</p>
              <p className="text-xs text-[#8a8272] mt-1.5">{weekdayOf(summary.date)}</p>
            </div>

            <Steps />

            {/* Details */}
            <div className="mt-4 mb-1">
              <DetailRow label="Order" value={<span className="font-mono text-[13px] font-bold">{ord}</span>} />
              {summary.item && <DetailRow label="Item" value={summary.item} />}
              {summary.address && <DetailRow label="Delivery address" value={<b>{summary.address}</b>} />}
              {summary.balance > 0 && <DetailRow label="Balance due on delivery (COD)" value={peso(summary.balance)} bold />}
            </div>
          </>
        )}
      </div>

      {/* CTA */}
      {!done && !busy && (
        <div className="bg-white px-7 pt-4 pb-6">
          <button
            onClick={confirm}
            className="w-full bg-[#2e7d52] hover:bg-[#256844] text-white text-[14px] font-bold py-4 rounded-lg transition-colors"
          >
            Confirm Delivery
          </button>
          <p className="text-[11px] text-[#2563eb] mt-3 leading-relaxed text-center">
            Confirming keeps your delivery slot reserved. If we don&apos;t hear from you, our team will follow up to arrange the schedule.
          </p>
          {error && <p className="mt-4 text-center text-xs text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>}

          {/* Questions block */}
          <div className="border-t border-[#efe9db] mt-5 pt-4 flex items-start gap-2.5">
            <span className="inline-flex w-7 h-7 shrink-0 items-center justify-center rounded-full border border-[#d8cfba] font-cormorant text-[#8a8272]">?</span>
            <p className="text-[11px] leading-relaxed text-[#6b6353]">
              <b className="text-[#2b2620]">Questions before delivery day?</b> Message us on{" "}
              <a href="https://m.me/1223308547524374" target="_blank" rel="noreferrer" className="text-[#2563eb] underline">Messenger</a>{" "}
              — we respond during business hours (Mon–Sat, 8:00 AM–5:00 PM).
            </p>
          </div>
        </div>
      )}

      {/* Dark footer — kapareho ng email */}
      <div className="bg-[#33261c] px-7 py-5 text-center">
        <p className="font-cormorant font-bold text-sm tracking-[0.25em] text-[#f4ead8]">PAN&nbsp;FURNITURE</p>
        <p className="text-[11px] text-[#c9b896] mt-2">
          San Pedro, Laguna ·{" "}
          <a href="mailto:panfurnitureph@gmail.com" className="text-[#caa45a] underline">panfurnitureph@gmail.com</a> ·{" "}
          <a href="https://m.me/1223308547524374" target="_blank" rel="noreferrer" className="text-[#caa45a] underline">m.me/panfurniture</a>
        </p>
        <p className="text-[10px] text-[#8f7f68] mt-2.5">You are receiving this page because you have an active order with PAN Furniture.</p>
        <p className="text-[10px] text-[#8f7f68] mt-1">Ref {refNo} · This confirmation link is unique to your order</p>
      </div>
    </div>
  );
}
