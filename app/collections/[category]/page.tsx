// COLLECTION PAGE — /collections/sofas, /collections/dining, atbp.
// Server component: kinukuha ang products, ipinapasa sa client na
// CollectionView (doon ang filters at sorting).

import { notFound } from "next/navigation";
import Link from "next/link";
import { COLLECTIONS, NAV_LINKS, getCollectionProducts, swatchLibrary, categoryTileImage } from "@/lib/products";
import { primeStoreContent } from "@/lib/content";
import CollectionView from "@/components/CollectionView";

// Walang cache: sariwang kuha sa Supabase kada page load, kaya ang binago sa
// PAN app admin ay lumalabas agad — hindi na kailangang maghintay.
export const revalidate = 0;

// Pinapayagan ang collection na wala pa noong huling build — hindi 404 agad.
export const dynamicParams = true;

// Subcategory links ng collection — mula sa nav group na kinabibilangan
// (hal. nasa /collections/bed ka → ipakita ang Beds group: All Beds,
// Bed, Sofa Bed, Mattress; naka-highlight ang kasalukuyan)
function getSubnav(slug: string) {
  const href = `/collections/${slug}`;
  // Ang child na sumasaklaw sa slug (hal. /collections/mugs → "Decoration",
  // dahil kasama ang mugs sa COLLECTIONS.decoration.categories).
  const covers = (c: { href: string }) => c.href === href || (c.href !== group?.href && (COLLECTIONS[c.href.replace("/collections/", "")]?.categories ?? []).includes(slug));
  const group =
    NAV_LINKS.find((l) => l.href === href && l.children) ??
    NAV_LINKS.find((l) => l.children?.some((c) => c.href === href)) ??
    NAV_LINKS.find((l) => l.children?.some((c) => c.href !== l.href && (COLLECTIONS[c.href.replace("/collections/", "")]?.categories ?? []).includes(slug)));
  if (!group?.children) return [];
  // Bilang at litrato ng bawat subcategory para sa Category card (premium,
  // 2026-10-07); ang "All …" ng grupo ay walang litrato (grid icon).
  return group.children.map((c) => {
    const s = c.href.replace("/collections/", "");
    const count = getCollectionProducts(s).length;
    return { label: c.label, href: c.href, active: covers(c), count, image: c.href !== group.href && count > 0 ? categoryTileImage(s) : undefined };
  });
}

export async function generateStaticParams() {
  // Punan muna para galing sa Supabase ang listahan, hindi sa lumang JSON.
  await primeStoreContent();
  return Object.keys(COLLECTIONS).map((category) => ({ category }));
}

export async function generateMetadata(props: { params: Promise<{ category: string }> }) {
  const params = await props.params;
  const collection = COLLECTIONS[params.category];
  if (!collection) return { title: "PAN Furniture" };
  // Branded OG card (2026-09-03) - hindi na hinuhugot ng chat apps ang unang
  // product photo (na pinuputol nila); laging maayos ang share preview.
  const og = `/api/og?title=${encodeURIComponent(collection.title)}&v=2`;
  return {
    title: `${collection.title} — PAN Furniture`,
    openGraph: { title: `${collection.title} — PAN Furniture`, images: [og] },
    twitter: { card: "summary_large_image", images: [og] },
  };
}

export default async function CollectionPage(
  props: {
    params: Promise<{ category: string }>;
  }
) {
  const params = await props.params;
  // Punan muna bago basahin ang `COLLECTIONS` / products sa ibaba.
  await primeStoreContent();

  const collection = COLLECTIONS[params.category];
  if (!collection) notFound();

  const items = getCollectionProducts(params.category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 md:py-8">
      {/* Breadcrumbs */}
      <nav className="text-[12.5px] text-stone mb-3" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-goldDeep">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{collection.title}</span>
      </nav>

      <CollectionView
        products={items}
        swatches={swatchLibrary}
        subnav={getSubnav(params.category)}
        title={collection.title}
      />
    </div>
  );
}
