import { NextRequest, NextResponse } from "next/server";

// MADE-TO-ORDER QUOTE REQUEST — server-only relay papunta sa PAN app
// (parehong pattern ng /api/send-order): dito nakatago ang webhook secret.
// Kapag hindi naka-set ang env, ok:false pero 200 — hindi hinaharang ang
// customer; ang site ay babagsak sa plain Messenger link.

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const base = (process.env.PAN_APP_URL || "").replace(/\/+$/, "");
  const secret = process.env.PAN_APP_WEBHOOK_SECRET || "";
  if (!base || !secret) {
    return NextResponse.json({ ok: false, skipped: "PAN app relay not configured" });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  try {
    const res = await fetch(`${base}/api/webhook/mto-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-webhook-secret": secret },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch {
    return NextResponse.json({ ok: false, error: "relay failed" });
  }
}
