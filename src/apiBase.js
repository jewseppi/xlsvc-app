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
