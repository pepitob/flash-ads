/**
 * Moteur du calculateur de budget Google Ads (/calculateur-budget).
 *
 * Un SEUL moteur pour les deux habillages (simple / expert) et les deux modèles
 * (génération de leads / e-commerce). Volontairement sans dépendance au DOM :
 * il est appelé au build (rendu statique du résultat par défaut, donc pas de
 * layout shift ni de page vide sans JS) ET dans l'îlot client au recalcul.
 *
 * Principes de présentation (v2) :
 * - un chiffre recommandé unique, calculé sur le CPC central du secteur
 *   (moyenne géométrique min/max), encadré d'une fourchette resserrée à plus ou
 *   moins 25 % : elle reste presque toujours dans un seul pack ;
 * - le budget recommandé n'est JAMAIS sous le plancher de 500.-/mois, puisque
 *   Flash Ads refuse ces budgets. Sous le plancher : message, aucun pack ;
 * - le pack est dérivé du seul chiffre recommandé, donc toujours aligné sur lui ;
 * - la rentabilité se compare à la MARGE du client, pas à son chiffre d'affaires.
 *
 * Sources de vérité, jamais dupliquées ici :
 * - CPC par secteur : src/data/calculator/cpc.json (Keyword Planner 08/2026
 *   croisé avec des comptes réels). Ne pas modifier ces valeurs.
 * - Hypothèses par défaut : src/data/calculator/defaults.json (éditable sans code).
 * - Packs et plancher de 500.- : src/data/tarifs.ts (`tierForBudget`).
 */
import cpcData from "../data/calculator/cpc.json";
import defaultsData from "../data/calculator/defaults.json";
import { tierForBudget, type Tier } from "../data/tarifs";

export const params = defaultsData.global;

export type Activity = "leadgen" | "ecommerce";

export type Sector = {
  id: string;
  label: string;
  cpcMin: number;
  cpcMax: number;
  /** CPC central du secteur : moyenne géométrique du min et du max. */
  cpcTypical: number;
  /** Taux de conversion du site (visiteur -> demande entrante). */
  conv: number;
  /** Taux de closing (demande entrante -> client signé). */
  closing: number;
  /** Part de marge sur la valeur client (0.3 = 30%). */
  marge: number;
  /** Secteur proposé par défaut en mode e-commerce. */
  ecommerceDefault: boolean;
};

type RateRow = { conv: number; closing: number; marge: number; ecommerceDefault?: boolean };
const rates = defaultsData.sectors as Record<string, RateRow>;

/** Les 18 secteurs, triés par libellé (ordre du select). */
export const sectors: Sector[] = Object.entries(cpcData)
  .map(([id, d]) => {
    const r = rates[id];
    return {
      id,
      label: d.label,
      cpcMin: d.cpc_min,
      cpcMax: d.cpc_max,
      cpcTypical: Math.sqrt(d.cpc_min * d.cpc_max),
      conv: r?.conv ?? params.fallbackConv,
      closing: r?.closing ?? params.fallbackClosing,
      marge: r?.marge ?? params.fallbackMarge,
      ecommerceDefault: r?.ecommerceDefault === true,
    };
  })
  .sort((a, b) => a.label.localeCompare(b.label, "fr"));

export function getSector(id: string): Sector {
  return (
    sectors.find((s) => s.id === id) ??
    sectors.find((s) => s.id === params.defaultSector) ??
    sectors[0]
  );
}

export type CalcInput = {
  activity: Activity;
  sector: string;
  /** Grandes agglomérations (Genève, Lausanne) : concurrence plus forte. */
  urban: boolean;

  /* ── Lead-gen ── */
  clientValue: number;
  clients: number;
  /* Lead-gen, mode expert : bloc valeur client / LTV */
  recurring: boolean;
  purchasesPerYear: number;
  loyaltyYears: number;

  /* ── E-commerce ── */
  revenue: number;
  basket: number;
  /** ROAS minimum acceptable : en dessous, la campagne n'intéresse plus. */
  roas: number;
  /** Taux de réachat annuel (0 à 1), mode expert. */
  repeatRate: number;

  /* ── Hypothèses (pré-remplies par le secteur, éditables en mode expert) ── */
  cpcMin: number;
  cpcMax: number;
  conv: number;
  closing: number;
  marge: number;
  safety: number;
};

