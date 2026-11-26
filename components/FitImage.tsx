"use client";

// FIT IMAGE (2026-09-04, "may malaki may maliit"): iba-iba ang puting margin ng
// mga product photo, kaya sa object-contain ang isa ay maliit sa gitna at ang
// isa ay puno. Sinusukat dito ang silhouette ng produkto (lib/subject-box) at
// ini-scale/ini-center para ang produkto ay laging ~82% ng tile — pare-pareho
// ang laki sa cards, rails at category tiles. Walang silhouette (CORS, eksena
// sa likod) = walang transform, contain lang gaya ng dati.
//
// ANINO SA PAANAN (Joe 2026-11-27, "bakit putol sa display"): dating nakapako
// ang pf-floor sa 7% mula sa ibaba, kaya may puwang sa pagitan ng kama at ng
// anino — mukhang lumulutang at parang naputol ang ilalim ng cut-out. Sa
// `shadow`, ang anino ay nasa mismong ilalim ng produkto at kasing-lapad nito.

import Image from "next/image";
import { useSubjectBoxes } from "@/lib/subject-box";

export default function FitImage({ src, alt, sizes, className = "", fill = 0.68, priority, shadow = false }: { src: string; alt: string; sizes: string; className?: string; fill?: number; priority?: boolean; shadow?: boolean }) {
  const [box] = useSubjectBoxes([src]);
  let style: React.CSSProperties | undefined;
  let floor: React.CSSProperties | undefined;
  if (box) {
    const bw = (box.r - box.l) / 100, bh = (box.b - box.t) / 100;
    const s = Math.min(2.2, Math.max(0.6, fill / Math.max(bw, bh, 0.01)));
    // Target: gitna sa 54% pababa - may lugar ang IN STOCK / MADE TO ORDER na
    // tag at heart sa itaas ng card (2026-09-04, "tinatamaan ang tag").
    const cx = (box.l + box.r) / 2, cy = (box.t + box.b) / 2;
    const tx = 50 - cx * s, ty = 54 - cy * s; // % ng container
    style = { transform: `translate(${tx.toFixed(2)}%, ${ty.toFixed(2)}%) scale(${s.toFixed(3)})`, transformOrigin: "0 0" };
    // Ilalim at lapad ng produkto sa container (%); ang anino ay 90% ng lapad.
    const bottom = ty + box.b * s, left = tx + box.l * s, width = bw * 100 * s;
    floor = { left: `${(left + width * 0.05).toFixed(2)}%`, right: "auto", width: `${(width * 0.9).toFixed(2)}%`, top: `calc(${bottom.toFixed(2)}% - 9px)`, bottom: "auto", height: 18 };
  }
  return (
    <>
      {shadow && <i aria-hidden className="pf-floor" style={floor} />}
      <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className={`object-contain ${className}`} style={style} />
    </>
  );
}
