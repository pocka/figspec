import { describe, expect, it } from "vitest";

import { isTransparent } from "./colors";

describe("#isTransparent", () => {
  it("Should return `true` for transparent black", () => {
    expect(isTransparent({ r: 0, g: 0, b: 0, a: 0 })).toBe(true);
  });

  it("Should return `false` for non-transparent black", () => {
    expect(isTransparent({ r: 0, g: 0, b: 0, a: 0.5 })).toBe(false);
  });

  it("Should return `false` for transparent white", () => {
    expect(isTransparent({ r: 1, g: 1, b: 1, a: 0 })).toBe(false);
  });
});
