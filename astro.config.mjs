import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// Last substantive edit per route, so Google can prioritise recrawls instead of
// guessing. Update the article entry whenever its content changes; the homepage
// tracks the build itself, since it is generated from portfolio data.
const lastModified = {
  "/article/mongodb-binary-quantization-75m/": "2026-08-23",
};

export default defineConfig({
  site: "https://tintinwinata.com",
  integrations: [
    react(),
    sitemap({
      serialize(item) {
        const { pathname } = new URL(item.url);
        item.lastmod = lastModified[pathname] ?? new Date().toISOString().slice(0, 10);
        return item;
      },
    }),
  ],
  output: "static",
});
