// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  // Org/user GitHub Pages site (https://mulesoft-accelerator.github.io) is served
  // from the domain root, so `base` stays '/'. If you ever move this to a PROJECT
  // pages repo served from a subpath, set base: '/<repo-name>/'.
  site: 'https://mulesoft-accelerator.github.io',
  base: '/',

  // 100% static HTML/CSS output. Build lands in ./dist which you copy/commit
  // into the repo root as part of your existing manual deploy workflow.
  output: 'static',

  // Emit clean folder-based URLs (/codelabs/my-lab/index.html) so GitHub Pages
  // serves them without trailing-slash surprises. Matches the claat layout.
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },

  integrations: [
    // Tailwind v3 via the official integration so we can use a real
    // tailwind.config.mjs (darkMode: 'class' + @tailwindcss/typography).
    // applyBaseStyles: false — we control base styles in src/styles/global.css.
    tailwind({ applyBaseStyles: false }),
  ],

  markdown: {
    // Astro's built-in Shiki with dual themes. The `dark` theme's colors are
    // emitted as CSS variables; src/styles/global.css flips to them under `.dark`.
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: true,
    },
  },
});
