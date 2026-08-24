/**
 * Fichier de prix machine-readable (/pricing.txt) pour les agents IA / moteurs de réponse.
 * Généré depuis la source unique `src/data/tarifs.ts`.
 *
 * ⚠️ Gaté sur `pricingValidated` : tant que les prix ne sont pas confirmés, on ne publie
 *    AUCUN chiffre - le fichier renvoie une note « tarifs sur demande ». Cohérent avec la
 *    discipline anti-placeholder du projet (jamais de faux prix publié).
 */
import type { APIRoute } from "astro";
import { site } from "../data/site";
import {
  pricingValidated,
  tiers,
  addOns,
  pricingNotes,
  specialCampaignsNote,
  budgetFloorNote,
} from "../data/tarifs";

export const GET: APIRoute = () => {
  const lines: string[] = [];
  lines.push(`# Tarifs ${site.name}`);
  lines.push("");
  lines.push(`> ${site.description}`);
  lines.push("");

  if (!pricingValidated) {
    lines.push("## Tarifs sur demande");
    lines.push("");
    lines.push(
      "Les tarifs détaillés sont communiqués sur demande, lors d'un audit gratuit (réponse sous 1 jour ouvré).",
    );
    lines.push(`Contact : ${site.email} · ${site.url}/contact`);
  } else {
    lines.push("## Modèle");
    lines.push("- Frais de gestion mensuels fixes et publics. Le pack est déterminé par un seul critère : le budget publicitaire mensuel.");
    lines.push(
      "- Aucune commission sur le budget publicitaire : le client le paie directement à Google, avec sa propre carte, sur son propre compte.",
    );
    lines.push("- Abonnement mensuel prélevé en début de mois (carte ou TWINT via Stripe).");
    lines.push(
      "- Engagement initial de 3 mois (Google Ads a besoin de 6 à 8 semaines de données), puis résiliable chaque mois. Changement de pack au mois suivant, sans frais.",
    );
    lines.push(`- ${pricingNotes.vat}`);
    lines.push("");
    lines.push("## Packs mensuels");
    for (const t of tiers) {
      lines.push("");
      lines.push(`### ${t.name}${t.featured ? " (le plus choisi)" : ""}`);
      lines.push(`- Prix : ${t.price} ${t.unit}`);
      lines.push(`- Pour : ${t.forBudget}`);
      for (const a of t.attributes) {
        lines.push(`- ${a.label} : ${a.value}`);
      }
    }
    lines.push("");
    lines.push("## Setup et options");
    for (const a of addOns) {
      lines.push(
        `- ${a.label}${a.mandatory ? " (obligatoire)" : ""} : ${a.price} (${a.unit})${
          a.availability ? ` · ${a.availability}` : ""
        }${a.note ? ` · ${a.note}` : ""}`,
      );
    }
    lines.push("");
    lines.push("## Notes");
    lines.push(`- ${pricingNotes.budgetSeparate}`);
    lines.push(`- Campagnes spéciales : ${specialCampaignsNote}`);
    lines.push(`- Budget minimum : ${budgetFloorNote}`);
  }
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
