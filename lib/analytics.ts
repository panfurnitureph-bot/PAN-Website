// WEBSITE ANALYTICS — browser side (Joe 2026-11-22).
//
// Walang cookie at walang personal na data: random na device id (localStorage),
// session id (30 min na walang galaw = bagong session), page, pinanggalingan
// (Facebook / Google / …, mula sa link o referrer) at device. Ipinapadala sa
// sariling /api/t ng site, na nagpapasa sa IMS (Website › Analytics).

type Kind = "view" | "contact";

const SESSION_IDLE_MS = 30 * 60_000;

const rid = () => {
  try { return crypto.randomUUID(); } catch { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
};

function store(): Storage | null {
  try { return window.localStorage; } catch { return null; }
}

function vid(): string {
  const s = store();
  let v = s?.getItem("pan-vid") || "";
  if (!v) { v = rid(); try { s?.setItem("pan-vid", v); } catch {} }
  return v;
}

type Session = { id: string; at: number; source: string; campaign: string };

// Saan galing ang bisita — tinitingnan lang sa SIMULA ng session.
function detectSource(): { source: string; campaign: string } {
  const q = new URLSearchParams(window.location.search);
  const utm = (q.get("utm_source") || "").toLowerCase();
  const campaign = (q.get("utm_campaign") || "").slice(0, 120);
  const ua = navigator.userAgent || "";
  const ref = (() => { try { return new URL(document.referrer).hostname.toLowerCase(); } catch { return ""; } })();
  const own = ref === window.location.hostname || ref.endsWith(".panfurniture.ph");
  let source = "direct";
  if (/messenger/.test(utm) || /messenger\.com$/.test(ref)) source = "messenger";
  else if (/^(fb|facebook|meta)/.test(utm) || q.has("fbclid") || /(^|\.)facebook\.com$|(^|\.)fb\.com$|^l\.facebook|^lm\.facebook/.test(ref) || /FBAN|FBAV|FB_IAB/.test(ua)) source = "facebook";
  else if (/^(ig|instagram)/.test(utm) || /instagram\.com$/.test(ref) || /Instagram/.test(ua)) source = "instagram";
  else if (/google/.test(utm) || q.has("gclid") || /(^|\.)google\./.test(ref)) source = "google";
  else if (/tiktok/.test(utm) || /tiktok\.com$/.test(ref) || /musical_ly|BytedanceWebview/i.test(ua)) source = "tiktok";
  else if (/youtube/.test(utm) || /youtube\.com$|youtu\.be$/.test(ref)) source = "youtube";
  else if (utm) source = "other";
  else if (ref && !own) source = "other";
  return { source, campaign };
}

function session(): Session {
  const s = store();
  const now = Date.now();
  let cur: Session | null = null;
  try { cur = JSON.parse(s?.getItem("pan-sid") || "null"); } catch {}
  if (!cur || now - cur.at > SESSION_IDLE_MS) {
    cur = { id: rid(), at: now, ...detectSource() };
  } else {
    cur.at = now;
  }
  try { s?.setItem("pan-sid", JSON.stringify(cur)); } catch {}
  return cur;
}

function device(): string {
  const ua = navigator.userAgent || "";
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return "tablet";
  if (/Mobi|iPhone|iPod|Android|IEMobile|Opera Mini/i.test(ua)) return "mobile";
  return "desktop";
}

function disabled(): boolean {
  if (typeof window === "undefined") return true;
  // Nasa loob ng iframe (ang laging-nakatagong /track?embed=1 ng TrackButton, o IMS preview) —
  // hindi hiwalay na bisita. Sinusuri rin ang ?embed=1 dahil mas nauuna ito sa data-embed ng EmbedMode.
  if (document.documentElement.dataset.embed === "1") return true;
  if (new URLSearchParams(window.location.search).get("embed") === "1") return true;
  try { if (window.self !== window.top) return true; } catch { return true; }
  return /^\/(admin|swipe-test)(\/|$)/.test(window.location.pathname);
}

function send(payload: unknown) {
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon && navigator.sendBeacon("/api/t", new Blob([body], { type: "application/json" }))) return;
  } catch {}
  fetch("/api/t", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
}

export function track(kind: Kind, label?: string) {
  if (disabled()) return;
  const sess = session();
  const path = window.location.pathname;
  const product = /^\/products\/([^/?#]+)/.exec(path)?.[1];
  send({
    events: [{
      kind, vid: vid(), sid: sess.id, path,
      product: product ? decodeURIComponent(product) : undefined,
      label, source: sess.source, campaign: sess.campaign || undefined, device: device(),
    }],
  });
}

// "Nasa site ngayon" — tibok habang nakikita ang page.
export function heartbeat() {
  if (disabled() || document.visibilityState !== "visible") return;
  const sess = session();
  send({ ping: { vid: vid(), sid: sess.id, path: window.location.pathname } });
}

export const trackView = () => track("view");
export const trackContact = (label: string) => track("contact", label);
