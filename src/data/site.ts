/**
 * Identité de l'entreprise — source unique consommée par le schema
 * Organization, le footer et les balises meta. À mettre à jour ici uniquement.
 */
export const site = {
  name: "Flash Ads",
  legalName: "Flash Ads",
  url: "https://flashads.ch",
  domain: "flashads.ch",
  description:
    "Agence Google Ads pour PME francophones en Suisse romande. Prix fixes et transparents, sans pourcentage sur le budget publicitaire, sans engagement annuel.",
  tagline: "Gestion Google Ads pour PME — transparente et abordable.",
  email: "hello@flashads.ch",
  // PLACEHOLDER — remplacer par le numéro réel avant publication.
  phone: "+41 79 000 00 00",
  city: "Sion",
  region: "Valais",
  country: "CH",
  // Réseaux sociaux (à compléter ; utilisés dans le champ sameAs du schema).
  social: {
    linkedin: "",
  },
  // Année de fondation (E-E-A-T / schema).
  foundingYear: 2024,
  // Baseline reprise du site actuel.
  baseline: "Simple. Transparent. Efficace.",
  // Badge Google Partner officiel (ID agence fourni).
  googlePartner: {
    id: "9907170973",
    url: "https://www.google.com/partners/agency?id=9907170973",
    badgeImg: "https://www.gstatic.com/partners/badge/images/2026/PartnerBadgeClickable.svg",
  },
} as const;

/** Sous-pages services — réutilisées dans le menu (dropdown) et le footer. */
const services = [
  { label: "Gestion Google Ads", href: "/services/google-ads" },
  { label: "Publicité ChatGPT", href: "/services/chatgpt-ads" },
  { label: "Tracking & Analytics", href: "/services/tracking-analytics" },
] as const;

/** Navigation principale — partagée header + footer, prête pour i18n. */
export const nav = {
  services,
  main: [
    { label: "Services", href: "/services/google-ads", children: services },
    { label: "Tarifs", href: "/#tarifs" },
    { label: "Agence", href: "/agence" },
    { label: "Blog", href: "/blog" },
  ],
  legal: [
    { label: "Mentions légales", href: "/mentions-legales" },
    { label: "Politique de confidentialité", href: "/confidentialite" },
  ],
} as const;
