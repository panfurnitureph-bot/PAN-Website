"use client";

// Reschedule — HINDI na self-service calendar. Ang bagong petsa ay
// pinag-uusapan MUNA sa Messenger kasama ang team (para alam ng page/Ops), at
// may one-time ₱500 rescheduling fee na idadagdag sa balance (COD). Ang page
// na ito ay fee notice + Messenger CTA na may RESCHED-<order> ref para
// awtomatikong makilala ng system ang hiling sa thread.

const MESSENGER_PAGE = "1223308547524374";

const fmt = (isoStr: string) => {
  try { return new Date(`${isoStr}T00:00:00`).toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" }); }
  catch { return isoStr; }
};

export default function RescheduleClient({ summary }: {
  token: string;
  summary: { orderNumber: string | null; customerName: string | null; currentDate: string | null };
}) {
  const ord = summary.orderNumber ?? "";
  const mme = `https://m.me/${MESSENGER_PAGE}?ref=${encodeURIComponent(`RESCHED-${ord}`)}`;

  return (
    <div className="rounded-xl overflow-hidden border border-[#e6dcc4] shadow-sm">
      {/* Header: seal + wordmark — same family ng emails */}
      <div className="bg-[#4a3b1a] px-7 pt-7 pb-6 border-b-[3px] border-[#b3402a] text-center">
        <span className="inline-flex w-16 h-16 items-center justify-center rounded-full border-2 border-[#caa45a] font-cormorant font-bold tracking-[0.15em] text-[#caa45a]">PAN</span>
        <p className="font-cormorant font-bold text-2xl tracking-[0.3em] text-[#f4ead8] mt-3.5">PAN&nbsp;FURNITURE</p>
        <p className="text-[10px] font-bold tracking-widest2 uppercase text-[#caa45a] mt-2">Reschedule Delivery</p>
      </div>

      <div className="bg-white px-7 pt-7 pb-7">
        <p className="text-[10px] font-bold tracking-widest2 uppercase text-[#b3402a] mb-2">Reschedule Request</p>
        <p className="font-cormorant text-2xl font-bold text-[#2b2620] mb-3">Need a different delivery date?</p>
        <p className="text-[13px] leading-relaxed text-[#57534b] mb-6">
          Our team will personally arrange a new date with you on Messenger — this keeps your route slot and payment details accurate.
        </p>

        {/* Current schedule */}
        <div className="text-center rounded-lg border border-[#e6dcc4] bg-[#faf8f3] px-6 py-4">
          <p className="text-[10px] font-bold tracking-widest2 uppercase text-[#8a8272] mb-1.5">Current Schedule</p>
          <p className="font-cormorant text-xl font-bold text-[#2b2620]">{summary.currentDate ? fmt(summary.currentDate) : "—"}</p>
          <p className="font-mono text-xs font-bold text-[#8a8272] mt-1.5">{ord}</p>
        </div>

        {/* Fee notice */}
        <div className="mt-4 rounded-lg border border-[#e8c9a8] bg-[#fdf6ee] px-5 py-4">
          <p className="text-[12px] leading-relaxed text-[#7a5a34]">
            <b className="text-[#5c421f]">⚠ One-time rescheduling fee: ₱500.00</b><br />
            The fee is added to your remaining balance and is payable together with your order on delivery (COD). It is charged only once, no matter the new date.
          </p>
        </div>

        {/* Messenger CTA */}
        <a href={mme} target="_blank" rel="noreferrer"
          className="block w-full mt-6 bg-[#0084ff] hover:bg-[#0073e0] text-white text-center text-[14px] font-bold py-4 rounded-lg transition-colors">
          💬 Message Us on Messenger
        </a>
        <p className="text-[11px] text-[#8a8272] mt-3 leading-relaxed text-center">
          Opening Messenger sends your order details to our team automatically. We respond during business hours (Mon–Sat, 8:00 AM–5:00 PM). Your current schedule stays reserved until a new date is agreed.
        </p>
      </div>

      {/* Dark footer */}
      <div className="bg-[#33261c] px-7 py-5 text-center">
        <p className="font-cormorant font-bold text-sm tracking-[0.25em] text-[#f4ead8]">PAN&nbsp;FURNITURE</p>
        <p className="text-[11px] text-[#c9b896] mt-2">
          San Pedro, Laguna ·{" "}
          <a href="mailto:panfurnitureph@gmail.com" className="text-[#caa45a] underline">panfurnitureph@gmail.com</a>
        </p>
        <p className="text-[10px] text-[#8f7f68] mt-2.5">Ref DC-{ord.replace(/^ORD-/, "")}-RS · This reschedule link is unique to your order</p>
      </div>
    </div>
  );
}
