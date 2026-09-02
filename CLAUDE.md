# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

Site vitrine statique de **Flash Ads** (https://flashads.ch), agence de gestion Google Ads
pour PME en Suisse romande. **Astro 6** (SSG) + **Tailwind CSS 4**, TypeScript. Français
uniquement (i18n-ready). Le `README.md` est une présentation brève de l'entreprise : toute
la doc technique vit ici.

## Commandes

```sh
npm install          # dépendances
cp .env.example .env # endpoints de formulaire (voir §Formulaires)
npm run dev       # serveur local http://localhost:4321
npm run build     # build statique dans ./dist/ (inclut génération du sitemap)
npm run preview   # prévisualise le build
npx astro check   # vérification TypeScript / diagnostics Astro (pas de suite de tests)
```

Node ≥ 22.12 requis. Pas de linter ni de tests configurés ; la validation se fait via
`astro check` + inspection du HTML généré dans `dist/`.

## Architecture : le "big picture"

Comprendre ces flux transversaux avant d'éditer :

- **SEO centralisé** : aucune page ne pose de balise `<head>` en dur. Chaque page définit
  `const title`/`description` (+ `path`, `jsonLd`, `noindex`, `type`) et les passe à
  `BaseLayout` → `src/components/seo/SEOHead.astro`, **seul propriétaire** des title/meta/
  canonical/OG/Twitter/JSON-LD. Pour un nouveau tag de tête, modifier `SEOHead.astro`, pas les pages.
- **JSON-LD** : helpers dans `src/lib/schema.ts` (Organization/Service/FAQPage/Article/
  Breadcrumb). `BaseLayout` injecte `organizationSchema()` **globalement** ; les pages ajoutent
  leurs schémas via la prop `jsonLd`. Le composant `FAQ.astro` émet **lui-même** son `FAQPage`
  (ne pas le dupliquer dans `jsonLd`).
- **Sources de données uniques** (`src/data/`) : `site.ts` (identité, coordonnées, nav →
  alimente footer + meta + Organization schema), `tarifs.ts` (**seul** endroit pour les prix,
  répercuté home + page Google Ads), `temoignages.ts` (preuves/logos). Éditer la donnée, pas les pages.
- **Content Collections** (`src/content.config.ts`, schémas Zod) : `blog/` (articles MD/MDX,
  schema Article + dates auto) et `cas-clients/` (réservée ; les cas sont actuellement inline
  via `<CaseStudyCard>` dans les pages services).
- **i18n** : `astro.config.mjs` déclare la locale `fr` seule ; chaînes d'UI dans `src/i18n/fr.ts`.
  Pour ajouter EN/DE : étendre `locales`, créer `src/i18n/en.ts`, déplacer les pages sous
  `src/pages/[lang]/`. Aucun refactor des composants nécessaire.
- **Logos clients** : fichiers sources normalisés une fois pour toutes dans `public/logos/`
  (WebP niveaux de gris, boîte commune 240x72 exportée en 2x, ~190 Ko au total). Le composant
  `LogoMarquee.astro` en fait un bandeau défilant 100 % CSS (piste dupliquée, translateX -50 %,
  pause au survol et au focus, désactivé sous `prefers-reduced-motion`). Le fond blanc des
  fichiers est neutralisé à l'affichage par `mix-blend-mode: multiply` : ne pas détourer les
  blancs, cela percerait les blancs intérieurs des logos. Ajouter un logo = déposer le WebP
  traité et compléter `clientLogos` dans `src/data/temoignages.ts`.
- **Formulaires** : devis (`/contact`) via **Netlify Forms**, liste d'attente via Formspree.
- **Calculateur de budget** (`/calculateur-budget`) : un seul moteur pur, `src/lib/calculator.ts`,
  appelé au build (rendu statique de l'état par défaut : SEO, pas de layout shift, résultat lisible
  sans JS) puis repris par l'îlot client de `src/components/calculator/BudgetCalculator.astro`.
  Données éditables sans toucher au code : `src/data/calculator/cpc.json` (18 secteurs, CPC min/max,
  Keyword Planner 08/2026 croisé avec des comptes réels : ne jamais modifier ces valeurs) et
  `src/data/calculator/defaults.json` (conversion, closing, **marge par secteur**, facteurs,
  plancher). Règles produit à ne pas casser : un chiffre recommandé unique calculé sur le CPC
  central du secteur (moyenne géométrique), une fourchette resserrée à plus ou moins 25 % autour,
  un budget recommandé **jamais sous le plancher de 500.-** (en dessous : message, aucun pack), et
  un pack dérivé du seul chiffre recommandé via `tierForBudget()` dans `tarifs.ts` (`budgetRange`
  par pack), jamais d'une grille dupliquée, pour qu'il reste toujours aligné sur le montant affiché.
  La rentabilité se compare à la **marge** du client (`valeur x marge`), pas à son chiffre
  d'affaires. Les 18 marges de `defaults.json` sont des estimations à valider. Le composant accepte `variant="compact"` pour être posé dans une section d'une
  page existante. Mode expert : `?pro=1` ou le bouton en bas (outil de vente, non indexé via le
  canonique sans paramètre).

## Conventions non négociables

- **Design system verrouillé** (Flash Ads Design System, fondations dans
  `src/styles/global.css` ; re-synchronisation via le skill `/design-sync`) : accent uni
  **Flash Blue `#2563FF`** ; **rose `#FF2E8B`** réservé aux eyebrows, coches, badge « Le plus
  choisi » et point « en direct » ; gradient signature bleu→rose (vertical sur l'éclair,
  horizontal sur mots et chiffres) **sans jamais s'attarder dans le violet** (look
  « IA/crypto » à éviter). Typo Space Grotesk (titres, labels, boutons) + Inter (corps),
  **pas de monospace**. Sections sombres : midnight `#0d1020` avec lueur rose. Cartes 16px,
  boutons 8px.
