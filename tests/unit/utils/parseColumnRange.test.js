import { describe, it, expect } from "vitest";
import { parseColumnRange } from "@/utils/parseColumnRange";

describe("parseColumnRange", () => {
  it("returns [] for empty/invalid input", () => {
    expect(parseColumnRange("")).toEqual([]);
    expect(parseColumnRange(null)).toEqual([]);
    expect(parseColumnRange(undefined)).toEqual([]);
    expect(parseColumnRange(123)).toEqual([]);
  });

  it("expands a simple range", () => {
    expect(parseColumnRange("A-E")).toEqual(["A", "B", "C", "D", "E"]);
  });

  it("parses a comma list", () => {
    expect(parseColumnRange("A,B,C,D")).toEqual(["A", "B", "C", "D"]);
  });

  it("ignores whitespace and casing", () => {
    expect(parseColumnRange("a   - c ,  f")).toEqual(["A", "B", "C", "F"]);
    expect(parseColumnRange("A, B ,C,     D")).toEqual(["A", "B", "C", "D"]);
  });

  it("handles a mix of ranges and singles, de-duplicated in order", () => {
    expect(parseColumnRange("A-C, F, B, H-I")).toEqual(["A", "B", "C", "F", "H", "I"]);
  });

  it("handles reversed ranges", () => {
    expect(parseColumnRange("E-A")).toEqual(["A", "B", "C", "D", "E"]);
  });

  it("handles multi-letter columns", () => {
    expect(parseColumnRange("Z-AB")).toEqual(["Z", "AA", "AB"]);
  });

  it("skips invalid tokens", () => {
    expect(parseColumnRange("A, 3, !!, B")).toEqual(["A", "B"]);
    expect(parseColumnRange("A-3")).toEqual([]); // invalid range bound
    expect(parseColumnRange(",,, ,")).toEqual([]);
  });
});
