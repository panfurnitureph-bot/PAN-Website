import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

// OG CARD (2026-09-03, "pag sinend ung link sira sya"): kapag ni-share ang
// link sa Messenger/FB, dating ang hilaw na product photo (portrait, iba-iba
// ang canvas) ang hinuhugot at pinuputol ng chat card — putol na upuan ang
// preview. Ito ang laging-maayos na 1200x630 na branded card: puting ground,
// buong litrato sa kanan (contain, hindi putol), pangalan + presyo + wordmark
// sa kaliwa. Ginagamit ng product at collection pages via openGraph.images.

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const title = (sp.get("title") ?? "PAN Furniture").slice(0, 80);
  const price = sp.get("price") ?? "";
  const img = sp.get("img") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#ffffff",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Kaliwa: branding + pangalan + presyo */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "56px 24px 56px 64px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 34, height: 4, background: "#B87333", display: "flex" }} />
            <div style={{ fontSize: 26, letterSpacing: 6, color: "#1A1A1A", fontWeight: 700 }}>PAN FURNITURE</div>
          </div>
          <div style={{ fontSize: 58, color: "#1A1A1A", marginTop: 28, lineHeight: 1.1, display: "flex" }}>{title}</div>
          {price ? (
            <div style={{ fontSize: 34, color: "#B87333", marginTop: 22, display: "flex" }}>{price}</div>
          ) : null}
          <div style={{ fontSize: 22, color: "#8a8272", marginTop: 30, display: "flex" }}>panfurniture.ph</div>
        </div>
        {/* Kanan: buong litrato, contain — walang putol */}
        {img ? (
          <div
            style={{
              width: 520,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          </div>
        ) : null}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