- **Contenu publié** : les prix (`pricingValidated`), les **avis Google** et les **logos clients**
  (`src/data/temoignages.ts` + `public/logos/`) sont réels. Les **chiffres de la section
  Résultats** (home + page Publicité Google) sont en revanche des ordres de grandeur
  d'illustration décidés par l'agence, à remplacer par des mesures réelles dès qu'elles sont
  disponibles : ce sont des allégations publicitaires (LCD art. 3). Ne jamais inventer d'avis
  client ni de prix. Plus aucun marqueur `⚠️ PLACEHOLDER` ne doit apparaître sur le site.
- **Cohérence des prix** : `src/data/tarifs.ts` est la seule source (répercutée home, page
  Google Ads, `/pricing.txt`, JSON-LD), mais si un montant change il change **partout** :
  grille, FAQ home + Google Ads, formulaire de contact, CGV, `llms.txt`, article de blog
  budget, et `budgetRange` de chaque pack (consommé par le calculateur).
  Prix validés (`pricingValidated: true`, brief pricing 2026-08). Un `stripeLink`
  vide = le CTA du pack renvoie vers `/contact?pack=<id>` (pré-sélection du budget).
- **Ton** : langage simple, sans jargon marketing, sur les pages principales. Le conserver.
- **Jamais d'em-dash (le caractère « — »)** : interdit partout, sans exception : contenus des
  pages, FAQ, meta descriptions, données (`src/data/`), `llms.txt`, articles de blog, CGV,
  commentaires de code et docs. Reformuler avec un deux-points, une virgule, un point ou des
  parenthèses (tiret simple `-` toléré dans les commentaires de code).

## SEO / GEO : ciblage des mots-clés

