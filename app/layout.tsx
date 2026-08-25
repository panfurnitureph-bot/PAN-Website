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
  title: "PAN Furniture",
  description:
    "Premium sofas, sectionals, dining, bedroom, and outdoor furniture. Quality materials, built to last. Free shipping and a 100-day happiness guarantee.",
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
      <body className="font-sans">
        {/* page-clip: pumipigil sa pahalang na page drift. Nasa wrapper ito at
            HINDI sa html/body — sa iOS Safari, overflow-x sa root = hindi na
            ma-swipe ang mga carousel sa buong site. */}
        <div className="page-clip">
        <StoreProvider>
          {/* Nakikinig kung may binago sa PAN app admin — nagre-refresh ang
              nakabukas na page nang hindi kailangang gawin ito ng bisita. */}
          <ContentLive />
          <Suspense fallback={null}>
            <EmbedMode />
          </Suspense>
          <Header site={site} nav={NAV_LINKS} />
          <main className="min-h-screen">{children}</main>
          <Footer site={site} shop={shopLinks()} />
          <TrackButton />
          <ChatBubble site={site} />
        </StoreProvider>
        </div>
      </body>
    </html>
  );
}
