/**
 * Preuve sociale - témoignages, logos clients et chiffres clés.
 *
 * ✅ TÉMOIGNAGES RÉELS. Source : fiche Google Business Profile de l'agence
 *    (anciennement « Adineo », renommée Flash Ads), 5,0 ★ sur 6 avis.
 *    Relevé le 2026-07-28. place_id ChIJf_0JGAUxjEcRdBaOc1yOMBk.
 *    Le nom « Adineo » a été remplacé par « Flash Ads » dans les citations
 *    qui le mentionnaient ; le reste du texte est verbatim.
 *
 * ⚠️ `clientLogos` reste un PLACEHOLDER (vrais noms/logos requis, avec accord).
 *    Ne jamais inventer de témoignages ni de chiffres (brief §13).
 *
 * Le badge Google Partner, lui, est réel (voir src/data/site.ts).
 */

/** Témoignages réels depuis le 2026-07-28 - ne plus afficher l'avertissement. */
export const proofPlaceholder = false;

/** Note agrégée de la fiche Google. Réel - mettre à jour si de nouveaux avis arrivent. */
export const googleReviews = {
  rating: 5.0,
  count: 6,
  profileUrl:
    "https://www.google.com/maps/place/?q=place_id:ChIJf_0JGAUxjEcRdBaOc1yOMBk",
};

export type Testimonial = {
  quote: string;
  /** Nom tel qu'affiché sur l'avis Google. */
  author: string;
  /** Entreprise, si distincte de l'auteur. Omis si inconnu - ne pas inventer. */
  company?: string;
  /** Ville, uniquement si connue avec certitude. Omis sinon - ne pas inventer. */
  location?: string;
  /** Ancienneté telle qu'affichée par Google au moment du relevé. */
  date: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Nous collaborons étroitement avec Flash Ads dans le cadre de notre stratégie SEA. C'est un très agréable de travailler avec Hippolyte Bourban, qui est toujours à l'écoute des spécificités métier, et qui est très réactif. Nous adaptons en continu les actions, et cela fonctionne très bien. La collaboration est également très simple. Merci pour l'étroite collaboration.",
    author: "Ma Porte Sàrl",
    date: "il y a un an",
  },
  {
    quote:
      "Nous collaborons depuis 2020 avec Flash Ads pour des questions en lien avec notre site internet www.espacetriathlon.com, notamment pour le paramétrage de Google Ads et Google Merchant Center. Le travail effectué nous a permis d'accroître significativement les ventes online. Nous avons par ailleurs toujours apprécié le support et la maintenance offertes, toujours très efficaces et rapides. Pour cette raison, nous ne pouvons que conseiller Flash Ads.",
    author: "Sportmax Nyon",
    company: "Espace Triathlon",
    location: "Nyon",
    date: "il y a un an",
  },
  {
    quote:
      "Je cherchais une agence SEA pour m'aider dans la gestion de campagnes Google Ads et cela fait maintenant plus d'1 an que j'ai fait appel à Flash Ads. Ils ont pris le temps d'écouter mes besoins et de comprendre ma situation et suivent mes campagnes Google Ads depuis. Bon travail, facile dans la communication, disponibles. Je recommande.",
    author: "Julien",
    date: "il y a 4 ans",
  },
  {
    quote:
      "Équipe super pro, réactive et à l'écoute. Grâce à eux, nos campagnes Google Ads ont enfin commencé à générer des vrais résultats. Je recommande vivement !",
    author: "Abdullah Tariq",
    date: "il y a un an",
  },
  {
    quote:
      "Un soutien formidable, très aimable et professionnel ; cela nous a aidés à trouver des patients pour notre cabinet en psychothérapie. Je recommande vivement !",
    author: "Stefania Vanzetti",
    date: "il y a un an",
  },
  {
    quote:
      "Excellente agence SEA et SEO. L'équipe est très sympathique. Nous avons obtenu d'excellents résultats pour notre entreprise.",
    author: "Maria Victoria Palazzo",
    date: "il y a 4 ans",
  },
];

/** Logos clients (bandeau confiance). PLACEHOLDER - vrais noms/logos requis. */
export const clientLogos: string[] = [
  "Client A",
  "Client B",
  "Client C",
  "Client D",
  "Client E",
];

/** Chiffres clés du bandeau réassurance. PLACEHOLDER sauf mention. */
export const keyStats = [
  { value: "6-7", label: "PME accompagnées" }, // ordre de grandeur réel (brief)
  { value: "0%", label: "pris sur votre budget de pub" }, // réel (modèle)
  { value: "dès 390.-", label: "de gestion par mois" }, // réel (grille tarifaire)
];
