import { describe, it, expect } from "vitest";
import { matchCity, feeFor } from "./city-match";
import site from "../content/site.json";

// Ang shipping fee ay galing sa napiling City sa listahan ng admin, pero ang
// sinasabi ng Google ay hindi laging pareho ng pagkakasulat doon. Kapag hindi
// tumugma, walang bayad na lalabas sa customer — sa lugar na hinahatiran naman.

const provinces = (site as unknown as { shipping: { provinces: { name: string; cities: { name: string; fee: number }[] }[] } }).shipping.provinces;
const of_ = (p: string) => provinces.find((x) => x.name === p)!.cities;

describe("matchCity", () => {
  it("matches the plain cases", () => {
    expect(matchCity("Carmona", of_("Cavite"))).toBe("Carmona");
    expect(matchCity("Lipa", of_("Batangas"))).toBe("Lipa");
    expect(matchCity("Pakil", of_("Laguna"))).toBe("Pakil");
  });

  it("matches across the spellings Google actually returns", () => {
    // "Sta Cruz / Pila" — pinagsamang dalawang bayan sa isang entry
    expect(matchCity("Santa Cruz", of_("Laguna"))).toBe("Sta Cruz / Pila");
    expect(matchCity("Pila", of_("Laguna"))).toBe("Sta Cruz / Pila");
    // panaklong na paglilinaw
    expect(matchCity("Rizal", of_("Laguna"))).toBe("Rizal (Laguna)");
    // paikli sa listahan, buo sa Google
    expect(matchCity("Santo Tomas", of_("Batangas"))).toBe("Sto Tomas");
    expect(matchCity("Cuenca", of_("Batangas"))).toBe("Alitagtag / Cuenca");
    // enye
    // Ang file ay maaaring NFC o NFD ang enye; ihambing pagkatapos i-normalize.
    expect(matchCity("Binan", of_("Laguna"))?.normalize("NFC")).toBe("Biñan");
    expect(matchCity("Los Banos", of_("Laguna"))?.normalize("NFC")).toBe("Los Baños");
    // "City" sa dulo
    expect(matchCity("Batangas City", of_("Batangas"))).toBe("Batangas City");
  });

  it("does not match a different town that merely shares letters", () => {
    // "Bay" ay hindi dapat tumugma sa "Balayan" — buong salita lang ang tugma.
    expect(matchCity("Bay", of_("Batangas"))).toBeNull();
    expect(matchCity("Cebu City", of_("Cavite"))).toBeNull();
    expect(matchCity("", of_("Laguna"))).toBeNull();
  });

  it("returns the fee, or null rather than a wrong number", () => {
    // Ang aktwal na halaga sa listahan — hindi hula.
    const carmona = of_("Cavite").find((c) => c.name === "Carmona")!;
    expect(feeFor("Carmona", of_("Cavite"))?.fee).toBe(carmona.fee);
    expect(feeFor("Santa Cruz", of_("Laguna"))?.name).toBe("Sta Cruz / Pila");
    expect(feeFor("Davao City", of_("Laguna"))).toBeNull();
  });
});

// ANG BUG NA INAYOS (2026-08-23): sa checkout, ang paghahanap ng "Bano Street,
// Pakil, Laguna" ay nagtatakda lang ng Street — naiwan ang Province/City sa
// Batangas / Mataas na Kahoy, at sinisingil ang customer ng ₱5,000 para sa
// maling bayan. Ang matcher ang bahagi nito: dapat nitong makita ang Pakil sa
// Laguna, at HINDI ito dapat tumugma sa anumang bayan sa Batangas.
describe("the Pakil case", () => {
  it("finds Pakil in Laguna", () => {
    expect(matchCity("Pakil", of_("Laguna"))).toBe("Pakil");
    expect(feeFor("Pakil", of_("Laguna"))).not.toBeNull();
  });

  it("never matches Pakil to a Batangas town", () => {
    expect(matchCity("Pakil", of_("Batangas"))).toBeNull();
  });

  it("keeps Paete and Pakil apart — neighbours with similar names", () => {
    expect(matchCity("Paete", of_("Laguna"))).toBe("Paete");
    expect(matchCity("Pakil", of_("Laguna"))).toBe("Pakil");
  });
});
