"use client";

// QUOTE REQUEST PANEL — ang listahan ng mga build na hinihingan ng presyo.
//
// NASA LOOB NG PRODUCT PAGE, sa pagitan ng mga opsyon at ng mga buton — doon
// din nakaupo ang fixed as-is rows at ang shipping card, kaya hindi ito bagong
// hanay o bagong pahina. Lumalabas lang kapag may laman: sa nag-iisang produkto
// (ang karaniwan), walang nadadagdag sa pahina.

import Image from "next/image";
import { useStore, type QuoteBuild } from "./store";
import { formatPrice } from "@/lib/products";

export default function QuoteRequestPanel({
  onEdit,
  compact = false,
}: {
  // Ang pag-edit ay ibinabalik ang build sa configurator ng sarili nitong
  // produkto — hindi lang pagbura. Sa mahabang listahan, ang pagpapalit ng tela
  // ng unang item ay hindi dapat mangahulugang buuin itong muli.
  onEdit?: (b: QuoteBuild) => void;
  compact?: boolean;
}) {
  const { quote, removeFromQuote, quoteTotal } = useStore();
  if (!quote.length) return null;

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-sand">
      <div className="flex items-center gap-2 border-b border-sand bg-linen px-3 py-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest2 text-cognac">Your quote request</span>
        <span className="ml-auto rounded-full border border-sand bg-cream px-2 py-px text-[10px] font-bold tabular-nums text-stone">
          {quote.length} {quote.length === 1 ? "product" : "products"}
        </span>
      </div>

      {/* MAHABANG LISTAHAN: ang kahon ang nag-i-scroll, hindi ang pahina — kung
          hindi, natutulak paibaba ang mga buton hanggang mawala sa tanawin. */}
      <div className={compact ? "max-h-64 overflow-y-auto" : "max-h-80 overflow-y-auto"}>
        {quote.map((b, i) => (
          <div key={b.id} className="flex items-center gap-2.5 border-b border-sand px-3 py-2 last:border-0">
            <span className="w-3 shrink-0 text-[10px] tabular-nums text-stone">{i + 1}</span>
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded border border-sand bg-linen">
              {b.image ? (
                <Image src={b.image} alt="" fill sizes="36px" className="object-cover" />
              ) : null}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-bold leading-tight">{b.name}</span>
              {b.summary ? <span className="block truncate text-[10.5px] text-stone">{b.summary}</span> : null}
            </span>
            {b.build?.priced && b.build?.total ? (
              <span className="shrink-0 text-[11px] font-bold tabular-nums">{formatPrice(b.build.total)}</span>
            ) : (
              <span className="shrink-0 text-[10px] text-stone">for quotation</span>
            )}
            <span className="flex shrink-0 items-center gap-1.5">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(b)}
                  className="text-[10.5px] font-semibold text-cognac hover:underline"
                >
                  Edit
                </button>
              )}
              <button
                type="button"
                onClick={() => removeFromQuote(b.id)}
                aria-label={`Remove ${b.name} from your request`}
                className="text-[11px] text-stone hover:text-ink"
              >
                ✕
              </button>
            </span>
          </div>
        ))}
      </div>

      {/* Ang kabuuan ay ESTIMATE lang — ang huling presyo ay nasa quotation na
          ipinapadala ng team, at ang delivery ay isang beses para sa buong
          request. Malinaw dapat iyon bago pa mag-send. */}
      <div className="flex items-baseline gap-2 border-t border-sand bg-cream px-3 py-2">
        <span className="text-[10.5px] font-bold text-stone">Estimate, before delivery</span>
        <span className="ml-auto text-[13px] font-extrabold tabular-nums">
          {quoteTotal > 0 ? formatPrice(quoteTotal) : "For quotation"}
        </span>
      </div>
    </div>
  );
}
