"use client";

import { useState } from "react";
import { contactLinks, type SiteContent } from "@/lib/products";

// CONTACT RAIL (Joe 2026-09-12, "gawin na icon, ilagay sa left side, may
// bubble text"): WhatsApp / Viber / Email bilang bilog na icon sa kaliwang-
// ibabang sulok ng bawat pahina — kapareha ng chat bubble sa kanan. Sa hover
// (o focus) ay lumalabas ang bubble na may numero / email; sa tap ay diretso
// sa app (wa.me, viber://, mailto:). Ang mga halaga ay mula sa site.contact
// (IMS › Website Content › Site › Contact); ang blangko ay hindi lumalabas.
export default function ContactRail({ site }: { site: SiteContent }) {
  const cl = contactLinks(site);
  const [open, setOpen] = useState<string | null>(null);
  const items = [
    cl.whatsapp && {
      key: "whatsapp", label: "WhatsApp", text: cl.whatsapp, href: cl.whatsappHref, external: true, bg: "#25D366",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 1.8a8.2 8.2 0 1 1-4.2 15.3l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 0 1 12 3.8zm-3.3 4.4c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.2 5 4.4 2.5 1 3 .8 3.5.7.5-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3l-2-1c-.3-.1-.5-.1-.7.1l-.9 1.1c-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.4.1-.6l.5-.5.3-.5c.1-.2 0-.4 0-.5l-.9-2.1c-.2-.6-.5-.5-.7-.5h-.5z" />
        </svg>
      ),
    },
    cl.viber && {
      key: "viber", label: "Viber", text: cl.viber, href: cl.viberHref, external: false, bg: "#7360F2",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
          <path d="M12 1.5c-1.6 0-5 .2-7 2-1.5 1.4-2 3.6-2 6.6 0 3 .5 5.2 2 6.6.7.6 1.6 1 2.5 1.3v3.4l.4.1c.2 0 .4-.1.5-.2l2.4-2.6c.4 0 .8.1 1.2.1 1.6 0 5-.2 7-2 1.5-1.4 2-3.6 2-6.6 0-3-.5-5.2-2-6.6-2-1.8-5.4-2.1-7-2.1zm0 1.7c1.5 0 4.4.2 5.9 1.6 1.1 1 1.4 2.9 1.4 5.3s-.3 4.3-1.4 5.3c-1.5 1.4-4.4 1.6-5.9 1.6-.5 0-1 0-1.5-.1l-.4-.1-1.9 2.1v-2.6l-.6-.2c-.8-.2-1.5-.6-2-1.1-1.1-1-1.4-2.9-1.4-5.3s.3-4.3 1.4-5.3c1.5-1.4 4.4-1.6 5.9-1.6zm-.1 1.9v1.3c1.4 0 2.7.5 3.6 1.4 1 1 1.4 2.3 1.4 3.7h1.3c0-1.8-.6-3.4-1.8-4.6-1.2-1.2-2.8-1.8-4.5-1.8zm.1 2.3v1.3c.8 0 1.5.3 2 .8.5.5.8 1.2.8 2h1.3c0-1.1-.4-2.2-1.2-2.9-.8-.8-1.8-1.2-2.9-1.2zm0 2.2v1.2c.4 0 .7.3.7.7h1.2c0-1-.9-1.9-1.9-1.9zM8.7 7.4c-.3 0-.6.1-.8.3-.6.5-1 1.2-.9 1.9.1.9.6 2.2 2 3.9 1.5 1.7 2.7 2.4 3.6 2.7.7.2 1.5-.1 2-.7.3-.3.4-.7.2-1l-1.2-1.3c-.2-.2-.5-.3-.8-.1l-.8.5c-.2.1-.4.1-.6 0-.5-.3-1.5-1.1-2.1-2-.1-.2-.1-.4 0-.5l.6-.7c.2-.2.2-.5.1-.8L9.4 7.7c-.2-.2-.4-.3-.7-.3z" />
        </svg>
      ),
    },
    {
      key: "email", label: "Email", text: cl.email2 || site.contact.email, href: `mailto:${cl.email2 || site.contact.email}`, external: false, bg: "#8a6a1f",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
          <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-.6 2L12 11.2 4.6 6h14.8zM4 18V7.7l8 5.6 8-5.6V18H4z" />
        </svg>
      ),
    },
  ].filter((x): x is Exclude<typeof x, false | "" | null | undefined> => !!x);

  return (
    // NASA GITNA NG KALIWANG GILID (Joe 2026-09-12, "i-center, nasa baba e").
    <div data-floating className="fixed left-4 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-2.5 sm:left-5">
      {items.map((it) => (
        <div key={it.key} className="relative flex items-center"
          onMouseEnter={() => setOpen(it.key)} onMouseLeave={() => setOpen((o) => (o === it.key ? null : o))}>
          <a
            href={it.href}
            target={it.external ? "_blank" : undefined}
            rel={it.external ? "noopener noreferrer" : undefined}
            aria-label={`${it.label} · ${it.text}`}
            onFocus={() => setOpen(it.key)} onBlur={() => setOpen(null)}
            className="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold"
            style={{ background: it.bg }}
          >
            {it.icon}
          </a>
          {/* Bubble text — kanan ng icon, may maliit na tuldok na nakaturo. */}
          <span
            role="tooltip"
            className={`pointer-events-none absolute left-[52px] whitespace-nowrap rounded-lg bg-ink px-3 py-1.5 text-[12px] font-semibold text-cream shadow-lg transition-opacity ${open === it.key ? "opacity-100" : "opacity-0"}`}
          >
            <span className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-ink" />
            {it.label} · {it.text}
          </span>
        </div>
      ))}
    </div>
  );
}
