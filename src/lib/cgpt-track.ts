/**
 * Suivi des pages ChatGPT Ads (page service et landing page) : contexte commun
 * à tous les événements poussés dans le dataLayer de GTM.
 *
 * - `page` : identifiant de la page, lu sur l'attribut `data-cgpt-page` posé par
 *   le formulaire (présent sur les deux pages), le même que son champ caché.
 * - `source_trafic` : `google` (gclid ou utm_source=google), `linkedin`
 *   (li_fat_id ou utm_source=linkedin), sinon `autre`. Calculé depuis l'URL
 *   d'arrivée, sans aucun stockage navigateur.
 *
 * Aucune donnée personnelle ne passe par ici : ni nom, ni e-mail, ni téléphone.
 */

export type Eligibilite = "ouvert" | "validation" | "impossible" | "autre";

const params = new URLSearchParams(location.search);

export function sourceTrafic(): "google" | "linkedin" | "autre" {
  const utm = (params.get("utm_source") || "").toLowerCase();
  if (params.get("gclid") || utm === "google") return "google";
  if (params.get("li_fat_id") || utm === "linkedin") return "linkedin";
  return "autre";
}

export function context() {
  const el = document.querySelector<HTMLElement>("[data-cgpt-page]");
  return { page: el?.dataset.cgptPage || "", source_trafic: sourceTrafic() };
}

export function push(data: Record<string, unknown>) {
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ ...data, ...context() });
}

/** `cta_click` sur tout élément portant `data-cta` (valeur = position). */
let ctaTracking = false;
export function trackCtaClicks() {
  if (ctaTracking) return;
  ctaTracking = true;
  document.addEventListener("click", (e) => {
    const el = (e.target as Element | null)?.closest<HTMLElement>("[data-cta]");
    if (el) push({ event: "cta_click", position: el.dataset.cta });
  });
}
