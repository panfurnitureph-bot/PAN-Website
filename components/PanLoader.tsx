// PAGE LOADER (Joe 2026-10-07, ang "Loading" ng mockup): ang PAN seal na
// dahan-dahang humihinga, at isang gintong singsing na umiikot sa paligid nito
// (isang ikot kada ~2 segundo; mas malaki at mas mabagal, Joe 2026-10-07). Ginagamit ng app/loading.tsx (habang nagbubukas
// ang pahina) at ng mga naghihintay na bahagi. Sumusunod sa reduced motion.

export default function PanLoader({ label = "Loading…", size = 150, className = "" }: { label?: string; size?: number; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={`flex flex-col items-center gap-5 ${className}`}>
      <span className="relative block" style={{ width: size, height: size }}>
        <span aria-hidden className="pf-ring absolute inset-0 rounded-full" />
        {/* Ang seal ay parisukat na litrato na kayumanggi ang background, kaya
            kayumanggi rin ang bilog at punong-puno ito (parang barya), hindi
            parisukat sa loob ng puting bilog. */}
        <span aria-hidden className="pf-breathe absolute inset-[11px] grid place-items-center overflow-hidden rounded-full bg-brown shadow-[0_0_0_1.5px_#E2C27A,0_18px_30px_-18px_rgba(62,50,32,.7)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/pan-seal.png" alt="" className="h-full w-full object-cover" />
        </span>
      </span>
      <span className="text-[13px] tracking-[0.02em] text-stone">{label}</span>
    </div>
  );
}

// Maliit na singsing sa loob ng button ("Sending…", "Adding…") — hindi nagbabago
// ang laki ng button, kaya walang tumatalon.
export function BtnRing({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`pf-ring-sm inline-block h-4 w-4 shrink-0 rounded-full ${className}`} />;
}
