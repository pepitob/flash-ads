/* ──────────────────────────────────────────────────────────────
   ChatGPT Ads : contenus partagés par la page service
   (`/services/chatgpt-ads`) et la landing page (`/lp/publicite-chatgpt`).

   Les prix vivent dans `tarifs.ts`, les secteurs dans `chatgpt-secteurs.ts`.
   Ici : libellés d'action, comparatif, étapes du test et FAQ. Une seule
   source, pour que les deux pages restent alignées quand l'offre change.
   ────────────────────────────────────────────────────────────── */
import { chatgptAds } from "./tarifs";
import type { FaqItem } from "../lib/schema";

/** Ouverture du canal en Suisse. Source : annonce OpenAI (lien dans la frise). */
export const launch = {
  iso: "2026-08-24",
  label: "24 août 2026",
  source: "https://openai.com/index/chatgpt-ads-expands-across-europe/",
};

/** Documentation annonceurs d'OpenAI : format, ciblage, enchères, mesure. */
export const openaiDocs = "https://help.openai.com/en/articles/20001207-ads-in-chatgpt-the-basics";

/**
 * Libellés d'action. Le bouton annonce ce que le visiteur veut faire (tester
 * le canal), l'envoi du formulaire annonce la première étape concrète (l'audit).
 */
export const cta = {
  label: "Tester ChatGPT Ads",
  submit: "Demander mon audit gratuit",
  note: "Audit gratuit de 15 minutes : secteur, budget et suivi. Sans engagement.",
};

/** Icône par statut : la couleur seule ne suffit pas à distinguer les cartes. */
export const statusIcon = {
  ouvert: '<circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.5 2.5 4.5-5" />',
  validation: '<circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" />',
  impossible: '<circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" />',
  autre: '<circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 114 2c-1 .6-1.5 1.1-1.5 2.2M12 17h.01" />',
};

export type CgptFaqItem = FaqItem & { id: string };

export const comparison = [
  { k: "Ce qui déclenche l'annonce", g: "Les mots-clés tapés dans Google", c: "Le contexte de la conversation" },
  { k: "Le moment", g: "La personne cherche un prestataire", c: "La personne décrit son projet, compare, demande conseil" },
  { k: "Volume en Suisse", g: "Élevé et stable", c: "En croissance, encore limité" },
  { k: "Mesure des résultats", g: "Très complète", c: "De base : impressions, clics, conversions via le pixel OpenAI" },
  { k: "Budget minimum chez Flash Ads", g: "500 CHF/mois", c: `${chatgptAds.minBudgetDaily} CHF/jour, environ ${chatgptAds.minBudgetMonthly} CHF/mois` },
  { k: "Notre conseil", g: "Le canal principal pour la plupart des PME", c: "Un test en complément, pas un remplacement" },
];

export const testSteps = [
  { t: "Premier échange gratuit (15 min).", d: "On vérifie votre secteur, votre budget et votre suivi actuel. Si ChatGPT n'est pas pour vous, on vous le dit." },
  { t: "Mise en place (1 à 2 semaines).", d: "Compte annonceur, validation par OpenAI, pixel de suivi, première campagne." },
  { t: "Diffusion et ajustements (semaines 3 à 8).", d: "On laisse le système apprendre et on coupe ce qui ne rapporte pas." },
  { t: "Bilan.", d: "On décide ensemble de continuer, d'ajuster ou d'arrêter, selon un critère fixé avec vous avant le lancement." },
];

/**
 * FAQ ChatGPT Ads, source unique : la page service affiche tout (et émet le
 * JSON-LD FAQPage depuis ces mêmes items), la landing page en filtre une partie
 * par identifiant via `faqById`. Corriger une réponse ici corrige les deux pages.
 */
