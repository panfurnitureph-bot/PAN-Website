// PANGKAT-PANGKAT ANG BUILD, hindi isang mahabang listahan — parehong hati ng
// quotation at ng Messenger echo, kaya kilala na ng customer ang porma bago pa
// dumating ang dokumento: ang bagay, ang idinagdag dito, at ang dingding na may
// sariling sukat.
//
// NASA lib/ (2026-08-22): ginagamit ito ng /quote-request AT ng /checkout. Nang
// nasa isang page lang ito, ang checkout ay may sariling patag na listahan —
// magkaibang porma ang parehong build depende kung saan mo tinitingnan.

export type BuildLine = { label: string; price?: number };
export type BuildGroup = { title: string; lines: BuildLine[] };

export function groupBuildLines(lines: BuildLine[]): BuildGroup[] {
  const seen = new Set<string>();
  const raw = lines
    .map((l) => ({ ...l, label: String(l.label).replace(/^[•·-]\s*/, "").trim() }))
    .filter((l) => {
      const k = l.label.toLowerCase();
      if (!l.label || seen.has(k)) return false;
      seen.add(k);
      return true;
    });

  // Height/Thickness/Width ng dingding = ang mga KASUNOD ng "Double walling"
  // (2026-09-04); ang nauunang "Width: 34"" ay sukat ng produkto mismo.
  const wallIdx = raw.findIndex((l) => /^double walling\b/i.test(l.label));
  const hasWall = wallIdx >= 0;
  const isWall = (l: string) =>
    hasWall && (/^(double walling|frame dimension|decorative nails|gold accent)\b/i.test(l) || (/^(height|thickness|width)\b/i.test(l) && raw.findIndex((x) => x.label === l) > wallIdx));

  // Ang mga SUKAT ay bahagi ng bagay mismo, hindi idinagdag dito: ang taas at
  // lalim ng sofa ang sofa. Sa "Add-ons", parang may pinili pang dagdag ang
  // customer gayong sinusukat lang niya ang binibili.
  const isMeasure = (l: string) =>
    /\b\d/.test(l) && /^(total |armrest |backrest |seat |headboard )?(height|width|thickness|depth|length)\b/i.test(l);

  const wallLines = raw.filter((l) => isWall(l.label));
  const nonWall = raw.filter((l) => !isWall(l.label));

  // ANG Size/Fabric ANG TANDA NA MAY PANGKAT. Kapag wala ang alinman, ang
  // buong listahan ANG produkto — ang side table ay taas at kulay ng kahoy, at
  // ang paghahati niyon ay naglalagay ng magkapatid na linya sa magkaibang
  // pangkat na parang may pinili pang dagdag ang customer.
  const core = nonWall.some((l) => /^(size|fabric)\b/i.test(l.label));
  const isItem = (l: string) => /^(size|fabric)\b/i.test(l) || isMeasure(l);
  const itemLines = core ? nonWall.filter((l) => isItem(l.label)) : nonWall;
  const rest = core ? nonWall.filter((l) => !isItem(l.label)) : [];

  return [
    { title: "The item", lines: itemLines },
    ...(rest.length ? [{ title: "Add-ons", lines: rest }] : []),
    ...(wallLines.length ? [{ title: "Double walling", lines: wallLines }] : []),
  ].filter((g) => g.lines.length);
}
