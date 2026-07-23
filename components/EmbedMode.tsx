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
    if (embed) document.documentElement.setAttribute("data-embed", "1");
    return () => document.documentElement.removeAttribute("data-embed");
  }, [embed]);

  return null;
}
