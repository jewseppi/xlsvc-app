/**
 * Unit tests for apiBase so both DEV and production URL branches are covered.
 */
import { describe, it, expect } from "vitest";
import { getApiBase, API_BASE } from "../../src/apiBase";

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
});
