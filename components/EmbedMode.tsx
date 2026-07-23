"use client";

// Kapag ang pahina ay binuksan sa loob ng pop-up (iframe) na may ?embed=1,
// itinatago nito ang header, footer, at mga lumulutang na buton — para ang
// laman lang ang lumabas sa pop-up, walang doble na navigation.

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function EmbedMode() {
  const params = useSearchParams();
  const embed = params.get("embed") === "1";

  useEffect(() => {
    if (!embed) return;
    document.documentElement.setAttribute("data-embed", "1");

    // Iulat ang taas ng laman sa parent (ang track pop-up) tuwing may pagbabago —
    // para sakto lang ang modal sa form, at hahaba lang kapag may resulta.
    const report = () => {
      const h = document.body.scrollHeight;
      window.parent?.postMessage({ type: "track-height", height: h }, "*");
    };
    report();
    const ro = new ResizeObserver(report);
    ro.observe(document.body);
    return () => {
      document.documentElement.removeAttribute("data-embed");
      ro.disconnect();
    };
  }, [embed]);

  return null;
}