export type CalcStatus = "ok" | "floor" | "unprofitable";

export type CalcResult = {
  activity: Activity;
  /** Chiffre affiché en grand, arrondi à la cinquantaine. Détermine le pack. */
  budgetReco: number;
  /** Bornes de la fourchette resserrée, arrondies à la dizaine. */
  budgetLow: number;
  budgetHigh: number;
  budgetRecoRaw: number;
  status: CalcStatus;
  /** Marge serrée (avertissement, sans bloquer). */
  warning: boolean;
  /** Double lecture première transaction / valeur à vie (expert, récurrent). */
  doubleReading: boolean;
  tier: Tier | null;
  /** Plafond du pack quand la borne haute le dépasse (note de bascule). */
  tierOverflow: number | null;

  /* Lead-gen */
  leads: number;
  clicks: number;
  cpcTypical: number;
  cpaLow: number;
  cpaHigh: number;
  /** Valeur à vie (= valeur client si non récurrent). */
  ltv: number;
  /** Marge dégagée par un client : base de comparaison de la rentabilité. */
  reference: number;
  /** Marge de la première transaction (utile en mode récurrent). */
  firstMargin: number;

  /* E-commerce */
  orders: number;
  costPerOrderLow: number;
  costPerOrderHigh: number;
  /** ROAS réel en incluant les réachats (mode expert). */
  effectiveRoas: number;
};

const roundTo = (n: number, step: number) =>
  Number.isFinite(n) ? Math.round(n / step) * step : 0;

const positive = (n: number, fallback = 0) =>
  Number.isFinite(n) && n > 0 ? n : fallback;

/** État initial : secteur par défaut, hypothèses du secteur pré-remplies. */
export function defaultInput(activity: Activity = "leadgen"): CalcInput {
  const sector = getSector(
    activity === "ecommerce" ? params.ecommerceSector : params.defaultSector,
  );
  return {
    activity,
    sector: sector.id,
    urban: false,
    clientValue: params.defaultClientValue,
    clients: params.defaultClients,
    recurring: false,
    purchasesPerYear: params.defaultPurchasesPerYear,
    loyaltyYears: params.defaultLoyaltyYears,
    revenue: params.defaultRevenue,
    basket: params.defaultBasket,
    roas: params.defaultRoas,
    repeatRate: params.defaultRepeatRate,
    cpcMin: sector.cpcMin,
    cpcMax: sector.cpcMax,
    conv: sector.conv,
    closing: sector.closing,
    marge: sector.marge,
    safety: params.safety,
  };
}

/** Réapplique les hypothèses d'un secteur (au changement de secteur). */
export function applySector(input: CalcInput, sectorId: string): CalcInput {
  const s = getSector(sectorId);
  return {
    ...input,
    sector: s.id,
    cpcMin: s.cpcMin,
    cpcMax: s.cpcMax,
    conv: s.conv,
    closing: s.closing,
    marge: s.marge,
  };
}

