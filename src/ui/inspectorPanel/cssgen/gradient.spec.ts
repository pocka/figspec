import { describe, expect, it } from "vitest";

import { getLinearGradientAngle, radToDeg } from "./gradient";

describe("radToDeg", () => {
  it("πrad = 180deg", () => {
    expect(radToDeg(Math.PI)).toBeCloseTo(180);
  });

  it("π/2rad = 90deg", () => {
    expect(radToDeg(Math.PI / 2)).toBeCloseTo(90);
  });
});

describe("getLinearGradientAngle", () => {
  it("(0.5,0) to (0.5,1) = 270deg", () => {
    expect(getLinearGradientAngle({ x: 0.5, y: 0 }, { x: 0.5, y: 1 })).toBe(
      270,
    );
  });
});
