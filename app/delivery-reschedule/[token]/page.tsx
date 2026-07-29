import type { Metadata } from "next";
import RescheduleClient from "./RescheduleClient";

// Reschedule page — binubuksan mula sa 2-days-before delivery reminder email.
// DITO LANG may reschedule option; ang bagong petsa ay auto-confirmed.

export const metadata: Metadata = { title: "Reschedule Your Delivery — PAN Furniture" };
export const dynamic = "force-dynamic";

const APP_URL = (process.env.PAN_APP_URL || "https://pan-furnitures.vercel.app").replace(/\/+$/, "");

type Summary = {
  orderNumber: string | null;
  customerName: string | null;
  currentDate: string | null;
};

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let summary: Summary | null = null;
  try {
    const r = await fetch(`${APP_URL}/api/delivery/reschedule?token=${encodeURIComponent(token)}`, { cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (r.ok) summary = (await r.json()) as Summary;
  } catch { /* invalid state sa ibaba */ }

  return (
    <div className="max-w-lg mx-auto px-6 py-16 sm:py-24">
      <div className="text-center mb-10">
        <p className="text-[11px] font-bold tracking-widest2 text-olive mb-3">RESCHEDULE DELIVERY</p>
        <h1 className="font-cormorant font-medium text-4xl sm:text-5xl leading-tight mb-3">
          {summary ? "Pick a new date" : "Link no longer valid"}
        </h1>
        <p className="text-stone text-sm leading-relaxed">
          {summary
            ? "Choose a new delivery date below — your new schedule is confirmed immediately."
            : "This link has expired or is invalid. If you believe this is a mistake, please contact our team."}
        </p>
      </div>
      {summary && <RescheduleClient token={token} summary={summary} />}
    </div>
  );
}