export function compute(input: CalcInput): CalcResult {
  const geo = input.urban ? params.geoUrban : params.geoStandard;
  const safety = positive(input.safety, params.safety);
  const band = positive(params.bandFactor, 1.25);

  let recoRaw = 0;
  let lowRaw = 0;
  let leads = 0;
  let clicks = 0;
  let orders = 0;
  let effectiveRoas = 0;
  let cpcTypical = 0;

  if (input.activity === "leadgen") {
    const clients = positive(input.clients, 1);
    const closing = positive(input.closing, params.fallbackClosing);
    const conv = positive(input.conv, params.fallbackConv);
    // CPC central plutôt que les extrêmes : la fourchette resserrée qui suit
    // reste actionnable, et l'écart complet du secteur reste consultable dans
    // le bloc « Comment ce calcul fonctionne ».
    cpcTypical = Math.sqrt(positive(input.cpcMin) * positive(input.cpcMax));
    leads = clients / closing;
    clicks = leads / conv;
    recoRaw = clicks * cpcTypical * geo * safety;
  } else {
    const revenue = positive(input.revenue);
    const roas = Math.max(positive(input.roas, params.defaultRoas), 1.5);
    // ROAS minimum acceptable : le budget recommandé est le plafond à prévoir.
    // Dépenser plus ferait passer le retour sous ce seuil.
    recoRaw = revenue / roas;
    lowRaw = revenue / (roas + 1);
    orders = revenue / positive(input.basket, 1);
    effectiveRoas = roas * (1 + Math.max(input.repeatRate, 0));
  }

  const budgetReco = roundTo(recoRaw, params.roundReco);
  // Les bornes se déduisent du chiffre AFFICHÉ, pas de la valeur brute : le
  // visiteur peut refaire le calcul de tête (800 / 1.25 = 640, 800 x 1.25 = 1000).
  let budgetLow = roundTo(
    input.activity === "leadgen" ? budgetReco / band : lowRaw,
    params.roundBand,
  );
  let budgetHigh =
    input.activity === "leadgen" ? roundTo(budgetReco * band, params.roundBand) : budgetReco;

  // Le budget recommandé n'est jamais sous le plancher : sous ce seuil, aucun
  // pack n'est proposé. Au-dessus, la borne basse est relevée au plancher, on
  // ne recommande pas un montant que nous refuserions.
  const floorHit = budgetReco < params.budgetFloor;
  if (!floorHit) {
    budgetLow = Math.max(budgetLow, params.budgetFloor);
    budgetHigh = Math.max(budgetHigh, budgetLow);
  }

  const clients = positive(input.clients, 1);
  const cpaLow = input.activity === "leadgen" ? budgetLow / clients : 0;
  const cpaHigh = input.activity === "leadgen" ? budgetHigh / clients : 0;
  const costPerOrderLow = orders > 0 ? budgetLow / orders : 0;
  const costPerOrderHigh = orders > 0 ? budgetHigh / orders : 0;

  const clientValue = positive(input.clientValue);
  const marge = positive(input.marge, params.fallbackMarge);
  const ltv = input.recurring
    ? clientValue * positive(input.purchasesPerYear, 1) * positive(input.loyaltyYears, 1)
    : clientValue;
  // Base de rentabilité : la MARGE dégagée par un client, pas son chiffre
  // d'affaires. En expert récurrent, la marge sur la valeur à vie.
  const reference = ltv * marge;
  const firstMargin = clientValue * marge;

  let status: CalcStatus = "ok";
  if (floorHit) status = "floor";
  else if (input.activity === "leadgen" && reference > 0 && cpaLow > reference)
    status = "unprofitable";

  const tier = status === "ok" ? tierForBudget(budgetReco) : null;
  const tierMax = tier?.budgetRange.max ?? null;
  const tierOverflow = tierMax !== null && budgetHigh > tierMax ? tierMax : null;

  const tight = status === "ok" && input.activity === "leadgen" && reference > 0;
  const warning = tight && cpaHigh > params.warnRatio * reference;
  // La LTV ne change pas le budget : elle change la lecture de la rentabilité.
  const doubleReading =
    tight && input.recurring && !warning && cpaHigh > params.warnRatio * firstMargin;

  return {
    activity: input.activity,
    budgetReco,
    budgetLow,
    budgetHigh,
    budgetRecoRaw: recoRaw,
    status,
    warning,
    doubleReading,
    tier,
    tierOverflow,
    leads,
    clicks,
    cpcTypical,
    cpaLow,
    cpaHigh,
    ltv,
    reference,
    firstMargin,
    orders,
    costPerOrderLow,
    costPerOrderHigh,
    effectiveRoas,
  };
}

