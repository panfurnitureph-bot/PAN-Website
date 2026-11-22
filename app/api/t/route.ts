// WEBSITE ANALYTICS — pasahan papunta sa PAN app (Joe 2026-11-22).
//
// Ang browser ay nagpapadala dito (parehong domain = walang CORS, at mas bihira
// harangin ng ad-blocker kaysa sa third-party tracker). Idinadagdag ang IP at
// user-agent at ipinapasa sa IMS /api/web-analytics/collect gamit ang parehong
// secret ng website orders. Ang IP ay para lang sa tantyang probinsya; hindi ito
// iniimbak ng IMS.

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const APP_URL = (process.env.PAN_APP_URL || "https://panfurnitures.cloud").replace(/\/+$/, "");

export async function POST(req: NextRequest) {
  const secret = process.env.PAN_APP_WEBHOOK_SECRET;
  if (!secret) return new NextResponse(null, { status: 204 });
  let body: { events?: unknown; ping?: unknown };
  try {
    body = JSON.parse(await req.text());
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  // Lahat ng posibleng IP (CDN/proxy chain) — ang IMS ang pipili ng unang natukoy.
  const ip = [req.headers.get("cf-connecting-ip"), req.headers.get("true-client-ip"), req.headers.get("x-forwarded-for"), req.headers.get("x-real-ip")]
    .filter(Boolean).join(",");
  const ua = req.headers.get("user-agent") || "";
  try {
    await fetch(`${APP_URL}/api/web-analytics/collect`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-webhook-secret": secret },
      body: JSON.stringify({ ip, ua, events: body.events, ping: body.ping }),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    // Hindi mahalaga kung mawala ang isang bilang — huwag guluhin ang bisita.
  }
  return new NextResponse(null, { status: 204 });
}
