/**
 * TARIFS - source UNIQUE des packs (Home + /services/google-ads + pricing.txt + JSON-LD).
 *
 * Prix validés (brief pricing 2026-08) : frais de gestion fixes uniquement.
 * Le budget publicitaire n'est JAMAIS encaissé par Flash Ads : le client le
 * paie directement à Google, avec sa propre carte, sur son propre compte.
 * 0% de commission sur le budget. Le pack est déterminé par un seul critère :
 * le budget publicitaire mensuel.
 *
 * Plancher dur : aucun client en dessous de 500 CHF/mois de budget pub.
 */

export const pricingValidated = true;

export type TierId = "starter" | "croissance" | "performance" | "sur-mesure";

/** Ligne d'attribut affichée dans la carte (grille comparative). */
export type TierAttribute = {
  label: string;
  value: string;
  /** true → marqueur « * » renvoyant à la note sous la grille (campagnes spéciales). */
  footnote?: boolean;
};

export type Tier = {
  id: TierId;
  name: string;
  /** Prix affiché, format suisse : "390.-" ou "dès 1490.-". */
  price: string;
  /** Valeur numérique pour le JSON-LD (PriceSpecification). */
  priceValue: number;
  /** true = prix « dès » (Sur mesure) → minPrice dans le schema, jamais un prix fixe. */
  priceIsFrom: boolean;
  unit: "/mois";
  /** Tranche de budget publicitaire affichée sur la carte. */
  forBudget: string;
  /**
   * Même tranche, en valeurs numériques (CHF/mois) : source unique du mapping
   * budget -> pack utilisé par le calculateur (`tierForBudget`). `max: null` =
   * pas de plafond. Doit rester cohérent avec `forBudget`.
   */
  budgetRange: { min: number; max: number | null };
  featured: boolean;
  /** Badge affiché sur la carte (Croissance : « Le plus choisi »). */
  badge?: string;
  attributes: TierAttribute[];
  ctaLabel: string;
  /**
   * Lien de paiement Stripe (self-serve). Vide = le CTA renvoie vers
   * /contact?pack=<id> (pré-sélection du budget dans le formulaire).
   */
  stripeLink: string;
};

const commonLabels = {
  canaux: "Canaux",
  langues: "Langues",
  campagnes: "Campagnes spéciales/an",
  reporting: "Reporting",
  crm: "Connexion CRM",
  support: "Support",
  contact: "Point de contact",
  engagement: "Engagement initial",
};

export const tiers: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    price: "390.-",
    priceValue: 390,
    priceIsFrom: false,
    unit: "/mois",
    forBudget: "Budget pub de 500 à 1 200 CHF/mois",
    budgetRange: { min: 500, max: 1200 },
    featured: false,
    attributes: [
      { label: commonLabels.canaux, value: "Search" },
      { label: commonLabels.langues, value: "1 langue" },
      { label: commonLabels.campagnes, value: "1", footnote: true },
      { label: commonLabels.reporting, value: "Dashboard + PDF mensuel auto" },
      { label: commonLabels.crm, value: "En option (+200.-/mois)" },
      { label: commonLabels.support, value: "E-mail, réponse sous 72 h" },
      { label: commonLabels.contact, value: "Aucun" },
      { label: commonLabels.engagement, value: "3 mois" },
    ],
    ctaLabel: "Choisir Starter",
    stripeLink: "",
  },
  {
    id: "croissance",
    name: "Croissance",
    price: "590.-",
    priceValue: 590,
    priceIsFrom: false,
    unit: "/mois",
    forBudget: "Budget pub de 1 200 à 5 000 CHF/mois",
    budgetRange: { min: 1200, max: 5000 },
    featured: true,
    badge: "Le plus choisi",
    attributes: [
      { label: commonLabels.canaux, value: "2 canaux au choix" },
      { label: commonLabels.langues, value: "2 langues" },
      { label: commonLabels.campagnes, value: "3", footnote: true },
      { label: commonLabels.reporting, value: "Dashboard + PDF mensuel auto" },
      { label: commonLabels.crm, value: "En option (+200.-/mois)" },
      { label: commonLabels.support, value: "E-mail, réponse sous 48 h" },
      { label: commonLabels.contact, value: "30 min par trimestre" },
      { label: commonLabels.engagement, value: "3 mois" },
    ],
    ctaLabel: "Choisir Croissance",
    stripeLink: "",
  },
  {
    id: "performance",
    name: "Performance",
    price: "1190.-",
    priceValue: 1190,
    priceIsFrom: false,
    unit: "/mois",
    forBudget: "Budget pub de 5 000 à 15 000 CHF/mois",
    budgetRange: { min: 5000, max: 15000 },
    featured: false,
    attributes: [
      { label: commonLabels.canaux, value: "Search, Display, Shopping" },
      { label: commonLabels.langues, value: "3 langues" },
      { label: commonLabels.campagnes, value: "5", footnote: true },
      { label: commonLabels.reporting, value: "Dashboard + PDF + vidéo mensuelle (Loom)" },
      { label: commonLabels.crm, value: "Incluse" },
      { label: commonLabels.support, value: "E-mail + WhatsApp, réponse sous 24 h" },
      { label: commonLabels.contact, value: "30 min par mois" },
      { label: commonLabels.engagement, value: "3 mois" },
    ],
    ctaLabel: "Choisir Performance",
    stripeLink: "",
  },
  {
    id: "sur-mesure",
    name: "Sur mesure",
    price: "dès 1490.-",
    priceValue: 1490,
    priceIsFrom: true,
    unit: "/mois",
    forBudget: "Budget pub de 15 000 CHF/mois et plus",
    budgetRange: { min: 15000, max: null },
    featured: false,
    attributes: [
      { label: commonLabels.canaux, value: "Tous" },
      { label: commonLabels.langues, value: "Sur mesure" },
      { label: commonLabels.campagnes, value: "Illimitées", footnote: true },
      { label: commonLabels.reporting, value: "Sur mesure" },
      { label: commonLabels.crm, value: "Incluse" },
      { label: commonLabels.support, value: "Dédié" },
      { label: commonLabels.contact, value: "Sur mesure" },
      { label: commonLabels.engagement, value: "Sur mesure" },
    ],
    ctaLabel: "Discutons-en",
    stripeLink: "",
  },
];

