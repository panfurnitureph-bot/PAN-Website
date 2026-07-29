import { NextResponse } from "next/server";

// Server-side proxy papunta sa IMS confirm API — para ang browser ng customer
// ay panfurniture.ph LANG ang kausap (hindi lantad ang IMS host).
const APP_URL = (process.env.PAN_APP_URL || "https://pan-furnitures.vercel.app").replace(/\/+$/, "");

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let token = "";
  try { token = String((await req.json())?.token ?? ""); } catch { /* walang body */ }
  try {
    const r = await fetch(`${APP_URL}/api/delivery/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    return NextResponse.json(await r.json(), { status: r.status });
  } catch {
    return NextResponse.json({ error: "Could not reach the scheduling service — please try again." }, { status: 502 });
  }
}
