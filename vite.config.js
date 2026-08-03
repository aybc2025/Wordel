import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Base is set to the repo name for GitHub Pages project-site hosting
// (https://aybc2025.github.io/Wordel/). Pages paths are case-sensitive, so
// this must match the repo name's casing exactly. Update if the repo is
// renamed or deployed at a domain root (then use "/").
export default defineConfig({
  plugins: [react()],
  base: "/Wordel/",
});
