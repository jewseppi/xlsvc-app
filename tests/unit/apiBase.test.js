/**
 * Unit tests for apiBase so both DEV and production URL branches are covered.
 */
import { describe, it, expect, vi } from "vitest";
import { getApiBase, API_BASE, PREVIEW_MODE } from "../../src/apiBase";
import axios from "axios";

describe("apiBase", () => {
  it("returns dev URL when env.DEV is true", () => {
    expect(getApiBase({ DEV: true })).toBe("http://127.0.0.1:5000/api");
  });

  it("returns production URL when env.DEV is false", () => {
    expect(getApiBase({ DEV: false })).toBe(
      "https://api.xlsvc.jsilverman.ca/api"
    );
  });

  it("uses import.meta.env by default", () => {
    // In Vitest, import.meta.env.DEV is typically true
    expect(getApiBase()).toBe(API_BASE);
    expect(API_BASE).toMatch(/^https?:\/\//);
  });

  it("PREVIEW_MODE is false when VITE_PREVIEW_MODE is not set", () => {
    expect(PREVIEW_MODE).toBe(false);
  });

  it("sets axios header when VITE_PREVIEW_MODE is true", async () => {
    // Dynamically re-import with env override to cover the preview branch
    vi.stubEnv("VITE_PREVIEW_MODE", "true");
    // Clear module cache so the module re-evaluates with new env
    vi.resetModules();
    const mod = await import("../../src/apiBase.js");
    expect(mod.PREVIEW_MODE).toBe(true);
    expect(axios.defaults.headers.common["X-Preview-Mode"]).toBe("true");
    // Cleanup
    delete axios.defaults.headers.common["X-Preview-Mode"];
    vi.unstubAllEnvs();
  });
});
