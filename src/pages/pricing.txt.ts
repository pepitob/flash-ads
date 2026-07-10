/**
 * Fichier de prix machine-readable (/pricing.txt) pour les agents IA / moteurs de réponse.
 * Généré depuis la source unique `src/data/tarifs.ts`.
 *
 * ⚠️ Gaté sur `pricingValidated` : tant que les prix ne sont pas confirmés, on ne publie
 *    AUCUN chiffre — le fichier renvoie une note « tarifs sur demande ». Cohérent avec la
 *    discipline anti-placeholder du projet (jamais de faux prix publié).
 */
import type { APIRoute } from "astro";
import { site } from "../data/site";
import { pricingValidated, tiers, setupFee, pricingNotes } from "../data/tarifs";

export const GET: APIRoute = () => {
  const lines: string[] = [];
  lines.push(`# Tarifs — ${site.name}`);
  lines.push("");
  lines.push(`> ${site.description}`);
  lines.push("");

  if (!pricingValidated) {
    lines.push("## Tarifs sur demande");
    lines.push("");
    lines.push(
      "Les tarifs détaillés sont communiqués sur demande, lors d'un devis gratuit (réponse sous 1 jour ouvré).",
    );
    lines.push(`Contact : ${site.email} · ${site.url}/contact`);
  } else {
    lines.push("## Modèle");
    lines.push("- Frais de gestion mensuels fixes + frais de mise en place ponctuels.");
    lines.push(
      "- Aucune commission sur le budget publicitaire : il est payé directement à Google par le client.",
    );
    lines.push("");
    lines.push(`## ${setupFee.label}`);
    lines.push(`- Prix : ${setupFee.amount} (${setupFee.unit})`);
    lines.push(`- Inclus : ${setupFee.note}`);
    lines.push("");
    lines.push("## Formules mensuelles");
    for (const t of tiers) {
      lines.push("");
      lines.push(`### ${t.name}${t.featured ? " (le plus choisi)" : ""}`);
      lines.push(`- Prix : ${t.price}${t.unit}`);
      lines.push(`- Pour : ${t.forBudget}`);
      lines.push(`- Inclus : ${t.features.join(" · ")}`);
    }
    lines.push("");
    lines.push("## Notes");
    lines.push(`- ${pricingNotes.budgetSeparate}`);
    lines.push(`- ${pricingNotes.qualification}`);
    lines.push(`- ${pricingNotes.custom}`);
  }
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
