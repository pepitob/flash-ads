/**
 * Preuve sociale — témoignages, logos clients et chiffres clés.
 *
 * ⚠️ PLACEHOLDERS. Le contenu du site actuel n'a pas pu être récupéré
 *    automatiquement (rendu JavaScript). Remplacer par des éléments RÉELS :
 *    vrais témoignages (avec accord), vrais noms/logos, vrais chiffres.
 *    Ne jamais inventer de témoignages ni de chiffres (brief §13).
 *
 * Le badge Google Partner, lui, est réel (voir src/data/site.ts).
 */

export const proofPlaceholder = true; // passer à false une fois le réel intégré

export type Testimonial = {
  quote: string;
  author: string;
  company: string;
  location: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "PLACEHOLDER — remplacer par un vrai témoignage client (avec accord). Ex. : « On reçoit enfin des demandes régulières, et je comprends ce que je paie. »",
    author: "Prénom N.",
    company: "Entreprise (secteur)",
    location: "Ville",
  },
  {
    quote:
      "PLACEHOLDER — vrai témoignage. Ex. : « Pas de jargon, pas de mauvaise surprise sur la facture. On a doublé les appels en quelques mois. »",
    author: "Prénom N.",
    company: "Entreprise (secteur)",
    location: "Ville",
  },
];

/** Logos clients (bandeau confiance). PLACEHOLDER — vrais noms/logos requis. */
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
  { value: "Sans", label: "engagement sur la durée" }, // réel (modèle)
];
