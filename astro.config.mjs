import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://tintinwinata.com",
  integrations: [react()],
  output: "static",
});
