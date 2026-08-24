# Flash Ads : site

Site vitrine de **Flash Ads**, agence de gestion Google Ads pour PME en Suisse romande.
Construit avec **Astro 6** (SSG) + **Tailwind CSS 4**. Orienté conversion, SEO et GEO.

---

## 🚀 Démarrage

```sh
npm install          # installe les dépendances
cp .env.example .env # configure les endpoints de formulaire (voir plus bas)
npm run dev          # serveur local sur http://localhost:4321
npm run build        # build statique dans ./dist/
npm run preview      # prévisualise le build
```

Node ≥ 22.12 requis.

---

## 🧱 Architecture

```
src/
├── components/        Composants réutilisables (Hero, PricingGrid, FAQ, formulaires…)
│   └── seo/           SEOHead (title/meta/OG/JSON-LD)
├── layouts/           BaseLayout (header, footer, schema Organization global)
├── lib/schema.ts      Helpers JSON-LD (Organization, Service, FAQPage, Article, Breadcrumb)
├── data/
│   ├── site.ts        Identité de l'entreprise + navigation (source unique)
│   └── tarifs.ts      ⚠️ Paliers tarifaires : SEULE source à modifier pour les prix
├── i18n/fr.ts         Chaînes d'interface partagées (i18n-ready)
├── content/
│   ├── blog/          Articles (Markdown/MDX)
│   └── cas-clients/   Études de cas (collection réservée)
├── content.config.ts  Schémas des Content Collections (Zod)
├── styles/global.css  Tokens de design (Flash Ads Design System) + styles composants
└── pages/             Routes (sitemap du brief)
public/
├── robots.txt · llms.txt · og-default.svg · favicon.svg · logo.png
```

## 🎨 Design

Le design applique le **Flash Ads Design System** (source :
`claude.ai/design/p/5fc4440c-…`). Fondations dans `src/styles/global.css` :

- **Couleurs** : accent uni = **Flash Blue `#2563FF`**. **Rose `#FF2E8B`** pour les
  eyebrows, les coches, le badge « Le plus choisi » et le point « en direct ».
- **Gradient signature** : bleu → rose (vertical sur l'éclair, horizontal sur les mots
  et chiffres). **Ne jamais s'attarder dans le violet** (look « IA/crypto » à éviter).
- **Typo** : Space Grotesk (titres, labels, boutons) + Inter (corps). **Pas de monospace.**
- **Sections sombres** : midnight `#0d1020` avec une lueur rose. Cartes 16px, boutons 8px.

Pour re-synchroniser depuis le design system, utiliser le skill `/design-sync`.

---

## ✍️ Tâches courantes

### Ajouter un article de blog

Créez un fichier `src/content/blog/mon-article.md` :

```markdown
---
title: "Titre de l'article"
description: "Méta-description (≈ 150-160 caractères)."
pubDate: 2026-06-16
updatedDate: 2026-06-20          # optionnel
category: "Budget & coûts"        # optionnel
answer: "Réponse directe en 2-3 phrases (GEO). Le HTML simple (<b>) est autorisé."
relatedService: "/services/google-ads"  # maillage interne, optionnel
draft: false                      # true = non publié
---

## Mon premier titre

Le contenu de l'article en **Markdown**…
```

L'article apparaît automatiquement sur `/blog` et à l'URL `/blog/mon-article`.
Le schema `Article` et les dates sont générés automatiquement.

### Ajouter / modifier un cas client

Deux options :

1. **Inline (actuel)** : les cas sont écrits directement dans les pages services via
   le composant `<CaseStudyCard>` (voir `src/pages/services/google-ads.astro`).
   Remplacez les cas marqués `⚠️ PLACEHOLDER` par des données **réelles** (anonymisées).
2. **Collection** : un fichier par cas dans `src/content/cas-clients/` (schéma dans
   `content.config.ts`) si vous voulez les centraliser. À brancher sur les pages au besoin.

> ⚠️ N'utilisez jamais de faux chiffres ni de faux témoignages (brief §13).

### Modifier les tarifs

Tout se passe dans **`src/data/tarifs.ts`**, un seul endroit, répercuté sur la home,
la page Google Ads, `/pricing.txt` et le JSON-LD :

- `tiers[]` : 4 packs (Starter 390.-, Croissance 590.-, Performance 1190.-, Sur mesure
  dès 1490.-) : prix, tranche de budget pub, lignes d'attributs (canaux, langues,
  campagnes spéciales, reporting, CRM, support, point de contact, engagement), CTA.
- `addOns[]` : setup tracking (obligatoire, 300.-), setup Shopping, landing page,
  connexion CRM (+200.-/mois), langue supplémentaire (+100.-/mois).
- `pricingNotes` : mentions obligatoires sous la grille (budget payé à Google + TVA).
- `specialCampaignsNote` / `budgetFloorNote` : note « campagnes spéciales » et plancher
  de 500 CHF/mois de budget pub (réutilisé par le formulaire de contact et les FAQ).
- `pricingValidated` : `true` (prix réels et publics, brief pricing 2026-08).

> ✅ Prix validés. Règle de cohérence : si un montant change, il change **partout**
> (grille, FAQ home + Google Ads, formulaire, CGV, `llms.txt`, article de blog budget).

### Modifier l'identité / les coordonnées

`src/data/site.ts` (nom, e-mail, téléphone, ville, réseaux). Alimente le footer, les
balises meta et le schema Organization.

---

## 📨 Formulaires (Formspree)

