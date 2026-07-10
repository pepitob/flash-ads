/**
 * Helpers JSON-LD réutilisables (schema.org) pour le SEO + GEO.
 * Chaque helper renvoie un objet sérialisable en <script type="application/ld+json">.
 * Brief §9 : Organization (global), Service, FAQPage, Article, BreadcrumbList.
 */
import { site } from "../data/site";
import { pricingValidated, tiers } from "../data/tarifs";

const abs = (path: string) =>
  path.startsWith("http") ? path : `${site.url}${path.startsWith("/") ? "" : "/"}${path}`;

/** "CHF 2 200" → 2200 (nombre) pour les PriceSpecification. */
const parsePrice = (price: string) => Number(price.replace(/[^\d]/g, "")) || undefined;

/** Organization — injecté globalement dans le layout. */
export function organizationSchema() {
  // Liens d'identité externes vérifiables (E-E-A-T / GEO) : réseaux sociaux (à compléter)
  // + page Google Partner officielle, qui est un vrai signal d'entité.
  const sameAs = [...Object.values(site.social), site.googlePartner.url].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    description: site.description,
    email: site.email,
    telephone: site.phone,
    foundingDate: String(site.foundingYear),
    areaServed: ["CH", "FR", "BE"],
    address: {
      "@type": "PostalAddress",
      streetAddress: site.street,
      postalCode: site.postalCode,
      addressLocality: site.city,
      addressRegion: site.region,
      addressCountry: site.country,
    },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/**
 * Offres tarifaires (Google Ads) construites depuis `tarifs.ts`.
 * Renvoie `undefined` tant que `pricingValidated === false` : on ne publie JAMAIS
 * de prix provisoires en données structurées.
 */
function pricingOffers() {
  if (!pricingValidated) return undefined;
  return {
    "@type": "OfferCatalog",
    name: "Formules de gestion Google Ads",
    itemListElement: tiers.map((t) => ({
      "@type": "Offer",
      name: t.name,
      description: t.forBudget,
      priceCurrency: "CHF",
      price: parsePrice(t.price),
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        priceCurrency: "CHF",
        price: parsePrice(t.price),
        unitCode: "MON", // facturation mensuelle
      },
    })),
  };
}

/** Service — pages services. `withPricing` = attacher les offres (gaté sur pricingValidated). */
export function serviceSchema(opts: {
  name: string;
  description: string;
  url: string;
  serviceType?: string;
  withPricing?: boolean;
}) {
  const offers = opts.withPricing ? pricingOffers() : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    serviceType: opts.serviceType ?? opts.name,
    description: opts.description,
    url: abs(opts.url),
    provider: { "@type": "Organization", name: site.name, url: site.url },
    areaServed: ["Suisse romande", "Suisse", "France", "Belgique"],
    audience: { "@type": "Audience", audienceType: "PME" },
    ...(offers ? { offers } : {}),
  };
}

export type FaqItem = { question: string; answer: string };

/** FAQPage — toutes les FAQ (clé pour le GEO). */
export function faqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}

/** Article — articles de blog. `author` (nom réel) ⇒ auteur Person (fort signal E-E-A-T). */
export function articleSchema(opts: {
  title: string;
  description: string;
  url: string;
  datePublished: Date;
  dateModified?: Date;
  image?: string;
  author?: string;
}) {
  // Un auteur Person nommé est bien plus fort qu'une Organization pour la citation IA.
  // Tant qu'aucun nom réel n'est fourni, on retombe sur l'Organization.
  const author = opts.author
    ? { "@type": "Person", name: opts.author, url: abs("/agence") }
    : { "@type": "Organization", name: site.name, url: site.url };
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    url: abs(opts.url),
    datePublished: opts.datePublished.toISOString(),
    dateModified: (opts.dateModified ?? opts.datePublished).toISOString(),
    ...(opts.image ? { image: abs(opts.image) } : {}),
    author,
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    mainEntityOfPage: abs(opts.url),
  };
}

/** Blog — index des articles (ItemList sémantique pour l'IA / rich results). */
export function blogListSchema(
  posts: { title: string; url: string; datePublished: Date; description?: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": abs("/blog"),
    name: `Blog ${site.name}`,
    url: abs("/blog"),
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: abs(p.url),
      datePublished: p.datePublished.toISOString(),
      ...(p.description ? { description: p.description } : {}),
    })),
  };
}

export type Crumb = { name: string; url: string };

/** BreadcrumbList — navigation. */
export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: abs(c.url),
    })),
  };
}
