// MATTRESS SIZES (Joe 2026-09-24): iisang pinagmumulan para sa product page
// (size list) at sa product card (size chips sa hilera ng bilog). Ang mga
// sukat ay galing sa specs line ng listing — "Sizes: 36x75 ₱7,100 · 48x75
// ₱8,650 · …" (IMS 2026-08-23) — at ang pangalan ay kapareho ng Dimensions tab.

export const MATTRESS_SIZE_NAME: Record<string, string> = {
  "30x75": "Single", "36x75": "Single", "48x75": "Twin", "54x75": "Double/Full", "60x75": "Queen", "72x75": "King", "72x78": "King 2",
};

export type MattressSize = { label: string; name: string; price: number };

export const sizeName = (label: string): string | undefined => MATTRESS_SIZE_NAME[label.replace(/\s+/g, "").toLowerCase()];

// Basahin ang "Sizes:" line ng mtoReadySpecs. Blangko kapag wala.
export function parseMattressSizes(product: { category?: string; mtoReadySpecs?: string } & Record<string, unknown>): MattressSize[] {
  if (!/mattress/i.test(String(product.category ?? ""))) return [];
  const lines = String(product.mtoReadySpecs ?? "").split("\n").map((s) => s.trim().replace(/^[•·\-]\s*/, ""));
  const line = lines.find((l) => /^sizes:/i.test(l));
  if (!line) return [];
  return line.replace(/^sizes:\s*/i, "").split(/\s*·\s*/).map((t) => {
    const m = /^(\S+)(?:\s+₱?\s*([\d,]+(?:\.\d+)?))?/.exec(t.trim());
    if (!m || !m[1]) return null;
    const label = m[1];
    return { label, name: sizeName(label) ?? label.replace(/x/i, "×"), price: Number((m[2] ?? "0").replace(/,/g, "")) };
  }).filter((x): x is MattressSize => !!x);
}