Un mot-clé principal **par page**, séparés **par intention** pour éviter la cannibalisation
(la home cible « l'agence », la page service cible « le service »). Volumes = Google Keyword
Planner (juil. 2026) :

| Page | Mot-clé principal | Vol. · concurrence |
|---|---|---|
| `/services/chatgpt-ads` | **chatgpt ads** (priorité #1, drapeau early-mover) | 40/mo · faible · +400 %/an |
| `/services/google-ads` | **gestion google ads** | 20/mo · faible |
| `/` (accueil) | **agence google ads** + « Suisse romande » | 10/mo (+ cluster « publicité google » 20/mo) |
| `/calculateur-budget` | **calculateur budget google ads** (+ « budget google ads suisse ») | non chiffré · intention outil |
| `/services/tracking-analytics` | *suivi de conversion* (déprioritisé) | non chiffré |

Règles à ne pas casser en éditant le contenu :

- La home **ne cible pas** « chatgpt ads » dans son `title`/H1 (seulement thème + ancre de lien) →
  la page dédiée reste seule à ranker dessus.
- Ne **jamais** viser « google ads » seul (5400/mo) : navigationnel, sans intention d'achat.
- Ancres de liens internes = **descriptives** (le mot-clé cible), pas « En savoir plus ».
- Pages légales placeholder : `noindex` + exclues du sitemap (`filter` dans `astro.config.mjs`).
- Contenu déjà orienté GEO/AEO : composant `<AnswerBlock>` (réponse directe en tête), champ
  `answer` des articles, dates de mise à jour visibles (`<time>`), `public/llms.txt`, FAQ schema.
  Conserver ces signaux et mettre `llms.txt` à jour au fil du contenu.

Actions en attente avant d'investir davantage : (1) re-pull Keyword Planner en ciblage
Suisse + français avec des seeds géo (genève/lausanne/valais), l'export initial était en EUR
sans mots-clés géo ; (2) pull des volumes tracking/GA4/Tag Manager pour trancher la page
tracking ; (3) SEO local par ville (pages `/geneve`, `/lausanne`) = phase 2 éventuelle.

## Formulaires

**Devis (`/contact`) : Netlify Forms.** `QuoteForm.astro` porte `data-netlify="true"` et
`name="devis"` ; Netlify analyse le HTML **statique** en fin de build et y détecte le formulaire,
donc rien à configurer côté code. Deux prérequis côté interface Netlify : activer
« Forms > Enable form detection » **avant** le déploiement, et vérifier que la détection reste
active après chaque modification du formulaire. L'envoi est en AJAX (message de succès en ligne,
sans redirection), ce qui impose trois choses à ne pas casser : poster sur un chemin du site
(`action="/"`), un corps `application/x-www-form-urlencoded` construit avec `URLSearchParams`, et
le champ caché `form-name` qui route la soumission. Anti-spam : honeypot Netlify
(`netlify-honeypot="bot-field"`).

**Liste d'attente (`/services/chatgpt-ads`) : Formspree**, via `PUBLIC_FORMSPREE_WAITLIST_ID`
dans `.env`. ID vide = le formulaire affiche un avertissement et n'envoie rien.

## Déploiement

Build 100 % statique. **Cible : Netlify**, puisque le formulaire de devis dépend de Netlify Forms
(`netlify.toml` fixe la commande de build, le dossier `dist/` et Node 22.12). Un autre hébergeur
resterait possible, mais il faudrait rebrancher ce formulaire. Définir l'URL de production dans
`astro.config.mjs` (`site`) et la variable `PUBLIC_FORMSPREE_WAITLIST_ID`.

## À finaliser avant publication

- [ ] Coller les **liens de paiement Stripe** par pack (`stripeLink` dans `src/data/tarifs.ts`).
- [ ] Remplacer les **chiffres de la section Résultats** (home + page Publicité Google) par des
      mesures réelles : ce sont aujourd'hui des ordres de grandeur d'illustration.
- [ ] Compléter les **bios des associés** (`src/pages/agence.astro`).
- [ ] Compléter **mentions légales** et **politique de confidentialité** (IDE, hébergeur, juriste).
- [ ] Renseigner le **numéro de téléphone** réel (`src/data/site.ts`).
- [ ] Activer **Forms > Enable form detection** sur le site Netlify, puis envoyer une
      soumission de test depuis `/contact` pour vérifier qu'elle arrive bien.
- [ ] Configurer l'**endpoint Formspree** de la liste d'attente (`.env`).
- [ ] Exporter une **OG image PNG 1200×630** (compatibilité LinkedIn/X) et remplacer le défaut
      `public/og-default.svg` dans `src/components/seo/SEOHead.astro`.

Le **badge Google Partner** est déjà intégré et réel (ID `9907170973`, `src/data/site.ts`),
affiché footer + heros via `src/components/GooglePartnerBadge.astro`.
