"use client";

// WEBSITE ANALYTICS (Joe 2026-11-22): isang "view" kada page na binuksan, at
// tibok kada 30s habang nakikita ang page (para sa "on the site now" sa IMS).
// Walang ipinapakita — tahimik na tagabilang lang.

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackView, heartbeat } from "@/lib/analytics";

export default function Analytics() {
  const pathname = usePathname();
  useEffect(() => {
    trackView();
  }, [pathname]);
  useEffect(() => {
    const t = window.setInterval(heartbeat, 30_000);
    const onShow = () => { if (document.visibilityState === "visible") heartbeat(); };
    document.addEventListener("visibilitychange", onShow);
    return () => { window.clearInterval(t); document.removeEventListener("visibilitychange", onShow); };
  }, []);
  return null;
}
