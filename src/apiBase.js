import axios from "axios";

/**
 * API base URL for the backend. Uses DEV in tests and dev; production URL in production builds.
 * @param { { DEV?: boolean } } [env] - Optional env object (default: import.meta.env). Lets tests cover both branches.
 */
export function getApiBase(env = import.meta.env) {
  return env.DEV
    ? "http://127.0.0.1:5000/api"
    : "https://api.xlsvc.jsilverman.ca/api";
}

export const API_BASE = getApiBase();

/**
 * Preview mode — Cloudflare Pages preview deploys set VITE_PREVIEW_MODE=true.
 * Sends X-Preview-Mode header so the backend enforces read-only access.
 */
export const PREVIEW_MODE = import.meta.env.VITE_PREVIEW_MODE === "true";

if (PREVIEW_MODE) {
  axios.defaults.headers.common["X-Preview-Mode"] = "true";
}
