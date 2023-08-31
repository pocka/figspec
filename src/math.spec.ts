import { describe, expect, it } from "vitest";

import { roundTo } from "./math";

describe("roundTo", () => {
  it("Should round to int without `at` parameter", () => {
    expect(roundTo(1.23456789)).toBe(1);
    expect(roundTo(9.87654321)).toBe(10);
  });

  it("Should round to specified decimal", () => {
    expect(roundTo(1.23456789, 2)).toBe(1.23);
    expect(roundTo(9.87654321, 2)).toBe(9.88);
  });
});
