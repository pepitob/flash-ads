# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

Site vitrine statique de **Flash Ads**, agence de gestion Google Ads pour PME en Suisse
romande. **Astro 6** (SSG) + **Tailwind CSS 4**, TypeScript. Français uniquement (i18n-ready).
Le `README.md` est la doc de référence détaillée (démarrage, formulaires, déploiement,
checklist de publication) : le consulter en complément de ce fichier.

## Commandes

```sh
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
  Extension EN/DE prévue sans refactor des composants (voir README).
- **Formulaires** host-agnostiques : postent vers Formspree via `PUBLIC_FORMSPREE_*` (`.env`).

## Conventions non négociables

- **Design system verrouillé** (voir README §Design et `src/styles/global.css`) : accent
  **Flash Blue `#2563FF`**, rose `#FF2E8B`, gradient signature bleu→rose **sans jamais passer
  par le violet**. Typo Space Grotesk + Inter, **pas de monospace**.
- **Pas de faux contenu** : prix (`pricingValidated`), témoignages/logos (`proofPlaceholder`),
  résultats et cas clients sont des **placeholders** tant qu'ils ne sont pas validés : ne jamais
  publier de faux chiffres ou témoignages. Les zones concernées portent `⚠️ PLACEHOLDER`.
- **Ton** : langage simple, sans jargon marketing, sur les pages principales. Le conserver.
- **Jamais d'em-dash (le caractère « — »)** : interdit partout, sans exception : contenus des
  pages, FAQ, meta descriptions, données (`src/data/`), `llms.txt`, articles de blog, CGV,
  commentaires de code et docs. Reformuler avec un deux-points, une virgule, un point ou des
  parenthèses (tiret simple `-` toléré dans les commentaires de code).

## SEO / GEO : ciblage des mots-clés

Stratégie complète (carte des mots-clés, règles anti-cannibalisation, actions en attente)
dans **README.md §🎯 Stratégie de mots-clés**. Règles clés à ne pas casser :

- Un mot-clé principal **par page**, séparés par intention : home = « agence google ads » +
  « Suisse romande » ; `/services/google-ads` = « gestion google ads » ; `/services/chatgpt-ads`
  = « chatgpt ads » (**priorité #1**, terme en forte croissance, drapeau early-mover).
- La home **ne cible pas** « chatgpt ads » dans son `title`/H1 (seulement thème + ancre de lien) →
  la page dédiée reste seule à ranker dessus.
- Contenu déjà orienté GEO/AEO : composant `<AnswerBlock>` (réponse directe en tête), champ
  `answer` des articles, dates de mise à jour visibles (`<time>`), `public/llms.txt`, FAQ schema.
  Conserver ces signaux et mettre `llms.txt` à jour au fil du contenu.
