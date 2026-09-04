import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

// OG CARD (2026-09-03, "pag sinend ung link sira sya"): kapag ni-share ang
// link sa Messenger/FB, dating ang hilaw na product photo (portrait, iba-iba
// ang canvas) ang hinuhugot at pinuputol ng chat card — putol na upuan ang
// preview. Ito ang laging-maayos na 1200x630 na branded card.
//
// 2026-09-04: PAN brand (cream ground, gold rule, bilog na logo), Inter na font
// mula /public/fonts para lumabas ang ₱ (ang default na font ng satori ay
// walang peso sign — kahon ang lumalabas), at kapag walang product photo
// (homepage, collections) ang malaking logo ang nasa kanan para hindi
// blangko ang card. Ginagamit ng root layout, product at collection pages.

export const runtime = "nodejs";

let fontsP: Promise<{ regular: Buffer; semibold: Buffer; bold: Buffer; logo: string }> | null = null;
function assets() {
  if (!fontsP) {
    const pub = path.join(process.cwd(), "public");
    fontsP = Promise.all([
      readFile(path.join(pub, "fonts/Inter-Regular.ttf")),
      readFile(path.join(pub, "fonts/Inter-SemiBold.ttf")),
      readFile(path.join(pub, "fonts/Inter-Bold.ttf")),
      readFile(path.join(pub, "images/pan-logo.png")),
    ]).then(([regular, semibold, bold, logo]) => ({ regular, semibold, bold, logo: `data:image/png;base64,${logo.toString("base64")}` }));
  }
  return fontsP;
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const title = (sp.get("title") ?? "PAN Furniture").slice(0, 80);
  const price = sp.get("price") ?? "";
  const img = sp.get("img") ?? "";
  const sub = (sp.get("sub") ?? "Made to order in San Pedro, Laguna · Delivered nationwide by our own team").slice(0, 120);
  const { regular, semibold, bold, logo } = await assets();

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#FAF7F2", fontFamily: "Inter" }}>
        <div style={{ height: 8, background: "#E2C27A", display: "flex" }} />
        <div style={{ flex: 1, display: "flex" }}>
          {/* Kaliwa: logo + wordmark, pangalan, presyo, tagline, domain */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 24px 48px 64px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt="" width={56} height={56} style={{ width: 56, height: 56 }} />
              <div style={{ fontSize: 22, letterSpacing: 7, color: "#3E3220", fontWeight: 600, display: "flex" }}>PAN FURNITURE</div>
            </div>
            <div style={{ fontSize: title.length > 28 ? 46 : 58, color: "#231C14", marginTop: 30, lineHeight: 1.1, fontWeight: 700, display: "flex" }}>{title}</div>
            {price ? <div style={{ fontSize: 36, color: "#B08A3E", marginTop: 18, fontWeight: 600, display: "flex" }}>{price}</div> : null}
            <div style={{ fontSize: 20, color: "#6E6357", marginTop: price ? 22 : 18, lineHeight: 1.4, display: "flex", maxWidth: 560 }}>{sub}</div>
            <div style={{ fontSize: 18, color: "#B08A3E", marginTop: 26, letterSpacing: 2, display: "flex" }}>panfurniture.ph</div>
          </div>
          {/* Kanan: buong product photo (contain), o ang logo kapag wala */}
          <div style={{ width: 500, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 28, background: img ? "#FFFFFF" : "transparent" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img || logo} alt="" style={{ maxWidth: img ? "100%" : 340, maxHeight: img ? "100%" : 340, objectFit: "contain" }} />
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Inter", data: regular, weight: 400, style: "normal" },
        { name: "Inter", data: semibold, weight: 600, style: "normal" },
        { name: "Inter", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
