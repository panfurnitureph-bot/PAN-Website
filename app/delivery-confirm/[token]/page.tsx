import type { Metadata } from "next";
import ConfirmClient from "./ConfirmClient";

// Delivery-confirmation page — binubuksan mula sa confirmation email ng PAN
// Furniture. Ang data ay kinukuha server-side mula sa IMS (token-guarded),
// kaya ang browser ng customer ay panfurniture.ph lang ang kausap.

export const metadata: Metadata = { title: "Confirm Your Delivery — PAN Furniture" };
export const dynamic = "force-dynamic";

const APP_URL = (process.env.PAN_APP_URL || "https://panfurnitures.cloud").replace(/\/+$/, "");

type Summary = {
  orderNumber: string | null;
  customerName: string | null;
  address: string | null;
  item?: string | null;
  items?: { name: string; specs: string[]; qty: number; priceTotal: number | null; photoUrl: string | null; tag: string | null; tagBg: string | null; tagColor: string | null; dimmed: boolean }[];
  date: string | null;
  timeWindow?: string | null;
  balance: number;
  alreadyConfirmed: boolean;
};

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let summary: Summary | null = null;
  try {
    const r = await fetch(`${APP_URL}/api/delivery/confirm?token=${encodeURIComponent(token)}`, { cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (r.ok) summary = (await r.json()) as Summary;
  } catch { /* ibaba ang invalid state */ }

  return (
    <div className="max-w-lg mx-auto px-6 py-16 sm:py-24">
      {!summary && (
        <div className="text-center mb-10">
          <p className="text-[11px] font-bold tracking-widest2 text-olive mb-3">DELIVERY CONFIRMATION</p>
          <h1 className="font-cormorant font-medium text-4xl sm:text-5xl leading-tight mb-3">Link no longer valid</h1>
          <p className="text-stone text-sm leading-relaxed">
            This confirmation link has expired or is invalid. If you believe this is a mistake, please contact our team.
          </p>
        </div>
      )}
      {summary && <ConfirmClient token={token} summary={summary} />}
    </div>
  );
}