Les formulaires (devis + liste d'attente) sont **host-agnostiques** : ils postent vers
[Formspree](https://formspree.io) via des variables d'environnement.

1. Créez deux formulaires sur Formspree.
2. Renseignez leurs IDs dans `.env` :

```
PUBLIC_FORMSPREE_QUOTE_ID=xxxxxxx       # /contact
PUBLIC_FORMSPREE_WAITLIST_ID=yyyyyyy    # /services/chatgpt-ads
```

Tant qu'un ID est vide, le formulaire affiche un avertissement et n'envoie rien.
Pour changer de prestataire plus tard, il suffit d'adapter `action` dans
`QuoteForm.astro` / `WaitlistForm.astro`. Anti-spam : honeypot (`_gotcha`).

---

## 🔍 SEO / GEO

- **Sitemap** : généré automatiquement (`/sitemap-index.xml`) via `@astrojs/sitemap`.
- **robots.txt** et **llms.txt** : dans `public/` (mettre à jour `llms.txt` au fil du contenu).
- **Schema.org** : Organization (global), Service, FAQPage, Article, BreadcrumbList, via `src/lib/schema.ts`.
- **Blocs de réponse directe** : composant `<AnswerBlock>` en tête des pages services et articles.
- **Open Graph** : `public/og-default.svg`. ⚠️ Pour une compatibilité maximale (LinkedIn/X),
  exporter une version **PNG 1200×630** et changer le défaut dans `src/components/seo/SEOHead.astro`.

### 🎯 Stratégie de mots-clés (1 mot-clé principal par page)

Un mot-clé principal **par page**, séparés **par intention** pour éviter la cannibalisation
(la home cible « l'agence », la page service cible « le service »). Volumes = Google Keyword
Planner (juil. 2026).

| Page | Mot-clé principal | Vol. · concurrence |
|---|---|---|
| `/services/chatgpt-ads` | **chatgpt ads** (priorité #1) | 40/mo · faible · +400 %/an |
| `/services/google-ads` | **gestion google ads** | 20/mo · faible |
| `/` (accueil) | **agence google ads** + « Suisse romande » | 10/mo (+ cluster « publicité google » 20/mo) |
| `/services/tracking-analytics` | *suivi de conversion* (déprioritisé) | non chiffré |

**Règles à respecter en éditant le contenu :**

- La home **ne doit PAS** viser « chatgpt ads » dans son `title`/H1 : elle le mentionne
  seulement en thème + ancre de lien vers la page dédiée (sinon cannibalisation).
- Ne **jamais** viser « google ads » seul (5400/mo) : navigationnel, sans intention d'achat.
- Ancres de liens internes = **descriptives** (le mot-clé cible), pas « En savoir plus ».
- Pages légales *placeholder* : `noindex` + exclues du sitemap (`filter` dans `astro.config.mjs`).

**Actions en attente** avant d'investir davantage :

1. Re-pull Keyword Planner en **ciblage Suisse + français** avec des seeds géo
   (genève/lausanne/valais) : l'export initial était en EUR sans mots-clés géo.
2. Pull des volumes tracking/GA4/Tag Manager pour trancher la page tracking.
3. SEO local par ville (pages `/geneve`, `/lausanne`) = phase 2 éventuelle.

---

## 🌍 i18n

Le site est **français uniquement** au lancement, mais prêt pour l'i18n :
`astro.config.mjs` déclare la locale `fr`, les chaînes d'interface sont dans `src/i18n/`.
Pour ajouter EN/DE : étendre `locales`, créer `src/i18n/en.ts`, déplacer les pages sous
`src/pages/[lang]/`. Aucun refactor des composants nécessaire.

---

## 🚢 Déploiement

Build 100 % statique → déployable sur Netlify, Vercel ou Cloudflare Pages.
Build command : `npm run build` · dossier de sortie : `dist/`.
Définir l'URL de production dans `astro.config.mjs` (`site`) et les variables `PUBLIC_FORMSPREE_*`.

---

## ✅ À finaliser avant publication

- [x] Confirmer les **prix réels** (`src/data/tarifs.ts`, `pricingValidated` à `true`, brief pricing 2026-08).
- [ ] Coller les **liens de paiement Stripe** par pack (`stripeLink` dans `src/data/tarifs.ts`).
      Vide = le CTA « Choisir [pack] » renvoie vers `/contact?pack=<id>` (pré-sélection du budget).
- [x] Remplacer les **témoignages** (`src/data/temoignages.ts`, `proofPlaceholder` à `false`) :
      avis Google réels. Restent placeholders : **logos clients** et chiffres marqués.
- [ ] Remplacer les **résultats clients** `⚠️ PLACEHOLDER` (home + page Publicité Google).
- [ ] Compléter les **bios des associés** (`src/pages/agence.astro`).
- [ ] Compléter **mentions légales** et **politique de confidentialité** (IDE, hébergeur, juriste).
- [ ] Renseigner le **numéro de téléphone** réel (`src/data/site.ts`).
- [ ] Configurer les **endpoints Formspree** (`.env`).
- [ ] Exporter une **OG image PNG** 1200×630.

> **Badge Google Partner** : déjà intégré et réel (ID `9907170973`, `src/data/site.ts`),
> affiché dans le footer + heros. Composant : `src/components/GooglePartnerBadge.astro`.

> **Vocabulaire** : les pages principales (accueil, Publicité Google, mesure, agence) sont
> écrites en langage simple, sans jargon marketing. Garder ce ton si vous éditez le contenu.
