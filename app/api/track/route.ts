// TRACK — ipinapasa ang tanong sa PAN app at ibinabalik ang sagot.
//
// Bakit hindi diretso mula sa browser: ang PAN app ay ibang domain, kaya
// haharangin ito ng browser (CORS). Ang buksan ang app sa kahit anong site ay
// mas malaking bukas kaysa sa isang proxy dito — at sa ganitong paraan, ang
// storefront lang ang tumatawag sa app.

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const APP_URL = (process.env.PAN_APP_URL || "https://pan-furnitures.vercel.app").replace(/\/+$/, "");

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const order = (sp.get("order") || "").trim();
  const verify = (sp.get("verify") || "").trim();
  // Ang lagdang token (mula sa FB alert) ang katumbas ng verify — direktang
  // bumubukas ang tracker. Ipinapasa natin ito sa app nang buo.
  const token = (sp.get("t") || "").trim();

  if (!order || (!verify && !token)) {
    return NextResponse.json(
      { error: "Order number and email or phone are required." },
      { status: 400 },
    );
  }

  try {
    const qs = `order=${encodeURIComponent(order)}` +
      (verify ? `&verify=${encodeURIComponent(verify)}` : "") +
      (token ? `&t=${encodeURIComponent(token)}` : "");
    const res = await fetch(
      `${APP_URL}/api/track?${qs}`,
      { cache: "no-store" },
    );
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "We couldn't reach the order system. Please try again in a moment." },
      { status: 502 },
    );
  }
}
