import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// PAGHAHANAP NG ADDRESS — server-side proxy sa Google Places, may Photon fallback.
//
// BAKIT SA SERVER: ang GOOGLE_PLACES_KEY ay hindi dapat mapunta sa browser. Kung
// NEXT_PUBLIC_ ito, makikita ng sinuman sa page source at magagamit sa credit natin.
//
// BAKIT GOOGLE: ang OpenStreetMap (Photon, Mapbox) ay malakas sa kalye at barangay
// pero WALANG NEGOSYO — walang bangko, walang SSS, walang ATM. Nakumpara noong
// 2026-08-23 sa "9173 Brgy Maduya Carmona": ang Google lang ang nagbalik ng
// BRGY MADUYA CARMONA, PNB, SSS at UnionBank — ang parehong listahang nakikita sa
// JoyRide at sa Google Maps. Iyon ang hinahanap ng customer.
//
// BAKIT MAY PHOTON PA RIN: kapag hindi sumagot ang Google — nawalang quota, patay
// na billing, o network — mas mabuti ang mas mahinang suggestion kaysa walang
// makikita ang customer.

type Suggestion = {
  id: string;
  main: string;      // "BRGY MADUYA CARMONA"
  secondary: string; // "Loyola St, Maduya, Carmona, Cavite"
  source: "google" | "photon";
  lat?: number;
  lng?: number;
};

const PH_BBOX = "116.9,4.5,126.6,21.1";

async function google(input: string, key: string): Promise<Suggestion[]> {
  const r = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key },
    body: JSON.stringify({ input, includedRegionCodes: ["ph"] }),
    signal: AbortSignal.timeout(6000),
  });
  const j = (await r.json()) as {
    suggestions?: { placePrediction?: { placeId: string; structuredFormat?: { mainText?: { text: string }; secondaryText?: { text: string } } } }[];
    error?: { message?: string };
  };
  if (!r.ok || j.error) throw new Error(j.error?.message || `http ${r.status}`);
  return (j.suggestions ?? [])
    .map((s) => s.placePrediction)
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => ({
      id: p.placeId,
      main: p.structuredFormat?.mainText?.text ?? "",
      secondary: p.structuredFormat?.secondaryText?.text ?? "",
      source: "google" as const,
    }));
}

async function photon(input: string): Promise<Suggestion[]> {
  const r = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(input)}&limit=6&lang=en&bbox=${PH_BBOX}`,
    { signal: AbortSignal.timeout(6000) },
  );
  const j = (await r.json()) as {
    features?: { geometry: { coordinates: [number, number] }; properties: Record<string, string> }[];
  };
  return (j.features ?? []).map((f, i) => {
    const p = f.properties;
    return {
      id: `photon-${i}`,
      main: p.name || p.street || p.city || "",
      secondary: [p.housenumber, p.street, p.district, p.city, p.county, p.state]
        .filter(Boolean)
        .filter((v, k, a) => a.indexOf(v) === k)
        .join(", "),
      source: "photon" as const,
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
    };
  });
}

// GET ?q=… → listahan ng suggestion
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  if (q.length < 2) return NextResponse.json({ suggestions: [] });

  const key = process.env.GOOGLE_PLACES_KEY || "";
  if (key) {
    try {
      const s = await google(q, key);
      if (s.length) return NextResponse.json({ suggestions: s, source: "google" });
    } catch (e) {
      // Hindi ito itinatago: kapag patay ang Google, dapat makita sa log kung bakit
      // biglang naging mas mahina ang paghahanap.
      console.warn("[places] Google failed, falling back to Photon:", e instanceof Error ? e.message : e);
    }
  }
  try {
    return NextResponse.json({ suggestions: await photon(q), source: "photon" });
  } catch {
    return NextResponse.json({ suggestions: [], source: "none" });
  }
}

// POST { id } → buong detalye ng isang napiling lugar: coordinates at bawat
// bahagi ng address, para mapunan ang buong form sa isang pindot.
export async function POST(req: NextRequest) {
  let body: { id?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  const id = (body.id || "").trim();
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  const key = process.env.GOOGLE_PLACES_KEY || "";
  if (!key) return NextResponse.json({ error: "not configured" }, { status: 500 });

  try {
    const r = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`, {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "id,displayName,formattedAddress,location,addressComponents",
      },
      signal: AbortSignal.timeout(6000),
    });
    const j = (await r.json()) as {
      displayName?: { text: string };
      formattedAddress?: string;
      location?: { latitude: number; longitude: number };
      addressComponents?: { longText: string; shortText: string; types: string[] }[];
      error?: { message?: string };
    };
    if (!r.ok || j.error) return NextResponse.json({ error: j.error?.message || `http ${r.status}` }, { status: 502 });

    // ANG HUGIS NG ADDRESS SA PILIPINAS — nasukat sa tunay na sagot ng Google
    // (BRGY MADUYA CARMONA, 2026-08-23):
    //   Maduya      [sublocality_level_2, sublocality]  ← barangay
    //   Carmona     [locality]                          ← bayan / lungsod
    //   Cavite      [administrative_area_level_2]       ← LALAWIGAN
    //   Calabarzon  [administrative_area_level_1]       ← rehiyon, HINDI lalawigan
    // Ang administrative_area_level_1 ay ang rehiyon dito, hindi ang lalawigan —
    // kaya "Calabarzon" ang lalabas kung iyon ang kukunin, at hindi ito tutugma
    // sa shipping table na naka-lalawigan.
    const comp = (t: string) => j.addressComponents?.find((c) => c.types.includes(t))?.longText ?? "";
    const barangay =
      comp("sublocality_level_1") || comp("sublocality_level_2") || comp("sublocality") ||
      comp("neighborhood") || comp("administrative_area_level_3");
    const city = comp("locality") || comp("administrative_area_level_3");
    const province = comp("administrative_area_level_2");
    const postal = comp("postal_code");
    const route = comp("route");
    const number = comp("street_number");
    const name = j.displayName?.text ?? "";

    // KULANG MINSAN ANG COMPONENTS. Ang "Balayan East Central School" ay walang
    // barangay sa listahan pero nasa formattedAddress ("… Navotas, Balayan …").
    // Hinahanap ito roon bilang huling paraan — mas mabuti ang mahihinuha kaysa
    // sa blangkong field na ipapapunan pa sa customer.
    const parts = (j.formattedAddress ?? "").split(",").map((x) => x.trim()).filter(Boolean);
    let brgy = barangay;
    if (!brgy && city) {
      const at = parts.findIndex((x) => x.toLowerCase() === city.toLowerCase());
      // Ang bahaging nasa unahan mismo ng bayan ang karaniwang barangay.
      if (at > 0) {
        const before = parts[at - 1];
        if (before && !/^\d/.test(before) && !/(st|street|road|rd|ave|avenue|highway|hwy|blvd)/i.test(before)) brgy = before;
      }
    }

    return NextResponse.json({
      name,
      // Ang street ay ang pangalan ng lugar + ang kalye — ito ang nakikita ng
      // driver, kaya isinasama ang dalawa kapag magkaiba.
      street: [number, route].filter(Boolean).join(" ") || (name && name !== city ? name : ""),
      barangay: brgy,
      city,
      province,
      postal,
      formatted: j.formattedAddress ?? "",
      lat: j.location?.latitude ?? null,
      lng: j.location?.longitude ?? null,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "lookup failed" }, { status: 502 });
  }
}
