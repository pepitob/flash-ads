/**
 * TARIFS — source UNIQUE des paliers (Home + /services/google-ads).
 *
 * ⚠️  PRIX À CONFIRMER PAR L'AGENCE AVANT PUBLICATION (brief §7 & §13).
 *     Les montants ci-dessous reprennent la structure validée dans le mockup,
 *     mais doivent être validés sur les coûts réels par client. Tant que
 *     `validated` est `false`, traiter ces chiffres comme provisoires.
 *
 * Modèle : frais de setup ponctuels + abonnement mensuel de gestion.
 * Le budget publicitaire est payé directement par le client à Google.
 */

export const pricingValidated = false; // passer à true une fois les prix confirmés

/** Frais de mise en place ponctuels (audit + tracking + construction). */
export const setupFee = {
  label: "Mise en place",
  // PLACEHOLDER — montant à confirmer.
  amount: "CHF 890",
  unit: "ponctuel",
  note: "Audit, configuration du tracking (GA4 + GTM + conversions) et construction des campagnes.",
};

export type Tier = {
  id: string;
  name: string;
  /** Prix mensuel — PLACEHOLDER tant que pricingValidated === false. */
  price: string;
  unit: string;
  /** Tranche de budget publicitaire visée. */
  forBudget: string;
  featured: boolean;
  features: string[];
  ctaLabel: string;
  /**
   * Lien de paiement Stripe (self-serve "payer et démarrer").
   * PLACEHOLDER — coller le Stripe Payment Link réel de chaque palier.
   * Vide = bouton self-serve masqué, on garde uniquement l'échange préalable.
   */
  stripeLink: string;
};

export const tiers: Tier[] = [
  {
    id: "essentiel",
    name: "Essentiel",
    price: "CHF 490",
    unit: "/mois",
    forBudget: "Budget pub jusqu'à 2 500 CHF/mois",
    featured: false,
    features: [
      "Vos annonces sur Google",
      "Une région, une langue",
      "Améliorations chaque mois",
      "Rapport clair, envoyé automatiquement",
      "Aide par e-mail",
    ],
    ctaLabel: "Demander un devis",
    stripeLink: "",
  },
  {
    id: "croissance",
    name: "Croissance",
    price: "CHF 990",
    unit: "/mois",
    forBudget: "Budget pub de 2 500 à 8 000 CHF/mois",
    featured: true,
    features: [
      "Plusieurs campagnes, 2 langues",
      "Améliorations deux fois par mois",
      "Rapport mensuel + point tous les 3 mois",
      "Aide prioritaire",
    ],
    ctaLabel: "Demander un devis",
    stripeLink: "",
  },
  {
    id: "performance",
    name: "Performance",
    price: "CHF 2 200",
    unit: "/mois",
    forBudget: "Budget pub de 8 000 à 25 000 CHF/mois",
    featured: false,
    features: [
      "Gestion complète de vos campagnes",
      "Relance des visiteurs + conseils sur votre site",
      "Améliorations chaque semaine",
      "Point mensuel dédié",
    ],
    ctaLabel: "Demander un devis",
    stripeLink: "",
  },
];

/** Mention sous la grille (budget séparé + sur-mesure au-delà). */
export const pricingNotes = {
  budgetSeparate:
    "Votre budget de pub est séparé et payé directement à Google avec votre carte. Il reste chez vous.",
  custom:
    "Vous voulez investir plus de 25 000 CHF/mois en pub ? Parlons-en — offre sur mesure.",
  qualification:
    "En dessous d'environ 1 000 CHF/mois de budget de pub, il n'y a pas assez de données pour bien régler les campagnes.",
  exchangeFirst:
    "On préfère un court échange avant de démarrer, pour bien comprendre votre besoin. Mais si vous préférez, vous pouvez payer et démarrer directement.",
};
