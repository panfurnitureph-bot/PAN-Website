// SEND ORDER — ipinapadala ang checkout order sa PAN Furnitures app
// (Supabase-backed) via webhook. Ang secret ay server-side lang.
//
// Kailangan sa .env.local:
//   PAN_APP_URL=https://your-pan-app-url        (o http://localhost:3001)
//   PAN_APP_WEBHOOK_SECRET=<parehong secret ng app>

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
// Ang IMS ay minsan malamig (cold start) + Maya QR — huwag mamatay sa 10s.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const appUrl = process.env.PAN_APP_URL;
  const secret = process.env.PAN_APP_WEBHOOK_SECRET;

  if (!appUrl || !secret) {
    // Hindi pa naka-configure — huwag i-block ang checkout, i-log lang.
    return NextResponse.json(
      { ok: false, skipped: "PAN_APP_URL / PAN_APP_WEBHOOK_SECRET not set" },
      { status: 200 },
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    // Isang ulit kapag pumalya nang transient (cold start / network blip) —
    // ang sukong dito ay nagiging PAN-XXXX fallback na WALANG QR at email.
    const send = () =>
      fetch(`${appUrl.replace(/\/$/, "")}/api/webhook/website-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": secret,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
        signal: AbortSignal.timeout(25_000),
      });
    let res: Response;
    try {
      res = await send();
      if (res.status >= 500) throw new Error(`App returned ${res.status}`);
    } catch {
      res = await send();
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: data?.error ?? `App returned ${res.status}` },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true, ...data });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 502 },
    );
  }
}
