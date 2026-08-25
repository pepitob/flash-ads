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
- **Formulaires** host-agnostiques : postent vers Formspree via `PUBLIC_FORMSPREE_*` (`.env`).

## Conventions non négociables

- **Design system verrouillé** (Flash Ads Design System, fondations dans
  `src/styles/global.css` ; re-synchronisation via le skill `/design-sync`) : accent uni
  **Flash Blue `#2563FF`** ; **rose `#FF2E8B`** réservé aux eyebrows, coches, badge « Le plus
  choisi » et point « en direct » ; gradient signature bleu→rose (vertical sur l'éclair,
  horizontal sur mots et chiffres) **sans jamais s'attarder dans le violet** (look
  « IA/crypto » à éviter). Typo Space Grotesk (titres, labels, boutons) + Inter (corps),
  **pas de monospace**. Sections sombres : midnight `#0d1020` avec lueur rose. Cartes 16px,
  boutons 8px.
- **Pas de faux contenu** : prix (`pricingValidated`), témoignages/logos (`proofPlaceholder`),
  résultats et cas clients sont des **placeholders** tant qu'ils ne sont pas validés : ne jamais
  publier de faux chiffres ou témoignages. Les zones concernées portent `⚠️ PLACEHOLDER`.
- **Cohérence des prix** : `src/data/tarifs.ts` est la seule source (répercutée home, page
  Google Ads, `/pricing.txt`, JSON-LD), mais si un montant change il change **partout** :
  grille, FAQ home + Google Ads, formulaire de contact, CGV, `llms.txt`, article de blog
  budget. Prix validés (`pricingValidated: true`, brief pricing 2026-08). Un `stripeLink`
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

## Formulaires (Formspree)

Devis (`/contact`) + liste d'attente (`/services/chatgpt-ads`). Créer deux formulaires sur
Formspree et renseigner `PUBLIC_FORMSPREE_QUOTE_ID` / `PUBLIC_FORMSPREE_WAITLIST_ID` dans
`.env`. ID vide = le formulaire affiche un avertissement et n'envoie rien. Changer de
prestataire = adapter `action` dans `QuoteForm.astro` / `WaitlistForm.astro`. Anti-spam :
honeypot (`_gotcha`).

## Déploiement

Build 100 % statique : déployable sur Netlify, Vercel ou Cloudflare Pages. Build command
`npm run build`, dossier de sortie `dist/`. Définir l'URL de production dans
`astro.config.mjs` (`site`) et les variables `PUBLIC_FORMSPREE_*`.

## À finaliser avant publication

- [ ] Coller les **liens de paiement Stripe** par pack (`stripeLink` dans `src/data/tarifs.ts`).
- [ ] Remplacer les **résultats clients** `⚠️ PLACEHOLDER` (home + page Publicité Google),
      ainsi que les **logos clients** encore placeholders dans `src/data/temoignages.ts`
      (les avis Google, eux, sont réels : `proofPlaceholder` à `false`).
- [ ] Compléter les **bios des associés** (`src/pages/agence.astro`).
- [ ] Compléter **mentions légales** et **politique de confidentialité** (IDE, hébergeur, juriste).
- [ ] Renseigner le **numéro de téléphone** réel (`src/data/site.ts`).
- [ ] Configurer les **endpoints Formspree** (`.env`).
- [ ] Exporter une **OG image PNG 1200×630** (compatibilité LinkedIn/X) et remplacer le défaut
      `public/og-default.svg` dans `src/components/seo/SEOHead.astro`.

Le **badge Google Partner** est déjà intégré et réel (ID `9907170973`, `src/data/site.ts`),
affiché footer + heros via `src/components/GooglePartnerBadge.astro`.
