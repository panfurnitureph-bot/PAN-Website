"use client";

import { useEffect } from "react";

// Nagtatakda ng window.__pan_hydrated kapag buhay na ang React. Binabasa ito ng
// boot script sa root layout: kung hindi ito lumitaw pagkatapos mag-load
// (nabitawan ng CDN ang isang chunk), isang reload ang gagawin.
export default function HydrationMark() {
  useEffect(() => {
    (window as unknown as { __pan_hydrated?: boolean }).__pan_hydrated = true;
  }, []);
  return null;
}
