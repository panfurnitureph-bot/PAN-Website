// PAGE LOADER (Joe 2026-10-07, ang "Loading" ng mockup): ang PAN seal na
// dahan-dahang humihinga, at isang gintong singsing na umiikot sa paligid nito
// (isang ikot kada ~1 segundo). Ginagamit ng app/loading.tsx (habang nagbubukas
// ang pahina) at ng mga naghihintay na bahagi. Sumusunod sa reduced motion.

export default function PanLoader({ label = "Loading…", size = 96, className = "" }: { label?: string; size?: number; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={`flex flex-col items-center gap-4 ${className}`}>
      <span className="relative block" style={{ width: size, height: size }}>
        <span aria-hidden className="pf-ring absolute inset-0 rounded-full" />
        <span aria-hidden className="pf-breathe absolute inset-[9px] grid place-items-center overflow-hidden rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(176,138,62,.3)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/pan-seal.png" alt="" className="h-[82%] w-[82%] object-contain" />
        </span>
      </span>
      <span className="text-[12.5px] text-stone">{label}</span>
    </div>
  );
}

// Maliit na singsing sa loob ng button ("Sending…", "Adding…") — hindi nagbabago
// ang laki ng button, kaya walang tumatalon.
export function BtnRing({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`pf-ring-sm inline-block h-4 w-4 shrink-0 rounded-full ${className}`} />;
}
