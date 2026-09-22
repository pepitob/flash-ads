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
- **Formulaires** : devis (`/contact`) et demande d'accès ChatGPT Ads
  (`/services/chatgpt-ads`), tous deux via **Netlify Forms**. Plus aucune dépendance Formspree.
- **Mesure d'audience** : Google Tag Manager, injecté par `BaseLayout.astro` depuis `site.gtmId`
  (snippet en tête de `<head>`, `noscript` juste après `<body>`). Le `is:inline` est indispensable :
  sans lui Astro en ferait un module différé, ce que GTM ne supporte pas. Le `dataLayer` qu'il crée
  est le même que celui où le site pousse ses événements, exploitables comme déclencheurs dans le
  conteneur sans code supplémentaire : le calculateur émet `calc_start`, `calc_result`,
  `calc_floor_hit`, `calc_low_margin` et `calc_pack_click` ; les formulaires émettent un **unique**
  `form_submit`, le formulaire concerné étant porté par le paramètre `form_name` (`devis` ou
  `chatgpt-ads`, lu sur l'attribut `name` du `<form>`, donc jamais dupliqué). Ne pas repartir sur un
  événement par formulaire : une seule balise de conversion suffit, la condition se met sur le
  paramètre. **Côté GTM, brancher la conversion sur l'événement personnalisé `form_submit`, jamais
  sur le déclencheur « Form Submission » intégré** : celui-ci écoute l'événement natif `submit` et
  se déclenche donc à CHAQUE tentative, y compris celles refusées par la validation et celles dont
  la requête échoue. Notre `form_submit`, lui, n'est poussé qu'après acceptation par Netlify. Les
  deux formulaires posent un verrou (bouton désactivé pendant l'envoi) : un double clic ne produit
  donc ni deux leads ni deux conversions.
- **Calculateur de budget** (`/calculateur-budget`) : un seul moteur pur, `src/lib/calculator.ts`,
  appelé au build (rendu statique de l'état par défaut : SEO, pas de layout shift, résultat lisible
  sans JS) puis repris par l'îlot client de `src/components/calculator/BudgetCalculator.astro`.
  Données éditables sans toucher au code : `src/data/calculator/cpc.json` (18 secteurs, CPC min/max,
  Keyword Planner 08/2026 croisé avec des comptes réels : ne jamais modifier ces valeurs) et
  `src/data/calculator/defaults.json` (conversion, closing, **marge par secteur**, facteurs,
  plancher, paramètres e-commerce). **Le mode simple n'expose aucune hypothèse** : côté leads,
  conversion et closing sont absorbés dans un coût par client dérivé (`cpc / (conv x closing)`,
  arrondi à 5, calculé dans `sectors` et jamais saisi en dur) ; côté e-commerce, le ROAS est
  déduit de la marge brute (`100 / marge`) et non plus demandé. Le mode
  expert réexpose et laisse éditer toute la chaîne, plus la zone géographique, et affiche le coût
  par client recalculé en direct à côté du benchmark sectoriel. **Hiérarchie de la carte de
  résultat** : le calculateur public ne montre QUE le budget, sa fourchette, une ligne de source et
  le pack. Tout le chiffré (coût par client ou par commande, coût tout compris frais de gestion
  inclus, chiffre d'affaires généré, retour sur investissement) vit dans le bloc `[data-when=
  "expert-only"]` : un seul chiffre à retenir côté prospect. Ne jamais réintroduire deux fois la
  même notion (l'ancien ancrage sectoriel doublonnait le coût par client et semait la confusion).
  Le budget affiché reste toujours le **seul budget publicitaire**, jamais frais de gestion inclus.
  **La zone géographique agit sur le CPC**, pas sur le budget : `zoneCpc()` majore les coûts par
  clic, qui sont donc réécrits dans les champs experts quand on change de zone. Aucun
  multiplicateur caché dans la formule. Règles produit à ne pas casser : un chiffre recommandé
  unique calculé sur le coût par client central du secteur (moyenne géométrique), une
  fourchette resserrée à plus ou moins 25 % autour,
  un budget recommandé **jamais sous le plancher de 500.-** (en dessous : message, aucun pack), et
  un pack dérivé du seul chiffre recommandé via `tierForBudget()` dans `tarifs.ts` (`budgetRange`
  par pack), jamais d'une grille dupliquée, pour qu'il reste toujours aligné sur le montant affiché.
  Le contrôle de rentabilité est **réservé au mode expert** : il repose sur la valeur d'un client,
  que le mode simple ne demande pas (deux questions, pas une de plus). Quand il s'applique, il se
  compare à la **marge** du client (`valeur x marge`), jamais à son chiffre d'affaires, et reste
  facultatif : aucun message tant que la valeur n'est pas renseignée. En e-commerce, une marge
  sous 15 % coupe la recommandation de pack. **Sens du coussin de rentabilité** : le budget
  e-commerce se calcule sur le SEUIL d'équilibre, jamais sur un objectif plus ambitieux. Viser un
  meilleur ROAS ferait *baisser* le budget, donc sous-provisionnerait la campagne en pariant sur sa
  performance. Le chiffre affiché est le plafond à engager (dépenser plus ferait passer le retour
  sous le seuil), et le coussin de 30 % sert à l'autre bout, pour chiffrer ce que coûterait une
  campagne qui surperforme. Le **taux de réachat** (mode expert) agit sur le
  calcul, pas seulement sur le texte : un client qui rachète rapportant au-delà de sa première
  commande, il abaisse le ROAS exigé sur l'acquisition (`100 / marge / (1 + réachat)`) et relève
  donc le budget engageable. C'est aussi lui qui peut lever le garde-fou de marge faible, exactement
  l'échappatoire que le message de ce garde-fou désigne. Le ROAS du mode expert se recale sur la
  valeur déduite dès qu'on touche à la marge ou au réachat. Les 18 marges de `defaults.json` sont des estimations à valider. Le composant accepte `variant="compact"` pour être posé dans une section d'une
  page existante. Mode expert : `?pro=1` ou le bouton en bas (outil de vente, non indexé via le
  canonique sans paramètre).

## Animations d'apparition

`.reveal` + IntersectionObserver (`BaseLayout.astro`) fait apparaître les blocs au défilement.
**Le contenu est visible par défaut** : la règle qui le masque est portée par `.js .reveal`, et la
classe `js` est posée sur `<html>` par un script `is:inline` en tête de `<head>`. Ne jamais
remettre `opacity: 0` directement sur `.reveal` : sans cette garde, un script bloqué, en erreur ou
désactivé laissait les 38 blocs de la home invisibles, donc une page blanche. Le seuil de
l'observateur est bas (`0.05`) parce qu'un bloc plus haut que l'écran d'un téléphone n'atteint
jamais un seuil élevé.

## Conventions non négociables

- **Design system verrouillé** (Flash Ads Design System, fondations dans
  `src/styles/global.css` ; re-synchronisation via le skill `/design-sync`) : accent uni
  **Flash Blue `#2563FF`** ; **rose `#FF2E8B`** réservé aux eyebrows, coches, badge « Le plus
  choisi » et point « en direct », et **ne porte jamais de texte blanc** (ratio 3,5:1 : son
  texte est `--fa-navy`). Typo Space Grotesk (titres, labels, boutons) + Inter (corps),
  **pas de monospace**. **Aucun dégradé dans le système** : le gradient bleu→rose ne subsiste
  que dans le `<linearGradient>` interne au SVG du logo (`Brand.astro`). Ne jamais réintroduire
  un `linear-gradient` sur un texte, un fond, un filet ou une bordure. **Aucune ombre** non
  plus, sauf sous le header collant (`--shadow-header`) : la séparation se fait par une bordure
  1px `--rule`. **Tous les rayons à 4px**, seule la pilule (`--radius-pill`) fait exception.
- **Rythme par bandes de section** : la page alterne des fonds (`.band` +
  `.band--paper` / `--tint` / `--night`) au lieu d'être une nappe blanche.
  **Trois surfaces, pas une de plus** : `paper` (blanc, surface par défaut),
  `tint` (`#eef3ff`, une section sur deux) et `night` (midnight, réservé à la
  clôture de page : CTA final + pied de page, qui forment un seul bloc sombre).
  **Le bleu plein reste une couleur d'accent** (boutons, liens, chiffres) et
  n'est jamais un fond de section : une page qui alterne blanc, bleu clair, bleu
  vif et noir ressemble à quatre sites collés bout à bout. `.band` porte le
  rythme vertical, le modificateur porte la couleur : un bloc interne peut donc
  prendre un modificateur seul. Chaque bande expose ses couleurs en variables
  (`--on`, `--on-strong`, `--on-faint`, `--muted-on`, `--accent-on`,
  `--eyebrow-on`, `--rule`, `--surface-on`) et **les composants lisent ces
  variables**, jamais un littéral ni un token brut :
  `color: var(--muted-on, var(--muted))`. Le repli garde le rendu identique hors
  bande (header). Un îlot clair posé sur une bande sombre prend `.surface-paper`,
  qui redéclare ces variables pour lui-même. Sur midnight : texte blanc ou
  `--fa-slate-light`, accent `--fa-blue-light`, jamais `--fa-blue`.
  Règle d'assemblage d'une page : hero en `tint`, puis alternance stricte
  `paper` / `tint`, FAQ (`<FAQ band="paper|tint">`, `tint` par défaut) réglée
  pour que l'alternance reste juste, puis CTA et pied de page en `night`. Jamais
  deux bandes identiques qui se suivent, sauf le CTA et le pied de page.
- **Pas d'animation d'apparition au scroll** : ce sont les bandes qui structurent la page.
  Seules subsistent les micro-transitions de survol (200 ms au plus).
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
- **ChatGPT Ads** : offre séparée (`chatgptAds` dans `tarifs.ts`), un seul pack tout compris, sans
  rapport avec la grille Google Ads qui se choisit sur le budget. Le tarif de lancement est une
  **remise à durée limitée** : 240.-/mois et 150.- de setup jusqu'au 31.12.2026, puis 480.-/mois et
  300.- de setup. Ce doublement doit rester écrit noir sur blanc partout où l'offre est présentée
  (page, `/pricing.txt`, `llms.txt`), sinon l'offre devient déloyale. Deux mentions obligatoires,
  `chatgptPromoNote` et `chatgptBetaNote` : le canal est récent, **aucun résultat n'est garanti** et
  aucun chiffre de performance ne doit être promis.
- **Ton** : langage simple, sans jargon marketing, sur les pages principales. Le conserver.
  Le lecteur est **toujours vouvoyé**, y compris dans les aides du calculateur : ne jamais le
  désigner à la troisième personne (« le client », « le prospect »), même dans le mode expert qui
  sert d'outil de vente. Le mot « client » n'y désigne que les clients du lecteur.
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
| `/services/chatgpt-ads` | **chatgpt ads** (priorité #1, page de destination des annonces payantes) | 40/mo · faible · +400 %/an |
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

**Demande d'accès ChatGPT Ads (`/services/chatgpt-ads`) : Netlify Forms** également,
`name="chatgpt-ads"` (`EarlyBirdForm.astro`). Mêmes contraintes que ci-dessus. Les deux formulaires
doivent apparaître dans « Forms » côté Netlify après le déploiement.

**Si des soumissions n'arrivent plus.** La détection ne tourne qu'au moment du build : toute
modification d'un formulaire (champ renommé, nouveau formulaire, balise changée) exige un
**redéploiement**, sinon Netlify continue d'accepter l'ancienne définition et ignore la nouvelle.
Deux cas se distinguent sans outil :

- le visiteur voit le **message d'erreur** : Netlify n'a pas reconnu le formulaire. La console
  affiche `[Flash Ads] Envoi du formulaire refusé : 404`. Vérifier « Forms > Form detection »,
  la réactiver, puis **redéployer**.
- le visiteur voit la **confirmation** mais rien n'apparaît dans « Verified submissions » :
  la soumission est partie et Netlify l'a acceptée. Regarder l'onglet **Spam**, Akismet filtre
  agressivement les envois de test (adresses du type `test@test.com`, textes sans phrases réelles,
  envois répétés depuis la même IP).

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
- [ ] Mettre en place le **bandeau de consentement** avant la mise en ligne : Google Tag Manager
      (`site.gtmId`) est chargé sur toutes les pages, la politique de confidentialité l'annonce et
      renvoie à ce bandeau. Vider `gtmId` désactive tout le chargement.
- [ ] Renseigner le **numéro de téléphone** réel (`src/data/site.ts`).
- [ ] Activer **Forms > Enable form detection** sur le site Netlify, puis envoyer une
      soumission de test depuis `/contact` pour vérifier qu'elle arrive bien.
- [ ] Exporter une **OG image PNG 1200×630** (compatibilité LinkedIn/X) et remplacer le défaut
      `public/og-default.svg` dans `src/components/seo/SEOHead.astro`.

Le **badge Google Partner** est déjà intégré et réel (ID `9907170973`, `src/data/site.ts`),
affiché footer + heros via `src/components/GooglePartnerBadge.astro`.
