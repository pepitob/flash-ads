// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Production URL — used for canonical tags, sitemap, OG and schema absolute URLs.
  site: 'https://flashads.ch',

  // i18n-ready: French only at launch. Adding EN/DE later = extend `locales`
  // and move pages under `src/pages/[lang]/` without refactoring components,
  // since all copy lives in `src/i18n/`.
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    mdx(),
    // Exclut du sitemap les pages en noindex (légales placeholder) : un sitemap
    // ne doit lister que des URLs indexables.
    sitemap({
      filter: (page) =>
        !page.includes('/mentions-legales') && !page.includes('/confidentialite'),
    }),
  ],
});
