import { describe, expect, it } from "vitest";
import { roundTo, nextPowerOfTwo, previousPowerOfTwo } from "./math";

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

const options = {
  min: 2 ** -3,
  max: 2 ** 3,
};

describe("nextPowerOfTwo", () => {
  it("Should return the next power of two, clamped within min and max zoom", () => {
    expect(nextPowerOfTwo(options.min, options)).toBe(2 ** -2);
    expect(nextPowerOfTwo(2 ** -2.5, options)).toBe(2 ** -2);

    expect(nextPowerOfTwo(2 ** -2, options)).toBe(2 ** -1);
    expect(nextPowerOfTwo(2 ** -1.5, options)).toBe(2 ** -1);

    expect(nextPowerOfTwo(2 ** -1, options)).toBe(1);
    expect(nextPowerOfTwo(2 ** -0.5, options)).toBe(1);

    expect(nextPowerOfTwo(1, options)).toBe(2);
    expect(nextPowerOfTwo(1.5, options)).toBe(2);

    expect(nextPowerOfTwo(2, options)).toBe(4);
    expect(nextPowerOfTwo(3, options)).toBe(4);

    expect(nextPowerOfTwo(4, options)).toBe(8);
    expect(nextPowerOfTwo(5, options)).toBe(8);

    expect(nextPowerOfTwo(options.max, options)).toBe(options.max);
  });

  it("Should return max zoom if input is greater than max zoom", () => {
    expect(nextPowerOfTwo(options.max + 1, options)).toBe(options.max);
  });

  it("Should return min zoom if input is less than min zoom", () => {
    expect(nextPowerOfTwo(options.min - 1, options)).toBe(options.min);
  });
});

describe("previousPowerOfTwo", () => {
  it("Should return the previous power of two, clamped within min and max zoom", () => {
    expect(previousPowerOfTwo(options.max, options)).toBe(4);
    expect(previousPowerOfTwo(7, options)).toBe(4);

    expect(previousPowerOfTwo(4, options)).toBe(2);
    expect(previousPowerOfTwo(3, options)).toBe(2);

    expect(previousPowerOfTwo(2, options)).toBe(1);
    expect(previousPowerOfTwo(1.5, options)).toBe(1);

    expect(previousPowerOfTwo(1, options)).toBe(2 ** -1);
    expect(previousPowerOfTwo(2 ** -0.5, options)).toBe(2 ** -1);

    expect(previousPowerOfTwo(2 ** -1, options)).toBe(2 ** -2);
    expect(previousPowerOfTwo(2 ** -1.5, options)).toBe(2 ** -2);

    expect(previousPowerOfTwo(2 ** -2, options)).toBe(2 ** -3);
    expect(previousPowerOfTwo(2 ** -2.5, options)).toBe(2 ** -3);

    expect(previousPowerOfTwo(options.min, options)).toBe(options.min);
  });

  it("Should return max zoom if input is greater than max zoom", () => {
    expect(previousPowerOfTwo(options.max + 1, options)).toBe(options.max);
  });

  it("Should return min zoom if input is less than min zoom", () => {
    expect(previousPowerOfTwo(options.min - 1, options)).toBe(options.min);
  });
});
