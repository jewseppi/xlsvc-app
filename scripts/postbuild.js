/**
 * Moves the Vite build output into a /app/ subdirectory so that
 * Cloudflare Pages serves assets at /app/assets/* matching the
 * base: '/app/' config in vite.config.js.
 *
 * After running:
 *   dist/landing.html      -> served at /
 *   dist/_redirects         -> Cloudflare routing rules
 *   dist/app/index.html     -> served at /app/
 *   dist/app/assets/*       -> served at /app/assets/*
 */
import { mkdirSync, renameSync, existsSync, cpSync } from "fs";
import { join } from "path";

const dist = join(import.meta.dirname, "..", "dist");
const appDir = join(dist, "app");

// Only restructure if base is /app/ (skip if already restructured)
if (existsSync(join(dist, "assets")) && !existsSync(appDir)) {
  mkdirSync(appDir, { recursive: true });
  renameSync(join(dist, "assets"), join(appDir, "assets"));
  cpSync(join(dist, "index.html"), join(appDir, "index.html"));
  console.log("postbuild: moved build output into dist/app/");
} else {
  console.log("postbuild: no restructuring needed");
}