/** Frais de mise en place et options (tableau séparé sous la grille). */
export type AddOn = {
  id: string;
  label: string;
  /** Format suisse : "300.-", "dès 500.-", "+200.-". */
  price: string;
  unit: "une fois" | "/mois";
  /** true → tag « obligatoire » (setup tracking, avant tout lancement). */
  mandatory?: boolean;
  /** Packs concernés (ex. CRM : Starter et Croissance seulement). */
  availability?: string;
  note?: string;
};

export const addOns: AddOn[] = [
  {
    id: "setup-tracking",
    label: "Setup tracking standard",
    price: "300.-",
    unit: "une fois",
    mandatory: true,
    note: "Sur WordPress : suivi des appels, clics e-mail, formulaires et actions simples (téléchargement de PDF, vue d'une page clé). Hors connexion CRM.",
  },
  {
    id: "setup-shopping",
    label: "Setup Shopping / Merchant Center",
    price: "500.-",
    unit: "une fois",
  },
  {
    id: "landing-page",
    label: "Landing page dédiée",
    price: "dès 500.-",
    unit: "une fois",
  },
  {
    id: "crm",
    label: "Connexion CRM / enhanced conversions",
    price: "+200.-",
    unit: "/mois",
    availability: "Starter et Croissance (incluse dès Performance)",
  },
  {
    id: "langue-supp",
    label: "Langue supplémentaire",
    price: "+100.-",
    unit: "/mois",
  },
];

/** Mentions obligatoires sous la grille. */
export const pricingNotes = {
  budgetSeparate:
    "Budget publicitaire payé directement à Google, en plus des frais de gestion. Setup tracking obligatoire : 300.- (une fois).",
  vat: "TVA non applicable.",
};

/** Micro-explication « campagnes spéciales » (note * sous la grille). */
export const specialCampaignsNote =
  "Campagnes ou ajustements ponctuels liés à des événements : saisons, Black Friday, soldes, promotions.";

/**
 * Plancher budget pub - réutilisé par le formulaire de contact (message < 500)
 * et les FAQ. Aucun client en dessous de 500 CHF/mois de budget publicitaire.
 */
export const budgetFloorNote =
  "En dessous de 500 CHF par mois de budget publicitaire, les campagnes ne génèrent pas assez de données pour être optimisées : les résultats sont aléatoires et vous paieriez des frais de gestion pour rien. Nous préférons vous le dire d'entrée : mieux vaut attendre d'avoir ce budget que de tester trop petit.";

/**
 * Pack correspondant à un budget publicitaire mensuel (CHF).
 * Renvoie `null` sous le plancher de 500.-/mois : aucun pack n'est proposé,
 * c'est le message de refus pédagogique qui s'affiche (cf. budgetFloorNote).
 * Utilisé par le calculateur de budget (/calculateur-budget).
 */
export function tierForBudget(budget: number): Tier | null {
  if (!Number.isFinite(budget) || budget < 500) return null;
  return (
    tiers.find(
      (t) => budget >= t.budgetRange.min && (t.budgetRange.max === null || budget < t.budgetRange.max),
    ) ?? tiers[tiers.length - 1]
  );
}
