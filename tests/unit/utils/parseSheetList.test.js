import { describe, it, expect } from "vitest";
import { parseSheetList } from "@/utils/parseSheetList";

describe("parseSheetList", () => {
  it("returns [] for empty/invalid input", () => {
    expect(parseSheetList("")).toEqual([]);
    expect(parseSheetList(null)).toEqual([]);
    expect(parseSheetList(42)).toEqual([]);
  });

  it("splits, trims, and drops empties", () => {
    expect(parseSheetList("Summary, 3 ,  raw data ")).toEqual(["Summary", "3", "raw data"]);
    expect(parseSheetList(",, ,")).toEqual([]);
  });

  it("de-duplicates case-insensitively, keeping first casing", () => {
    expect(parseSheetList("Sheet1, sheet1, SHEET1, Data")).toEqual(["Sheet1", "Data"]);
  });

  it("keeps numeric index entries as strings", () => {
    expect(parseSheetList("1, 2, Summary")).toEqual(["1", "2", "Summary"]);
  });
});
