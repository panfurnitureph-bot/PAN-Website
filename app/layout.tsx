import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/components/store";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Suspense } from "react";
import ChatBubble from "@/components/ChatBubble";
import TrackButton from "@/components/TrackButton";
import EmbedMode from "@/components/EmbedMode";
import ContentLive from "@/components/ContentLive";
import HydrationMark from "@/components/HydrationMark";
import { BOOT_SCRIPT } from "@/components/boot-script";
import { primeStoreContent } from "@/lib/content";
import { NAV_LINKS, shopLinks } from "@/lib/products";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// DISPLAY (2026-08-26) — Cormorant ito noon: ang libreng Didot na ginagamit ng
// bawat furniture, skincare at hotel na site. Maganda ang titik, pero walang
// sinasabi tungkol sa PAN. Ang Bricolage Grotesque ay makapal at bahagyang
// hindi pantay — gawa ng kamay, hindi boutique sa Milan.
//
// Pinanatili ang variable name (--font-cormorant) at ang class na
// `font-cormorant`: nasa sampung file ito, at ang pagpapalit ng pangalan ay
// walang idadagdag maliban sa panganib. Isang linya lang ang ibabalik kung
// hindi bagay.
const cormorant = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  // Absolute base para sa og:image ng bawat page (2026-09-03) — ang mga
  // scraper (Messenger/FB) ay nangangailangan ng buong URL.
  metadataBase: new URL("https://panfurniture.ph"),
  title: "PAN Furniture",
  description:
    "Made-to-order beds, sofas, dining and living furniture built in our San Pedro, Laguna workshop. 217 fabrics, 6-month warranty, delivered and set up nationwide by our own team.",
  // Kumpletong OG (2026-09-04, "plain lang ang link sa Messenger"): url, type,
  // 1200x630 na sukat at alt para tanggapin ng FB/Messenger scraper; v=2 para
  // hindi ang lumang naka-cache na card ang lumabas.
  openGraph: {
    type: "website",
    url: "/",
    siteName: "PAN Furniture",
    title: "PAN Furniture",
    description: "Made-to-order beds, sofas, dining and living furniture built in San Pedro, Laguna. Delivered and set up nationwide by our own team.",
    images: [{ url: "/api/og?title=PAN%20Furniture&v=2", width: 1200, height: 630, alt: "PAN Furniture" }],
  },
  twitter: { card: "summary_large_image", title: "PAN Furniture", images: ["/api/og?title=PAN%20Furniture&v=2"] },
  // Favicon mula sa /public (static — hindi na dynamic route, iwas crash)
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Ang Header/Footer/ChatBubble ay client components — dito (sa server)
  // kinukuha ang `site` at ipinapasa bilang props, dahil sa browser ay
  // hindi tumatakbo ang primeContent().
  const { site } = await primeStoreContent();

  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <head>
        {/* Plain JS na tumatakbo BAGO ang React (2026-09-05): (1) minamarkahan
            ang <html data-scrolled> sa pag-scroll para ang header ay maging
            opaque kahit hindi nag-hydrate ang page; (2) kung hindi nabuhay ang
            React pagkatapos mag-load (nabitawan ng CDN ang isang chunk), isang
            reload — max 2 kada 10 min. */}
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body className="font-sans">
        <HydrationMark />
        {/* page-clip: pumipigil sa pahalang na page drift. Nasa wrapper ito at
            HINDI sa html/body — sa iOS Safari, overflow-x sa root = hindi na
            ma-swipe ang mga carousel sa buong site. */}
        {/* Walang min-h-screen sa main (2026-09-04, "laki ng space"): kapag maikli
            ang page, footer agad; ang brownDeep sa wrapper ang pumupuno sa
            ilalim ng footer sa matataas na screen - hindi blangkong cream. */}
        <div className="page-clip min-h-screen bg-brownDeep">
        <StoreProvider>
          {/* Nakikinig kung may binago sa PAN app admin — nagre-refresh ang
              nakabukas na page nang hindi kailangang gawin ito ng bisita. */}
          <ContentLive />
          <Suspense fallback={null}>
            <EmbedMode />
          </Suspense>
          <Header site={site} nav={NAV_LINKS} />
          <main className="bg-cream">{children}</main>
          <Footer site={site} shop={shopLinks()} />
          <TrackButton />
          <ChatBubble site={site} />
        </StoreProvider>
        </div>
      </body>
    </html>
  );
}
