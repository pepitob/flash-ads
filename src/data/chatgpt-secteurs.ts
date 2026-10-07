/* ──────────────────────────────────────────────────────────────
   ChatGPT Ads : qui peut diffuser en Suisse.

   Source unique des secteurs : elle alimente les trois cartes de la section
   « Votre secteur peut-il diffuser sur ChatGPT ? », la liste déroulante du
   formulaire et le message d'éligibilité qui s'affiche sous ce champ. Une
   règle d'OpenAI qui change se corrige donc ici, une seule fois.

   Règles publicitaires d'OpenAI au 7 octobre 2026, susceptibles d'évoluer.
   ────────────────────────────────────────────────────────────── */

/** Valeur poussée dans le dataLayer (`eligibilite`), à ne pas renommer sans GTM. */
export type Eligibilite = "ouvert" | "validation" | "impossible" | "autre";

export type Secteur = { id: string; label: string };

export type SecteurGroupe = {
  status: Exclude<Eligibilite, "autre">;
  title: string;
  sectors: Secteur[];
};

export const secteurGroupes: SecteurGroupe[] = [
  {
    status: "ouvert",
    title: "Ouvert",
    sectors: [
      { id: "habitat", label: "Habitat, construction et rénovation" },
      { id: "energie-jardins", label: "Chauffage, énergie, piscines et jardins" },
      { id: "artisanat-commerce", label: "Artisanat et commerce local" },
      { id: "services-entreprises", label: "Services aux entreprises" },
      { id: "industrie-logistique", label: "Industrie et logistique" },
      { id: "formation", label: "Formation et auto-écoles" },
      { id: "tourisme-loisirs", label: "Tourisme, hôtellerie et loisirs" },
      { id: "evenementiel", label: "Événementiel" },
      { id: "e-commerce", label: "E-commerce" },
    ],
  },
  {
    status: "validation",
    title: "Possible après validation",
    sectors: [
      { id: "sante", label: "Santé (cabinets dentaires, orthodontie, cliniques)" },
      { id: "beaute", label: "Beauté et esthétique" },
    ],
  },
  {
    status: "impossible",
    title: "Pas possible en Suisse aujourd'hui",
    sectors: [
      { id: "juridique", label: "Services juridiques" },
      { id: "finance", label: "Services financiers (crédit, placements, assurances)" },
      { id: "immobilier", label: "Immobilier (vente et location)" },
      { id: "emploi", label: "Offres d'emploi" },
      { id: "jeux-argent", label: "Jeux d'argent" },
      { id: "alcool", label: "Alcool" },
      { id: "politique", label: "Contenus politiques" },
      { id: "rencontres", label: "Rencontres" },
    ],
  },
];

/** Choix hors liste : aucun message, l'éligibilité se vérifie au premier échange. */
export const secteurAutre: Secteur = { id: "autre", label: "Autre" };

/** Preuve de diffusion en santé. Client non nommé : pas d'autorisation à ce jour. */
export const preuveSante =
  "Nous diffusons déjà pour un réseau de cabinets dentaires et d'orthodontie en Suisse romande.";

/** Statut d'éligibilité par identifiant de secteur (consommé par le formulaire). */
export const eligibiliteParSecteur: Record<string, Eligibilite> = Object.fromEntries([
  ...secteurGroupes.flatMap((g) => g.sectors.map((s) => [s.id, g.status] as const)),
  [secteurAutre.id, "autre"],
]);

export const openaiAdPolicies = "https://openai.com/policies/ad-policies/";
