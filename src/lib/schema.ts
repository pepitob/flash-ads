/**
 * Helpers JSON-LD réutilisables (schema.org) pour le SEO + GEO.
 * Chaque helper renvoie un objet sérialisable en <script type="application/ld+json">.
 * Brief §9 : Organization (global), Service, FAQPage, Article, BreadcrumbList.
 */
import { site } from "../data/site";

const abs = (path: string) =>
  path.startsWith("http") ? path : `${site.url}${path.startsWith("/") ? "" : "/"}${path}`;

/** Organization — injecté globalement dans le layout. */
export function organizationSchema() {
  const sameAs = Object.values(site.social).filter(Boolean);
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

/** Service — pages services. */
export function serviceSchema(opts: {
  name: string;
  description: string;
  url: string;
  serviceType?: string;
}) {
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

/** Article — articles de blog. */
export function articleSchema(opts: {
  title: string;
  description: string;
  url: string;
  datePublished: Date;
  dateModified?: Date;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    url: abs(opts.url),
    datePublished: opts.datePublished.toISOString(),
    dateModified: (opts.dateModified ?? opts.datePublished).toISOString(),
    ...(opts.image ? { image: abs(opts.image) } : {}),
    author: { "@type": "Organization", name: site.name, url: site.url },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    mainEntityOfPage: abs(opts.url),
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
