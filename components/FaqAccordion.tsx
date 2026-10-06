// FAQs sa homepage — 2-column accordion na may SEE ALL link.
import Link from "next/link";
import { homepage } from "@/lib/products";

export default function FaqAccordion() {
  const { title, items } = homepage.faqs;
  const half = Math.ceil(items.length / 2);
  const cols = [items.slice(0, half), items.slice(half)];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 md:py-14">
      <div className="flex items-end justify-between gap-4 mb-5 flex-wrap">
        <div>
          <i className="pf-rule mb-3" />
          <h2 className="font-cormorant font-semibold text-[clamp(24px,2.7vw,32px)] leading-[1.1] tracking-[-0.02em] mt-1.5">{title}</h2>
        </div>
        <Link
          href="/faqs"
          className="text-[13px] font-semibold border-b-[1.5px] border-goldDeep pb-0.5 whitespace-nowrap transition-colors hover:text-goldDeep"
        >
          SEE ALL
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 items-start">
        {cols.map((col, ci) => (
          <div key={ci} className="pf-card overflow-hidden divide-y divide-[#EBE2D2]">
            {col.map((f) => (
              <details key={f.q} className="group open:bg-[linear-gradient(180deg,#FBF4E4,#FAF5EC)]">
                <summary className="font-semibold text-[14.5px] cursor-pointer list-none [&::-webkit-details-marker]:hidden flex justify-between items-center gap-4 px-4 sm:px-5 py-[18px]">
                  {f.q}
                  <span aria-hidden className="grid place-items-center w-[30px] h-[30px] shrink-0 rounded-full bg-[#F3EADB] text-brownDeep shadow-[inset_0_0_0_1px_#E0D5C1] transition group-open:rotate-180 group-open:bg-brownDeep group-open:text-gold group-open:shadow-none">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                  </span>
                </summary>
                <p className="text-stone text-sm px-4 sm:px-5 pb-5 -mt-1 leading-relaxed max-w-[62ch]">{f.a}</p>
              </details>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
