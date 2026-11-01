// PACKAGED SIZE (2026-09-04): sukat ng produkto + ~2" kada gilid, mula sa
// dimensions text ng listing. Nasa lib (walang "use client") para matawag ng
// server page (/measuring) at ng client modal (FitModal) - ang pag-import ng
// function mula sa client component papunta sa server ay nagba-crash
// ("Attempted to call packagedFrom() from the server").

export type Packaged = { w: number; d: number; h: number };

// Hilahin ang W/D/H mula sa dimensions text (hal. `34" W x 24" D x 28" H`).
export function packagedFrom(dimensions: string): Packaged | null {
  // Metric na dimensions ("60 cm W x 67 cm D x 92 cm H", IMS 2026-11-01) ay ginagawang pulgada dito,
  // para ang door-fit math ay pulgada pa rin.
  const grab = (axis: string) => { const m = dimensions.match(new RegExp(`([\d.]+)\s*(cm|mm|"|”|in)?\s*${axis}(?![a-z])`, "i")); if (!m) return NaN; const n = Number(m[1]); const u = (m[2] ?? "").toLowerCase(); return u === "cm" ? n / 2.54 : u === "mm" ? n / 25.4 : n; };
  const w = grab("W"), d = grab("D"), h = grab("H");
  if (!(w > 0 && h > 0)) return null;
  // Naka-balot: dagdag ~2" kada gilid.
  return { w: Math.round(w + 2), d: Math.round((d > 0 ? d : Math.min(w, h)) + 2), h: Math.round(h + 2) };
}