/* ──────────────────────────────────────────────────────────────
   Formatage (identique au build et au client : aucun écart de rendu)
   ────────────────────────────────────────────────────────────── */

const NNBSP = " ";

/** Entier au format suisse : 1850 -> "1 850" (espace fine insécable). */
export function fmt(n: number): string {
  const v = Math.round(Number.isFinite(n) ? n : 0);
  return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP);
}

/** Décimale courte pour les CPC et le ROAS : 3.5 -> "3.5", 4 -> "4". */
export function fmtDec(n: number): string {
  const v = Number.isFinite(n) ? n : 0;
  return String(Math.round(v * 10) / 10);
}

export function fmtPct(n: number): string {
  return `${Math.round(n * 1000) / 10}%`;
}

export type ResultCopy = {
  /** Ligne de fourchette, sous le chiffre recommandé. */
  band: string;
  /** Ligne « coût par client » ou « commandes / coût par commande ». */
  detail: string;
  /** Lecture de la marge (lead-gen) ou plafond de ROAS (e-commerce). */
  margeLine: string;
  /** Message de check (plancher, non rentable, marge serrée, double lecture). */
  message: string;
  /** Tonalité du message, pilote l'habillage visuel. */
  tone: "none" | "warn" | "stop";
  /** Phrase de cadrage de la carte pack. */
  packLine: string;
  /** Note de bascule quand la borne haute dépasse le plafond du pack. */
  packOverflow: string;
  /** Résumé lu par les lecteurs d'écran (région live). */
  live: string;
};

export const disclaimerShort =
  "Estimation indicative basée sur les coûts par clic observés en Suisse romande. Les coûts réels varient selon la concurrence, la saison et la qualité de vos annonces et de votre site. Le budget recommandé est un point de départ, affiné après 6 à 8 semaines de données réelles.";

