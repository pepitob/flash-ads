import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Content Collections (Astro Content Layer API).
 * - blog : articles SEO/GEO (Markdown/MDX).
 * - casClients : études de cas réutilisables (réservé ; à utiliser quand des
 *   données réelles seront fournies). Les cas sont intégrés aux pages services.
 */

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/[^_]*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string().default("Google Ads"),
    /** Réponse directe (GEO) affichée en intro. */
    answer: z.string().optional(),
    /** Auteur nommé (byline + Person dans le schema Article - fort signal E-E-A-T).
     *  À renseigner avec un nom réel dès que les associés sont nommés (cf. /agence). */
    author: z.string().optional(),
    /** Maillage interne : page service liée. */
    relatedService: z.string().optional(),
    draft: z.boolean().default(false),
    image: z.string().optional(),
  }),
});

const casClients = defineCollection({
  loader: glob({ base: "./src/content/cas-clients", pattern: "**/[^_]*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    sector: z.string(),
    location: z.string(),
    metric: z.string(),
    metricLabel: z.string(),
    context: z.string(),
    action: z.string(),
    result: z.string(),
    service: z.string().default("google-ads"),
    pubDate: z.coerce.date(),
  }),
});

export const collections = { blog, casClients };
