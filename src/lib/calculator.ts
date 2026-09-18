/**
 * Moteur du calculateur de budget Google Ads (/calculateur-budget).
 *
 * Un SEUL moteur pour les deux habillages (simple / expert) et les deux modèles
 * (génération de leads / e-commerce). Volontairement sans dépendance au DOM :
 * il est appelé au build (rendu statique du résultat par défaut, donc pas de
 * layout shift ni de page vide sans JS) ET dans l'îlot client au recalcul.
 *
 * Principe du mode simple : n'exposer AUCUNE hypothèse intermédiaire. Côté
 * leads, le taux de conversion et le taux de closing sont absorbés dans un coût
 * par client (CPA) de référence par secteur. Côté e-commerce, le ROAS n'est plus
 * une saisie mais une conséquence de la marge brute. Le mode expert, lui,
 * continue d'exposer et de laisser éditer toute la chaîne.
 *
 * Présentation :
 * - un chiffre recommandé unique, encadré d'une fourchette resserrée à plus ou
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
  /** Taux de conversion du site (visiteur -> demande entrante). */
  conv: number;
  /** Taux de closing (demande entrante -> client signé). */
  closing: number;
  /** Part de marge sur la valeur client (0.3 = 30%). */
  marge: number;
  /**
   * Coût par client de référence du secteur, arrondi à 5 CHF.
   * Dérivé des CPC et des taux ci-dessus, jamais saisi à la main : si un taux
   * change dans defaults.json, le benchmark suit automatiquement.
   */
  cpaMin: number;
  cpaMax: number;
};

type RateRow = { conv: number; closing: number; marge: number; ecommerceDefault?: boolean };
const rates = defaultsData.sectors as Record<string, RateRow>;

const round1 = (n: number) => Math.round(n * 10) / 10;

const roundTo = (n: number, step: number) =>
  Number.isFinite(n) ? Math.round(n / step) * step : 0;

const positive = (n: number, fallback = 0) =>
  Number.isFinite(n) && n > 0 ? n : fallback;

/** Coût par client = coût du clic divisé par le produit des deux taux. */
export function cpaFrom(cpc: number, conv: number, closing: number): number {
  const den = positive(conv) * positive(closing);
  return den > 0 ? cpc / den : 0;
}

/** Les 18 secteurs, triés par libellé (ordre du select). */
export const sectors: Sector[] = Object.entries(cpcData)
  .map(([id, d]) => {
    const r = rates[id];
    const conv = r?.conv ?? params.fallbackConv;
    const closing = r?.closing ?? params.fallbackClosing;
    return {
      id,
      label: d.label,
      cpcMin: d.cpc_min,
      cpcMax: d.cpc_max,
      conv,
      closing,
      marge: r?.marge ?? params.fallbackMarge,
      cpaMin: roundTo(cpaFrom(d.cpc_min, conv, closing), params.cpaRoundTo),
      cpaMax: roundTo(cpaFrom(d.cpc_max, conv, closing), params.cpaRoundTo),
    };
  })
  .sort((a, b) => a.label.localeCompare(b.label, "fr"));

/**
 * Coût du clic dans une zone donnée. La concurrence des grandes agglomérations
 * renchérit le clic : c'est bien le CPC qui monte, pas le budget final. En
 * l'appliquant ici, le mode expert AFFICHE le coût réellement utilisé au lieu
 * de cacher un multiplicateur dans la formule.
 */