/** Textes du résultat : construits ici pour que build et client soient identiques. */
export function resultCopy(input: CalcInput, r: CalcResult): ResultCopy {
  const band =
    r.activity === "leadgen"
      ? `Fourchette réaliste : ${fmt(r.budgetLow)} à ${fmt(r.budgetHigh)} CHF/mois`
      : `Dès ${fmt(r.budgetLow)} CHF si les campagnes atteignent un ROAS de ${fmtDec(input.roas + 1)}`;

  const detail =
    r.activity === "leadgen"
      ? `Chaque nouveau client vous coûterait environ ${fmt(r.cpaLow)} à ${fmt(r.cpaHigh)} CHF.`
      : `Environ ${fmt(r.orders)} commandes par mois, soit ${fmt(r.costPerOrderLow)} à ${fmt(r.costPerOrderHigh)} CHF par commande.`;

  const margeLine =
    r.activity === "leadgen"
      ? `Sur une marge de ${fmtPct(input.marge)}, un client vous laisse ${fmt(r.firstMargin)} CHF.`
      : `Au-delà de ${fmt(r.budgetReco)} CHF de budget, votre retour passerait sous les ${fmtDec(input.roas)}x que vous acceptez.`;

  let message = "";
  let tone: ResultCopy["tone"] = "none";

  if (r.status === "floor") {
    message = `Avec ces objectifs, le budget nécessaire est inférieur à ${params.budgetFloor} CHF/mois. En dessous de ce seuil, les campagnes ne génèrent pas assez de données pour être optimisées et les résultats sont aléatoires. Nous préférons vous le dire maintenant : augmentez vos objectifs ou attendez d'avoir le budget.`;
    tone = "stop";
  } else if (r.status === "unprofitable") {
    message = `Avec ces chiffres, Google Ads ne sera probablement pas rentable pour vous : acquérir un client coûterait plus que les ${fmt(r.reference)} CHF de marge qu'il vous laisse. Ce n'est pas une question de budget mais de modèle : panier moyen, récurrence ou taux de conversion doivent d'abord évoluer.`;
    tone = "stop";
  } else if (r.doubleReading) {
    message = `Coût par client : ${fmt(r.cpaLow)} à ${fmt(r.cpaHigh)} CHF. Sur la première transaction (${fmt(r.firstMargin)} CHF de marge), c'est serré. Sur la valeur à vie (${fmt(r.reference)} CHF de marge), chaque client est largement rentable.`;
    tone = "warn";
  } else if (r.warning) {
    message = `Attention : acquérir un client vous coûterait jusqu'à ${fmt(r.cpaHigh)} CHF pour ${fmt(r.reference)} CHF de marge. Vous y laisseriez plus de la moitié de votre marge. Cela peut fonctionner si vos clients reviennent, sinon il faudra travailler l'offre ou le site avant d'investir massivement.`;
    tone = "warn";
  }

  const packLine = r.tier
    ? `Vous investissez ${fmt(r.budgetReco)} CHF chez Google. Notre gestion coûte ${r.tier.price}${r.tier.unit} pour que ce budget ne soit pas gaspillé.`
    : "";

  const nextTier = r.tierOverflow !== null ? tierForBudget(r.tierOverflow) : null;
  const packOverflow =
    r.tierOverflow !== null && nextTier
      ? `Si votre budget dépasse ${fmt(r.tierOverflow)} CHF, le pack ${nextTier.name} prend le relais le mois suivant, sans frais.`
      : "";

  const live =
    r.status === "floor"
      ? `Budget insuffisant : moins de ${params.budgetFloor} CHF par mois.`
      : `Budget recommandé : ${fmt(r.budgetReco)} CHF par mois. ${band}. ${detail}${r.tier ? ` Pack ${r.tier.name}.` : ""}`;

  return { band, detail, margeLine, message, tone, packLine, packOverflow, live };
}

/** Récapitulatif des hypothèses utilisées (bloc « Comment ce calcul fonctionne »). */
export function assumptionsCopy(input: CalcInput, r: CalcResult): string {
  const s = getSector(input.sector);
  if (input.activity === "ecommerce") {
    const extra =
      input.repeatRate > 0
        ? ` ROAS réel en incluant les réachats : ${fmtDec(r.effectiveRoas)}. Un ROAS de campagne plus bas reste tenable quand les clients reviennent.`
        : "";
    return `Secteur ${s.label}. Le budget recommandé est le chiffre d'affaires visé divisé par le ROAS minimum que vous acceptez (${fmtDec(input.roas)}) : c'est le plafond au-delà duquel votre retour passerait sous ce seuil. La borne basse correspond au même chiffre d'affaires atteint avec un ROAS d'un point supérieur.${extra}`;
  }
  const geoTxt = input.urban
    ? `majoration de ${Math.round((params.geoUrban - 1) * 100)}% pour les grandes agglomérations`
    : "pas de majoration géographique";
  return `Secteur ${s.label} : les clics y coûtent de ${fmtDec(input.cpcMin)} à ${fmtDec(input.cpcMax)} CHF, et le calcul retient le coût central de ${fmtDec(r.cpcTypical)} CHF. Taux de conversion du site ${fmtPct(input.conv)}, taux de closing ${fmtPct(input.closing)}, marge ${fmtPct(input.marge)}. Pour ${fmt(input.clients)} clients par mois, il faut ${fmt(r.leads)} demandes entrantes et ${fmt(r.clicks)} clics. Facteur de sécurité ${fmtDec(input.safety)}, ${geoTxt}. La fourchette affichée est de plus ou moins ${Math.round((params.bandFactor - 1) * 100)}% autour du budget recommandé.`;
}
