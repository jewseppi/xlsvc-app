/**
 * Unit tests for getApiErrorMessage so both branches (server error vs fallback) are covered.
 */
import { describe, it, expect } from "vitest";
import { getApiErrorMessage } from "../../../src/utils/getApiErrorMessage";

describe("getApiErrorMessage", () => {
  it("returns fallback when err is undefined", () => {
    expect(getApiErrorMessage(undefined, "Failed")).toBe("Failed");
  });

  it("returns fallback when err is {}", () => {
    expect(getApiErrorMessage({}, "Failed")).toBe("Failed");
  });

  it("returns fallback when err.response is missing", () => {
    expect(getApiErrorMessage({ message: "x" }, "Failed")).toBe("Failed");
  });

  it("returns fallback when err.response.data.error is missing", () => {
    expect(getApiErrorMessage({ response: { data: {} } }, "Failed to load user details")).toBe(
      "Failed to load user details"
    );
  });

  it("returns server error when err.response.data.error is set", () => {
    expect(
      getApiErrorMessage({ response: { data: { error: "User not found" } } }, "Failed")
    ).toBe("User not found");
  });

  it("returns fallback when error is empty string", () => {
    expect(
      getApiErrorMessage({ response: { data: { error: "" } } }, "Failed to delete user")
    ).toBe("Failed to delete user");
  });
});
