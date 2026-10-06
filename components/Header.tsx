"use client";

// Header — tulad ng tunay na site: sa homepage TRANSPARENT ito at
// nakapatong sa hero slideshow (puting text, sumasabay sa kulay ng
// slide), tapos nagiging solid cream kapag nag-scroll. Sa ibang pages,
// laging solid. May hamburger menu sa mobile.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV_LINKS, type NavLink, type SiteContent } from "@/lib/products";
import { useStore } from "@/components/store";

// Ang `site` (promo banner, pangalan ng brand) ay galing sa layout — server
// ang kumukuha nito sa Supabase, hindi na ang browser.
// `nav` ay ipinapasa ng layout (server) — doon na-sync ang categories mula sa
// IMS; sa browser ay static lang ang NAV_LINKS kaya prop ang ginagamit.
export default function Header({ site, nav = NAV_LINKS }: { site: SiteContent; nav?: NavLink[] }) {
  const { cartCount, quoteCount } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [height, setHeight] = useState(0);
  // Mega-menu: aling nav item ang naka-hover (desktop)
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  // Mobile: aling nav item ang naka-expand
  const [expanded, setExpanded] = useState<string | null>(null);
  const ref = useRef<HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const isHome = pathname === "/";
  // Transparent lang kapag: homepage + hindi pa naka-scroll + sarado ang menus
  const transparent = isHome && !scrolled && !menuOpen && !searchOpen && !openMenu;
  const txt = transparent ? "text-cream" : "text-ink";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sukatin ang header para sa spacer ng ibang pages
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(() => setHeight(ref.current?.offsetHeight ?? 0));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchOpen(false);
    setMenuOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <>
      <header
        ref={ref}
        data-site-header=""
        onMouseLeave={() => setOpenMenu(null)}
        className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
          transparent ? "bg-transparent" : "bg-cream shadow-sm"
        }`}
      >
        {/* Promo banner — laging itim; editable sa content/site.json */}
        <div className="bg-ink text-cream text-center py-1.5 px-4">
          <p className="text-xs sm:text-sm">{site.promoBanner}</p>
          <p className="text-[9px] italic text-cream/80">{site.promoBannerSmall}</p>
        </div>

        {/* Main bar: left links · logo · right icons */}
        <div className={`hdr-txt grid grid-cols-[auto_1fr_auto] lg:grid-cols-3 items-center px-4 sm:px-8 py-3 gap-2 ${txt}`}>
          {/* Left: spacer (desktop, para nakasentro ang logo) / hamburger (mobile) */}
          <div className="hidden lg:block" />
          <button
            className="lg:hidden p-2 justify-self-start"
            aria-label="Menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="block w-6 h-0.5 bg-current mb-1.5" />
            <span className="block w-6 h-0.5 bg-current mb-1.5" />
            <span className="block w-6 h-0.5 bg-current" />
          </button>

          {/* Center: serif logo */}
          <Link
            href="/"
            className="justify-self-center font-cormorant text-xl sm:text-[26px] font-normal tracking-[0.1em] sm:tracking-[0.16em] whitespace-nowrap"
          >
            {site.brand.name.toUpperCase()}
          </Link>

          {/* Right: search, support, account, heart, cart */}
          <div className="flex items-center justify-self-end gap-3 sm:gap-5">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center gap-1.5 hover:text-cognac"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.5-4.5" />
              </svg>
              <span className="hidden lg:inline text-sm">Search</span>
            </button>
            {/* HEADER ICONS (2026-09-04): Search · Quotation · Cart lang. Tanggal ang
                Support, Account at wishlist na icon — ang heart sa cards ay gumagana
                pa rin at nasa /wishlist ang listahan. Ang Quotation ay laging kita
                (dating lumalabas lang kapag may laman). */}
            <Link href="/quote-request" aria-label={`Quotation (${quoteCount})`} className="relative flex items-center gap-1.5 hover:text-cognac">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M8 4h8a2 2 0 012 2v14l-6-3-6 3V6a2 2 0 012-2z" />
                <path d="M9 9h6M9 12.5h4" />
              </svg>
              <span className="hidden lg:inline text-sm">Quotation</span>
              {quoteCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-cognac text-cream text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {quoteCount}
                </span>
              )}
            </Link>
            <Link href="/cart" aria-label="Cart" className="relative flex items-center gap-1.5 hover:text-cognac">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M6 7h12l1 14H5L6 7z" />
                <path d="M9 7a3 3 0 016 0" />
              </svg>
              <span className="hidden lg:inline text-sm">Cart</span>
              {cartCount > 0 && (
                <span key={cartCount} className="pf-bump absolute -top-2 -right-2 grid min-w-[18px] h-[18px] px-1 place-items-center rounded-full bg-gold text-brownDeep text-[11px] font-bold tabular-nums">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <form onSubmit={submitSearch} className="px-4 sm:px-8 pb-4 bg-cream">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sofas, dining, lighting…"
              className="w-full border border-stone/40 bg-white px-4 py-3 text-sm text-ink focus:outline-none focus:border-cognac"
            />
          </form>
        )}

        {/* Desktop nav — may mega-menu sa hover */}
        <nav className={`hdr-txt hidden lg:flex justify-center gap-8 pb-3 text-[15px] ${txt}`}>
          {nav.map((link) => (
            <div key={link.href} onMouseEnter={() => setOpenMenu(link.children ? link.label : null)}>
              <Link
                href={link.href}
                onClick={() => setOpenMenu(null)}
                className={`hover:text-cognac border-b pb-0.5 transition-colors ${
                  openMenu === link.label ? "border-current" : "border-transparent hover:border-cognac"
                }`}
              >
                {link.label}
              </Link>
            </div>
          ))}
        </nav>

        {/* MEGA-MENU PANEL — subcategories kaliwa + featured image kanan */}
        {openMenu && (() => {
          const link = nav.find((l) => l.label === openMenu);
          if (!link?.children) return null;
          const featured = link.children.find((c) => c.href !== link.href);
          const featuredSlug = featured?.href.split("/").pop() ?? "bed";
          // ANG LARAWAN AY MULA SA IMS (2026-08-26) — Website > Promo & Site >
          // Menu Images. Dati ay naka-fix sa file ng UNANG subcategory, kaya ang
          // "Living" ay nagpapakita ng litrato ng Side Table at ang pagpapalit
          // ay nangangailangan ng deploy. Panakip pa rin ang lumang file kapag
          // walang naka-upload.
          const menuImg = site.menuImages?.[openMenu.toLowerCase()] || `/images/category-${featuredSlug}.jpg`;
          return (
            // PREMIUM MEGA MENU (Joe 2026-10-07, mockup): kaliwa ang listahan na may
            // icon na litrato at bilang (ang "Custom Bed" ay "Build yours" na pill), at
            // "Shop all …" na button; kanan ang mga tile ng subcategory na may litrato.
            // Parehong mga link at pagkakasunod ng dati.
            <div className="pf-estin hidden lg:block absolute inset-x-0 top-full rounded-b-[22px] bg-[#FBF7EF] shadow-[0_0_0_1px_#E4DACA,0_40px_70px_-30px_rgba(62,50,32,.55)]">
              <div className="max-w-7xl mx-auto grid grid-cols-[250px_1fr] gap-10 px-8 py-7">
                {/* Links column */}
                <div>
                  <p className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-goldDeep">Shop</p>
                  <p className="font-cormorant text-[26px] font-semibold tracking-[-0.015em] text-ink mt-1 mb-4">{link.label}</p>
                  <ul className="grid gap-1">
                    {link.children.map((c) => {
                      const custom = /custom/i.test(c.label);
                      return (
                      <li key={c.href}>
                        <Link
                          href={c.href}
                          onClick={() => setOpenMenu(null)}
                          className="group flex items-center gap-3 rounded-[14px] px-2 py-1.5 text-[14.5px] text-ink transition-colors hover:bg-white hover:shadow-[0_0_0_1px_rgba(176,138,62,.35)]"
                        >
                          <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-[10px] pf-stage text-goldDeep shadow-[inset_0_0_0_1px_rgba(176,138,62,.25)]">
                            {c.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={c.image} alt="" className="h-full w-full object-contain p-1 mix-blend-multiply" />
                            ) : custom ? (
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 20h4l10-10-4-4L4 16z" /><path d="m12 8 4 4" /></svg>
                            ) : (
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" /><rect x="4" y="13" width="7" height="7" rx="2" /><rect x="13" y="13" width="7" height="7" rx="2" /></svg>
                            )}
                          </span>
                          <span className="min-w-0 flex-1 truncate">{c.label}</span>
                          {custom ? (
                            <span className="rounded-full bg-brownDeep px-2.5 py-1 text-[10.5px] font-bold text-gold">Build yours</span>
                          ) : typeof c.count === "number" ? (
                            <span className="grid h-6 min-w-[24px] place-items-center rounded-full bg-goldSoft px-1.5 text-[11px] font-bold tabular-nums text-brown">{c.count}</span>
                          ) : null}
                        </Link>
                      </li>
                      );
                    })}
                  </ul>
                  <Link href={link.href} onClick={() => setOpenMenu(null)} className="pf-dark pf-btn mt-4 inline-flex h-10 items-center gap-2 rounded-full px-5 text-[13px] font-bold hover:text-gold">
                    Shop all {link.label.toLowerCase()} <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </Link>
                </div>
                {/* Tiles ng subcategory (may litrato) — ang "All …" at "Custom Bed" ay nasa listahan lang */}
                <div className="grid grid-cols-3 content-start gap-4">
                  {link.children.filter((c) => c.href !== link.href && !/custom/i.test(c.label)).map((c) => (
                    <Link key={c.href} href={c.href} onClick={() => setOpenMenu(null)} className="group pf-card pf-lift flex flex-col overflow-hidden">
                      <span className="relative block aspect-[4/3] pf-stage">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.image || menuImg} alt={c.label} className="absolute inset-0 h-full w-full object-contain p-5 mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
                      </span>
                      <span className="flex items-center justify-between gap-2 px-3.5 py-2.5 text-[13.5px] font-semibold text-ink">
                        {c.label}
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-goldDeep transition-transform group-hover:translate-x-1" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Mobile menu — may expandable subcategories */}
        {menuOpen && (
          <nav className="lg:hidden flex flex-col border-t border-sand bg-cream px-6 py-4 gap-1 text-ink max-h-[70vh] overflow-y-auto">
            {nav.map((link) => (
              <div key={link.href}>
                <div className="flex items-center justify-between">
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="py-2 hover:text-cognac"
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <button
                      onClick={() => setExpanded(expanded === link.label ? null : link.label)}
                      aria-label={`Expand ${link.label}`}
                      className={`px-3 py-2 text-stone transition-transform ${
                        expanded === link.label ? "rotate-180" : ""
                      }`}
                    >
                      ⌄
                    </button>
                  )}
                </div>
                {link.children && expanded === link.label && (
                  <div className="pl-4 pb-2 flex flex-col gap-1">
                    {link.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        onClick={() => setMenuOpen(false)}
                        className="py-1.5 text-sm text-stone hover:text-cognac"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="border-t border-sand pt-3 mt-2 flex flex-col gap-2 text-sm text-stone">
              <Link href="/contact" onClick={() => setMenuOpen(false)}>Support</Link>
            </div>
          </nav>
        )}
      </header>

      {/* Spacer — sa homepage 0 (hero sumisilip sa ilalim ng header),
          sa ibang pages tinutulak pababa ang content */}
      <div style={{ height: isHome ? 0 : height }} aria-hidden />
    </>
  );
}