export function zoneCpc(sector: Sector, urban: boolean): { min: number; max: number } {
  const geo = urban ? params.geoUrban : params.geoStandard;
  return { min: round1(sector.cpcMin * geo), max: round1(sector.cpcMax * geo) };
}

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

  /* ── Lead-gen, mode simple ── */
  clients: number;
  /** Optionnel : 0 = non renseigné, donc aucun contrôle de rentabilité. */
  clientValue: number;

  /* Lead-gen, mode expert : bloc valeur client / LTV */
  recurring: boolean;
  purchasesPerYear: number;
  loyaltyYears: number;

  /* ── E-commerce, mode simple ── */
  basket: number;
  /** Marge brute en pourcentage : c'est elle qui détermine le ROAS. */
  margePct: number;
  orders: number;

  /* ── Hypothèses (pré-remplies par le secteur, éditables en mode expert) ── */
  /** Grandes agglomérations (Genève, Lausanne) : concurrence plus forte. */
  urban: boolean;
  cpcMin: number;
  cpcMax: number;
  conv: number;
  closing: number;
  marge: number;
  safety: number;
  /** ROAS imposé par l'expert. 0 = on garde celui dérivé de la marge. */
  roasOverride: number;
  /** Taux de réachat annuel (0 à 1), mode expert. */
  repeatRate: number;
};

export type CalcStatus = "ok" | "floor" | "unprofitable" | "lowMargin";

export type CalcResult = {
  activity: Activity;
  /** Chiffre affiché en grand, arrondi à la cinquantaine. Détermine le pack. */
  budgetReco: number;
  /** Bornes de la fourchette resserrée. */
  budgetLow: number;
  budgetHigh: number;
  status: CalcStatus;
  /** Marge serrée (avertissement, sans bloquer). */
  warning: boolean;
  /** Double lecture première transaction / valeur à vie (expert, récurrent). */
  doubleReading: boolean;
  tier: Tier | null;
  /** Plafond du pack quand la borne haute le dépasse (note de bascule). */
  tierOverflow: number | null;

  /* Lead-gen */
  /** Coût par client du secteur (benchmark affiché avant le budget). */
  cpaSectorMin: number;
  cpaSectorMax: number;
  /** Coût par client issu des hypothèses courantes (= benchmark en mode simple). */
  cpaModelMin: number;
  cpaModelMax: number;
  /** Coût par client effectivement projeté, déduit de la fourchette de budget. */
  cpaLow: number;
  cpaHigh: number;
  /** Coût par client (ou par commande) au budget recommandé. */
  unitCost: number;
  /** Le même, frais de gestion Flash Ads compris. Zéro si aucun pack. */
  unitCostAllIn: number;
  /** Frais de gestion mensuels du pack recommandé. Zéro si aucun pack. */
  fee: number;
  /** Chiffre d'affaires que la campagne doit générer chaque mois. */
  grossRevenue: number;
  /** Francs de chiffre d'affaires par franc investi, frais de gestion compris. */
  roi: number;
  /** Valeur à vie (= valeur client si non récurrent). */
  ltv: number;
  /** Marge dégagée par un client : base de comparaison de la rentabilité. */
  reference: number;
  /** Marge de la première transaction (utile en mode récurrent). */
  firstMargin: number;
  /** true quand le visiteur a renseigné la valeur client. */
  hasValue: boolean;

  /* E-commerce */
  /** ROAS d'équilibre imposé par la marge brute. */
  roasBreakEven: number;
  /** ROAS retenu pour le budget : le seuil d'équilibre, ou celui imposé en expert. */
  roasTarget: number;
  /** Objectif confortable : le seuil plus le coussin de rentabilité. */
  roasComfort: number;
  revenue: number;
  costPerOrderLow: number;
  costPerOrderHigh: number;
  /** ROAS réel en incluant les réachats (mode expert). */
  effectiveRoas: number;
};

/** État initial : secteur par défaut, hypothèses du secteur pré-remplies. */
export function defaultInput(activity: Activity = "leadgen"): CalcInput {
  const sector = getSector(params.defaultSector);
  const cpc = zoneCpc(sector, false);
  return {
    activity,
    sector: sector.id,
    clients: params.defaultClients,
    clientValue: 0,
    recurring: false,
    purchasesPerYear: params.defaultPurchasesPerYear,
    loyaltyYears: params.defaultLoyaltyYears,
    basket: params.defaultBasket,
    margePct: params.defaultMargePct,
    orders: params.defaultOrders,
    urban: false,
    cpcMin: cpc.min,
    cpcMax: cpc.max,
    conv: sector.conv,
    closing: sector.closing,
    marge: sector.marge,
    safety: params.safety,
    roasOverride: 0,
    repeatRate: params.defaultRepeatRate,
  };
}

