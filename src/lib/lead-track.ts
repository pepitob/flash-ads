/**
 * Suivi enrichi des pages à formulaire de lead (ChatGPT Ads : page service et
 * landing page ; Gestion Google Ads) : contexte commun à tous les événements
 * poussés dans le dataLayer de GTM.
 *
 * - `page` : identifiant de la page, lu sur l'attribut `data-track-page` posé par
 *   le formulaire, le même que son champ caché `page`.
 * - `source_trafic` : `google` (gclid ou utm_source=google), `linkedin`
 *   (li_fat_id ou utm_source=linkedin), sinon `autre`. Calculé depuis l'URL
 *   d'arrivée, sans aucun stockage navigateur.
 *
 * Données personnelles : uniquement dans `user_data` de `generate_lead` (voir
 * `userData()`), pour les conversions améliorées Google Ads. Jamais dans un autre
 * événement ni dans un paramètre à plat. Côté GTM, elles ne doivent alimenter que la
 * variable « Données fournies par l'utilisateur », jamais un paramètre GA4, et rester
 * soumises au consentement `ad_user_data`.
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
  const el = document.querySelector<HTMLElement>("[data-track-page]");
  return { page: el?.dataset.trackPage || "", source_trafic: sourceTrafic() };
}

export function push(data: Record<string, unknown>) {
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ ...data, ...context() });
}

/** Téléphone au format E.164 (+41…), attendu par les conversions améliorées. */
function e164(raw: string): string {
  // « +41 (0)79 … » : le (0) national tombe avant la normalisation.
  let n = raw.replace(/\(0\)/g, "").replace(/[^\d+]/g, "");
  if (n.startsWith("00")) n = "+" + n.slice(2);
  else if (n.startsWith("0")) n = "+41" + n.slice(1);
  else if (n && !n.startsWith("+")) n = "+41" + n;
  return n.length >= 8 ? n : "";
}

/**
 * `user_data` de `generate_lead`, au format de la variable GTM « Données fournies
 * par l'utilisateur ». Le champ `nom` est unique (« Prénom et nom ») : premier mot
 * = prénom, reste = nom. Les valeurs vides sont omises. À lire avant `form.reset()`.
 */
export function userData(data: FormData) {
  const get = (k: string) => String(data.get(k) || "").trim();
  const email = get("email").toLowerCase();
  const phone = e164(get("telephone"));
  const [first, ...rest] = get("nom").split(/\s+/).filter(Boolean);
  const address: Record<string, string> = { country: "CH" };
  if (first) address.first_name = first;
  if (rest.length) address.last_name = rest.join(" ");
  return {
    ...(email ? { email } : {}),
    ...(phone ? { phone_number: phone } : {}),
    address,
  };
}
