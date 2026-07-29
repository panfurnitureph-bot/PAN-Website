import { NextResponse } from "next/server";

// Server-side proxy papunta sa IMS reschedule API — panfurniture.ph lang ang
// nakikita ng browser ng customer.
const APP_URL = (process.env.PAN_APP_URL || "https://pan-furnitures.vercel.app").replace(/\/+$/, "");

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown = {};
  try { body = await req.json(); } catch { /* walang body */ }
  try {
    const r = await fetch(`${APP_URL}/api/delivery/reschedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    return NextResponse.json(await r.json(), { status: r.status });
  } catch {
    return NextResponse.json({ error: "Could not reach the scheduling service — please try again." }, { status: 502 });
  }
}