/** Réapplique les hypothèses d'un secteur (au changement de secteur). */
export function applySector(input: CalcInput, sectorId: string): CalcInput {
  const s = getSector(sectorId);
  const cpc = zoneCpc(s, input.urban);
  return {
    ...input,
    sector: s.id,
    cpcMin: cpc.min,
    cpcMax: cpc.max,
    conv: s.conv,
    closing: s.closing,
    marge: s.marge,
  };
}

export function compute(input: CalcInput): CalcResult {
  const sector = getSector(input.sector);
  const safety = positive(input.safety, params.safety);
  const band = positive(params.bandFactor, 1.25);

  let recoRaw = 0;
  let lowRaw = 0;
  let cpaModelMin = 0;
  let cpaModelMax = 0;
  let roasBreakEven = 0;
  let roasTarget = 0;
  let roasComfort = 0;
  let revenue = 0;
  let effectiveRoas = 0;

  if (input.activity === "leadgen") {
    // Le coût par client absorbe le taux de conversion et le taux de closing.
    // En mode simple ces deux taux valent ceux du secteur, donc le CPA obtenu
    // est exactement le benchmark affiché juste au-dessus du budget.
    cpaModelMin = cpaFrom(positive(input.cpcMin), input.conv, input.closing);
    cpaModelMax = cpaFrom(positive(input.cpcMax), input.conv, input.closing);
    const cpaCentral = Math.sqrt(cpaModelMin * cpaModelMax);
    // Pas de multiplicateur géographique ici : il est déjà dans cpcMin/cpcMax.
    recoRaw = positive(input.clients, 1) * cpaCentral * safety;
  } else {
    // Le ROAS n'est plus demandé : il découle de la marge brute. Une marge de
    // 35 % impose déjà 2.9 de retour rien que pour rentrer dans ses frais.
    const margePct = positive(input.margePct, params.defaultMargePct);
    // Un client qui rachète rapporte au-delà de sa première commande : le ROAS
    // exigé sur l'acquisition baisse d'autant, et le budget qu'on peut engager
    // pour la même ambition de ventes monte.
    const repeat = 1 + Math.max(input.repeatRate, 0);
    roasBreakEven = round1(100 / margePct / repeat);
    // Le budget se calcule sur le SEUIL de rentabilité, jamais sur un objectif
    // plus ambitieux : viser un meilleur ROAS ferait BAISSER le budget, donc
    // sous-provisionnerait la campagne en pariant sur sa performance. Le
    // chiffre affiché est donc le plafond à engager, et le coussin sert à
    // l'autre bout, pour dire ce que coûterait une campagne qui surperforme.
    roasTarget = input.roasOverride > 0 ? round1(input.roasOverride) : roasBreakEven;
    roasComfort = round1(roasTarget * params.roasCushion);
    revenue = positive(input.orders, 1) * positive(input.basket, 1);
    recoRaw = revenue / Math.max(roasTarget, 0.1);
    lowRaw = revenue / Math.max(roasComfort, 0.1);
    // ROAS réellement atteint sur l'année, réachats compris.
    effectiveRoas = roasTarget * repeat;
  }

  const budgetReco = roundTo(recoRaw, params.roundReco);
  // Les bornes se déduisent du chiffre AFFICHÉ, pas de la valeur brute : le
  // visiteur peut refaire le calcul de tête (800 / 1.25 = 640, 800 x 1.25 = 1000).
  let budgetLow = roundTo(
    input.activity === "leadgen" ? budgetReco / band : lowRaw,
    input.activity === "leadgen" ? params.roundBand : params.roundReco,
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
  const orders = positive(input.orders, 1);
  const costPerOrderLow = input.activity === "ecommerce" ? budgetLow / orders : 0;
  const costPerOrderHigh = input.activity === "ecommerce" ? budgetHigh / orders : 0;

  // Rentabilité : facultative côté leads, elle ne s'applique que si le visiteur
  // a renseigné la valeur d'un client.
  const clientValue = positive(input.clientValue);
  const hasValue = clientValue > 0;
  const marge = positive(input.marge, params.fallbackMarge);
  const ltv = input.recurring
    ? clientValue * positive(input.purchasesPerYear, 1) * positive(input.loyaltyYears, 1)
    : clientValue;
  const reference = ltv * marge;
  const firstMargin = clientValue * marge;

  // Sans réachat, cela revient exactement au seuil de marge d'avant (15 %).
  const lowMargin =
    input.activity === "ecommerce" && roasBreakEven > 100 / params.margeFloorPct;

  let status: CalcStatus = "ok";
  if (lowMargin) status = "lowMargin";
  else if (floorHit) status = "floor";
  else if (input.activity === "leadgen" && hasValue && reference > 0 && cpaLow > reference)
    status = "unprofitable";

  const tier = status === "ok" ? tierForBudget(budgetReco) : null;
  // Ce que coûte une unité acquise : un client en leads, une commande en e-commerce.
  const units = input.activity === "leadgen" ? clients : orders;
  const unitCost = units > 0 ? budgetReco / units : 0;
  const fee = tier?.priceValue ?? 0;
  const unitCostAllIn = units > 0 && tier ? (budgetReco + fee) / units : 0;
  // Chiffre d'affaires attendu : clients x valeur en leads, déjà connu en e-commerce.
  const grossRevenue = input.activity === "leadgen" ? clients * clientValue : revenue;
  const roi = grossRevenue > 0 && budgetReco + fee > 0 ? grossRevenue / (budgetReco + fee) : 0;
  const tierMax = tier?.budgetRange.max ?? null;
  const tierOverflow = tierMax !== null && budgetHigh > tierMax ? tierMax : null;

  const tight = status === "ok" && input.activity === "leadgen" && hasValue && reference > 0;
  const warning = tight && cpaHigh > params.warnRatio * reference;
  // La LTV ne change pas le budget : elle change la lecture de la rentabilité.
  const doubleReading =
    tight && input.recurring && !warning && cpaHigh > params.warnRatio * firstMargin;

  return {
    activity: input.activity,
    budgetReco,
    budgetLow,
    budgetHigh,
    status,
    warning,
    doubleReading,
    tier,
    tierOverflow,
    cpaSectorMin: sector.cpaMin,
    cpaSectorMax: sector.cpaMax,
    cpaModelMin: roundTo(cpaModelMin, params.cpaRoundTo),
    cpaModelMax: roundTo(cpaModelMax, params.cpaRoundTo),
    cpaLow,
    cpaHigh,
    unitCost,
    unitCostAllIn,
    fee,
    grossRevenue,
    roi,
    ltv,
    reference,
    firstMargin,
    hasValue,
    roasBreakEven,
    roasTarget,
    roasComfort,
    revenue,
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
  return String(round1(Number.isFinite(n) ? n : 0));
}

export function fmtPct(n: number): string {
  return `${Math.round(n * 1000) / 10}%`;
}

export type ResultCopy = {
  /**
   * Cadrage affiché AVANT le budget : en leads, ce que coûte un client dans le
   * secteur ; en e-commerce, le ROAS que la marge exige. Masqué en mode expert
   * côté leads, où le bloc chiffré donne la projection exacte.
   */
  anchor: string;
  /** Ligne de fourchette, sous le chiffre recommandé. */
  band: string;
  /** Ligne de source, sous le résultat : d'où viennent les chiffres. */
  source: string;
  /* Bloc chiffré, mode expert uniquement. Chaîne vide = ligne masquée. */
  costLabel: string;
  costValue: string;
  costAllIn: string;
  revenueValue: string;
  roiValue: string;
  /** Lecture de la marge (leads, seulement si la valeur client est renseignée). */
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
  // Cadrage avant le montant : il donne l'ordre de grandeur du marché avant que
  // le budget tombe. Côté leads c'est la fourchette de coût par client du
  // secteur, côté e-commerce le seuil de ROAS que la marge impose.
  const anchor =
    r.activity === "ecommerce"
      ? input.roasOverride > 0
        ? `Vous exigez un ROAS d'au moins ${fmtDec(r.roasTarget)}. Votre marge, elle, impose ${fmtDec(r.roasBreakEven)} pour rentrer dans vos frais.`
        : `Pour être rentables, vos campagnes devront atteindre un ROAS d'au moins ${fmtDec(r.roasBreakEven)}. Le budget ci-dessous est calculé sur ce seuil, sans présumer qu'elles feront mieux.`
      : `Dans votre secteur, un nouveau client coûte typiquement ${fmt(r.cpaSectorMin)} à ${fmt(r.cpaSectorMax)} CHF via Google Ads.`;

  const band =
    r.activity === "leadgen"
      ? `Fourchette réaliste : ${fmt(r.budgetLow)} à ${fmt(r.budgetHigh)} CHF/mois`
      : `Dès ${fmt(r.budgetLow)} CHF si vos campagnes atteignent un ROAS de ${fmtDec(r.roasComfort)}`;

  const source =
    "Basé sur l'analyse de plus de 5 000 mots-clés en Suisse romande et les comptes que nous gérons.";

  /* ── Bloc chiffré du mode expert ── */
  const chiffrable = r.status === "ok";
  const unite = r.activity === "leadgen" ? "nouveau client" : "commande";
  const costLabel = chiffrable ? `Coût par ${unite}` : "";
  // En e-commerce le budget recommandé EST le plafond : la borne haute vaut le
  // chiffre lui-même, d'où un « dès » plutôt qu'une fourchette qui se répète.
  const costValue = !chiffrable
    ? ""
    : r.activity === "leadgen"
      ? `${fmt(r.unitCost)} CHF (${fmt(r.cpaLow)} à ${fmt(r.cpaHigh)})`
      : `${fmt(r.unitCost)} CHF (dès ${fmt(r.costPerOrderLow)})`;
  const costAllIn =
    chiffrable && r.unitCostAllIn > 0
      ? `${r.tier?.priceIsFrom ? "Dès " : ""}${fmt(r.unitCostAllIn)} CHF tout compris, gestion Flash Ads incluse.`
      : "";

  const revenueValue =
    chiffrable && r.grossRevenue > 0 ? `${fmt(r.grossRevenue)} CHF/mois` : "";
  const roiValue =
    chiffrable && r.roi > 0 ? `${fmtDec(r.roi)} CHF pour 1 CHF investi` : "";

  const margeLine =
    r.activity === "leadgen"
      ? r.hasValue
        ? `Sur une marge de ${fmtPct(input.marge)}, un client vous laisse ${fmt(r.firstMargin)} CHF.`
        : ""
      : input.repeatRate > 0
        ? `Avec ${fmt(input.repeatRate * 100)}% de réachat, une première commande en génère ${fmtDec(1 + input.repeatRate)} au total : le ROAS exigé sur l'acquisition tombe de ${fmtDec(100 / positive(input.margePct, params.defaultMargePct))} à ${fmtDec(r.roasBreakEven)}.`
        : "";

  let message = "";
  let tone: ResultCopy["tone"] = "none";

  if (r.status === "lowMargin") {
    message = `Avec cette marge, vos campagnes devraient dépasser un ROAS de ${fmtDec(r.roasBreakEven)} pour être rentables. C'est rarement atteignable en acquisition pure. Google Ads ne sera probablement rentable pour vous que si vos clients rachètent (fidélisation) ou si votre marge augmente.`;
    tone = "stop";
  } else if (r.status === "floor") {
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
    r.status === "ok"
      ? `Budget recommandé : ${fmt(r.budgetReco)} CHF par mois. ${band}.${r.tier ? ` Pack ${r.tier.name}.` : ""}`
      : message;

  return {
    anchor,
    band,
    source,
    costLabel,
    costValue,
    costAllIn,
    revenueValue,
    roiValue,
    margeLine,
    message,
    tone,
    packLine,
    packOverflow,
    live,
  };
}

/** Coût par client recalculé en direct (mode expert), avec le benchmark secteur. */
export function cpaLine(r: CalcResult): string {
  return `Coût par client avec ces hypothèses : ${fmt(r.cpaModelMin)} à ${fmt(r.cpaModelMax)} CHF (benchmark du secteur : ${fmt(r.cpaSectorMin)} à ${fmt(r.cpaSectorMax)} CHF).`;
}

/** Récapitulatif des hypothèses utilisées (bloc « Comment ce calcul fonctionne »). */
export function assumptionsCopy(input: CalcInput, r: CalcResult): string {
  if (input.activity === "ecommerce") {
    const extra =
      input.repeatRate > 0
        ? ` Un réachat de ${fmt(input.repeatRate * 100)}% signifie qu'une acquisition rapporte ${fmtDec(1 + input.repeatRate)} fois sa première commande sur l'année : le ROAS exigé sur la campagne baisse d'autant, et le ROAS réellement atteint sur douze mois remonte à ${fmtDec(r.effectiveRoas)}.`
        : "";
    const source =
      input.roasOverride > 0
        ? `ROAS minimum imposé en mode expert (${fmtDec(r.roasTarget)}), à la place des ${fmtDec(r.roasBreakEven)} que votre marge impose.`
        : `Une marge brute de ${fmt(input.margePct)}% impose un ROAS d'équilibre de ${fmtDec(r.roasBreakEven)}.`;
    return `${fmt(input.orders)} commandes à ${fmt(input.basket)} CHF de panier moyen représentent ${fmt(r.revenue)} CHF de ventes par mois. ${source} Le budget recommandé est ce chiffre d'affaires divisé par ce seuil : c'est le plafond à engager, puisque dépenser davantage ferait passer votre retour en dessous. Nous ne partons donc pas du principe que vos campagnes surperformeront. Si elles atteignent ${fmtDec(r.roasComfort)}, soit ${Math.round((params.roasCushion - 1) * 100)}% de mieux, le même chiffre d'affaires ne vous coûtera que ${fmt(r.budgetLow)} CHF.${extra}`;
  }
  const s = getSector(input.sector);
  const geoTxt = input.urban
    ? `majoration de ${Math.round((params.geoUrban - 1) * 100)}% pour les grandes agglomérations`
    : "pas de majoration géographique";
  return `Secteur ${s.label} : les clics y coûtent de ${fmtDec(input.cpcMin)} à ${fmtDec(input.cpcMax)} CHF. Avec un taux de conversion du site de ${fmtPct(input.conv)} et un taux de closing de ${fmtPct(input.closing)}, il faut donc compter ${fmt(r.cpaModelMin)} à ${fmt(r.cpaModelMax)} CHF pour décrocher un client. Ce coût est multiplié par vos ${fmt(input.clients)} clients visés, par un facteur de sécurité de ${fmtDec(input.safety)} (les premières semaines coûtent plus cher), et ${geoTxt}. La fourchette affichée est de plus ou moins ${Math.round((params.bandFactor - 1) * 100)}% autour du budget recommandé.`;
}