export const faqItems: CgptFaqItem[] = [
  {
    id: "disponible",
    question: "La publicité ChatGPT est-elle disponible en Suisse ?",
    answer:
      "Oui, depuis le 24 août 2026. OpenAI a ouvert ChatGPT Ads à l'Europe, Suisse comprise. La régie s'appelle Ads Manager et reste officiellement en bêta : le canal fonctionne, mais il évolue encore et ses performances ne sont pas stabilisées.",
  },
  {
    id: "definition",
    question: "Qu'est-ce que la publicité ChatGPT (ChatGPT Ads) ?",
    answer:
      "Ce sont des annonces sponsorisées affichées sous certaines réponses de ChatGPT, clairement labellisées comme publicités. Elles n'influencent pas le contenu des réponses générées par l'IA. Le format a été lancé en test aux États-Unis le 9 février 2026, puis ouvert en self-service aux entreprises américaines le 5 mai 2026, avant l'Europe en août 2026.",
  },
  {
    id: "audience",
    question: "Qui voit ces annonces ?",
    answer:
      "Les utilisateurs adultes des formules Free et Go de ChatGPT. Les abonnés Plus, Pro, Business et Enterprise n'en voient pas, ni les moins de 18 ans.",
  },
  {
    id: "secteur",
    question: "Mon secteur peut-il diffuser ?",
    answer:
      "La plupart des secteurs le peuvent : habitat, artisanat, services aux entreprises, formation, tourisme, e-commerce. La santé est possible après validation par OpenAI. Les services juridiques, financiers et immobiliers ne le sont pas en Suisse aujourd'hui. On vérifie votre cas lors du premier échange.",
  },
  {
    id: "format",
    question: "À quoi ressemble une annonce ?",
    answer:
      "Elle apparaît sous la réponse de ChatGPT et comprend le nom de l'annonceur, son favicon, un titre, un texte de description, une image et un lien vers votre site. Le bloc est identifié comme sponsorisé et séparé visuellement de la réponse. On est proche d'une annonce Search enrichie d'un visuel.",
  },
  {
    id: "ciblage",
    question: "Comment cible-t-on ses annonces ?",
    answer:
      "Pas avec des mots-clés en correspondance exacte, contrairement à Google Ads. Vous fournissez au niveau du groupe d'annonces des indices de contexte : les sujets, thèmes ou mots-clés pour lesquels votre offre est pertinente. Le système s'appuie ensuite sur l'intention de la conversation en cours, sur votre page de destination et sur vos textes pour décider s'il affiche l'annonce. Ces indices orientent la diffusion, ils ne la garantissent pas. C'est un changement de métier réel : on ne pilote plus une liste de mots-clés, on décrit un contexte.",
  },
  {
    id: "cout-clic",
    question: "Combien coûte un clic sur ChatGPT Ads ?",
    answer:
      "OpenAI recommande de démarrer avec une enchère maximale de 3 à 5 dollars par clic. C'est un plafond, pas le prix payé : les enchères fonctionnent au second prix pondéré par la pertinence, donc le coût réel est souvent inférieur. Trois objectifs existent, chacun avec sa facturation : la visibilité, payée aux mille affichages, les clics, payés au clic, et les conversions, optimisées vers une action sur votre site. Ces repères viennent du lancement et bougeront avec la concurrence.",
  },
  {
    id: "prix",
    question: "Combien ça coûte chez Flash Ads ?",
    answer:
      `Deux montants distincts, comme pour Google Ads. D'abord votre budget publicitaire, versé directement à OpenAI : ${chatgptAds.minBudgetDaily} CHF par jour au minimum, soit environ ${chatgptAds.minBudgetMonthly} CHF par mois. Ensuite nos frais de gestion : ${chatgptAds.price} par mois au tarif de lancement, plus ${chatgptAds.setup} de setup une seule fois. Ces deux tarifs sont réduits de moitié jusqu'au ${chatgptAds.promoEndsLabel} ; à partir du 1er janvier 2027, la gestion passe à ${chatgptAds.regularPrice} par mois et le setup à ${chatgptAds.regularSetup}.`,
  },
  {
    id: "budget-minimum",
    question: "Pourquoi un budget minimum de 20 CHF par jour ?",
    answer:
      "Faisons le calcul ensemble : avec une enchère de l'ordre de 3 à 5 dollars par clic, 20 CHF par jour achètent quelques clics quotidiens seulement. C'est le strict minimum pour accumuler assez de données en un mois et commencer à optimiser. En dessous, vous paieriez des frais de gestion pour un résultat purement aléatoire. C'est la même logique que notre plancher de 500.- par mois sur Google Ads.",
  },
  {
    id: "resultats",
    question: "Quels résultats puis-je attendre ?",
    answer:
      "Nous ne promettons aucun chiffre, et méfiez-vous de qui le ferait. La régie est en bêta, les volumes, les coûts par clic et les taux de conversion ne sont pas stabilisés, et personne ne dispose encore d'historique sur le marché suisse. Ce que nous garantissons, c'est le travail et la transparence : vous voyez ce qui est dépensé, ce que ça rapporte, et nous vous disons franchement si le canal ne fonctionne pas pour vous.",
  },
  {
    id: "delai",
    question: "Combien de temps avant de juger les résultats ?",
    answer:
      "Comptez 1 à 2 semaines de mise en place, puis au moins 6 semaines de diffusion. Avant, les chiffres ne permettent pas de conclure.",
  },
  {
    id: "mesure",
    question: "Peut-on mesurer les résultats ?",
    answer:
      "Oui. L'Ads Manager remonte les impressions, les clics, la dépense, le taux de clic, le coût par clic et par mille impressions, ainsi que les conversions. Nous ajoutons à la main des paramètres UTM à vos liens (les paramètres dynamiques ne sont pas encore pris en charge par OpenAI) : ils sont conservés au clic, donc le trafic ChatGPT apparaît aussi dans votre Google Analytics, à côté de vos autres canaux. Une réserve honnête : les impressions et les clics remontent en quelques minutes, la dépense met plus longtemps, un montant à zéro ne veut donc pas dire qu'il n'y a pas eu de frais.",
  },
  {
    id: "conversations",
    question: "Avez-vous accès aux conversations des utilisateurs ?",
    answer:
      "Non, ni nous ni vous. OpenAI ne transmet que des chiffres globaux (impressions, clics, dépenses) et les conversions mesurées sur votre site.",
  },
  {
    id: "recommandation",
    question: "Si je paie, ChatGPT va-t-il me recommander dans ses réponses ?",
    answer:
      "Non. L'annonce s'affiche à part, sous la réponse, et n'a aucun effet sur ce que ChatGPT répond. Être cité dans les réponses relève du référencement naturel, un autre métier que le nôtre.",
  },
  {
    id: "brand-safety",
    question: "Mes annonces peuvent-elles apparaître à côté de n'importe quelle conversation ?",
    answer:
      "Non. OpenAI applique une politique de brand safety : les annonces ne sont pas censées apparaître dans des contextes sensibles ou inappropriés, selon des règles publiées dans ses Ads Policies. Comme sur tout réseau publicitaire, c'est un dispositif de garde-fous, pas une garantie absolue.",
  },
  {
    id: "autonome",
    question: "Puis-je le faire moi-même ?",
    answer:
      "Oui, le compte est en libre-service. Ce qui demande du temps et de la méthode, c'est le suivi des conversions, la rédaction des contextes de diffusion et la décision d'ajuster ou d'arrêter au bon moment.",
  },
  {
    id: "remplace-google",
    question: "Est-ce que ça remplace Google Ads ?",
    answer:
      "Non, c'est un canal complémentaire. Google Ads reste le volume principal pour une PME romande. ChatGPT Ads capte un autre moment : celui où quelqu'un pose une question à une IA plutôt que de taper une recherche. Les deux se gèrent séparément, et vous pouvez tout à fait commencer par l'un.",
  },
  {
    id: "maintenant",
    question: "Pourquoi lancer maintenant ?",
    answer:
      "Parce que le tarif de lancement court jusqu'au 31 décembre 2026, et parce qu'un canal se maîtrise en le pratiquant. Mais on ne vous recommandera pas de lancer si votre secteur, votre budget ou votre suivi ne le permettent pas.",
  },
];

/** Sélection ordonnée de questions, par identifiant (erreur au build si l'un manque). */
export function faqById(ids: string[]): CgptFaqItem[] {
  return ids.map((id) => {
    const item = faqItems.find((f) => f.id === id);
    if (!item) throw new Error(`FAQ ChatGPT Ads : identifiant inconnu « ${id} »`);
    return item;
  });
}
