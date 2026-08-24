/**
 * Chaînes d'interface partagées (chrome) - i18n-ready.
 *
 * Au lancement : français uniquement. Pour ajouter EN/DE plus tard :
 * créer `src/i18n/en.ts` avec les mêmes clés, router via `src/pages/[lang]/`.
 * La prose de contenu des pages vit dans les pages elles-mêmes (sera dupliquée
 * par locale) ; ce fichier ne contient que les libellés réutilisés partout.
 */
export const ui = {
  locale: "fr",
  cta: {
    quote: "Demander un audit gratuit",
    quoteShort: "Audit gratuit",
    talkExpert: "En discuter avec nous",
    seeResults: "Voir nos résultats",
    seePricing: "Voir nos prix",
    learnMore: "En savoir plus",
    discoverAgency: "Découvrir l'agence",
    joinWaitlist: "Rejoindre la liste d'attente",
  },
  nav: {
    skipToContent: "Aller au contenu",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
  },
  footer: {
    tagline:
      "Agence Google Ads pour PME en Suisse romande. Transparente, abordable, orientée résultats.",
    agency: "Agence",
    services: "Services",
    contact: "Contact",
    rights: "Tous droits réservés.",
  },
  form: {
    name: "Nom",
    company: "Entreprise",
    email: "E-mail",
    phone: "Téléphone",
    website: "Site web actuel",
    budget: "Budget publicitaire mensuel envisagé",
    message: "Votre message",
    submit: "Envoyer ma demande",
    submitWaitlist: "M'inscrire sur la liste",
    required: "Champ requis",
    sending: "Envoi…",
    successTitle: "Merci, votre demande est bien partie.",
    successBody:
      "Nous revenons vers vous sous un jour ouvré avec une première lecture de votre situation.",
  },
} as const;
