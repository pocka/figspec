import { describe, expect, it } from "vitest";
import {
  roundTo,
  nextPowerOfTwo,
  previousPowerOfTwo,
  MAX_ZOOM,
  MIN_ZOOM,
} from "./math";

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

describe("nextPowerOfTwo", () => {
  it("Should return the next power of two, clamped within min and max zoom", () => {
    expect(nextPowerOfTwo(MIN_ZOOM)).toBe(2 ** -5);
    expect(nextPowerOfTwo(2 ** -5.1)).toBe(2 ** -5);

    expect(nextPowerOfTwo(2 ** -5)).toBe(2 ** -4);
    expect(nextPowerOfTwo(2 ** -4.1)).toBe(2 ** -4);

    expect(nextPowerOfTwo(2 ** -4)).toBe(2 ** -3);
    expect(nextPowerOfTwo(2 ** -3.1)).toBe(2 ** -3);

    expect(nextPowerOfTwo(2 ** -3)).toBe(2 ** -2);
    expect(nextPowerOfTwo(2 ** -2.1)).toBe(2 ** -2);

    expect(nextPowerOfTwo(2 ** -2)).toBe(2 ** -1);
    expect(nextPowerOfTwo(2 ** -1.1)).toBe(2 ** -1);

    expect(nextPowerOfTwo(2 ** -1)).toBe(1);
    expect(nextPowerOfTwo(2 ** -0.1)).toBe(1);

    expect(nextPowerOfTwo(1)).toBe(2);
    expect(nextPowerOfTwo(1.1)).toBe(2);

    expect(nextPowerOfTwo(2)).toBe(4);
    expect(nextPowerOfTwo(3)).toBe(4);

    expect(nextPowerOfTwo(4)).toBe(8);
    expect(nextPowerOfTwo(5)).toBe(8);

    expect(nextPowerOfTwo(8)).toBe(16);
    expect(nextPowerOfTwo(9)).toBe(16);

    expect(nextPowerOfTwo(16)).toBe(32);
    expect(nextPowerOfTwo(17)).toBe(32);

    expect(nextPowerOfTwo(32)).toBe(64);
    expect(nextPowerOfTwo(33)).toBe(64);

    expect(nextPowerOfTwo(64)).toBe(128);
    expect(nextPowerOfTwo(65)).toBe(128);

    expect(nextPowerOfTwo(128)).toBe(256);
    expect(nextPowerOfTwo(129)).toBe(256);

    expect(nextPowerOfTwo(MAX_ZOOM)).toBe(MAX_ZOOM);
  });

  it("Should return max zoom if input is greater than max zoom", () => {
    expect(nextPowerOfTwo(MAX_ZOOM + 1)).toBe(MAX_ZOOM);
  });

  it("Should return min zoom if input is less than min zoom", () => {
    expect(nextPowerOfTwo(MIN_ZOOM - 1)).toBe(MIN_ZOOM);
  });
});

describe("previousPowerOfTwo", () => {
  it("Should return the previous power of two, clamped within min and max zoom", () => {
    expect(previousPowerOfTwo(MAX_ZOOM)).toBe(128);
    expect(previousPowerOfTwo(255)).toBe(128);

    expect(previousPowerOfTwo(128)).toBe(64);
    expect(previousPowerOfTwo(127)).toBe(64);

    expect(previousPowerOfTwo(64)).toBe(32);
    expect(previousPowerOfTwo(63)).toBe(32);

    expect(previousPowerOfTwo(32)).toBe(16);
    expect(previousPowerOfTwo(31)).toBe(16);

    expect(previousPowerOfTwo(16)).toBe(8);
    expect(previousPowerOfTwo(15)).toBe(8);

    expect(previousPowerOfTwo(8)).toBe(4);
    expect(previousPowerOfTwo(7)).toBe(4);

    expect(previousPowerOfTwo(4)).toBe(2);
    expect(previousPowerOfTwo(3)).toBe(2);

    expect(previousPowerOfTwo(2)).toBe(1);
    expect(previousPowerOfTwo(1.9)).toBe(1);

    expect(previousPowerOfTwo(1)).toBe(2 ** -1);
    expect(previousPowerOfTwo(0.9)).toBe(2 ** -1);

    expect(previousPowerOfTwo(2 ** -1)).toBe(2 ** -2);
    expect(previousPowerOfTwo(2 ** -1.1)).toBe(2 ** -2);

    expect(previousPowerOfTwo(2 ** -2)).toBe(2 ** -3);
    expect(previousPowerOfTwo(2 ** -2.1)).toBe(2 ** -3);

    expect(previousPowerOfTwo(2 ** -3)).toBe(2 ** -4);
    expect(previousPowerOfTwo(2 ** -3.1)).toBe(2 ** -4);

    expect(previousPowerOfTwo(2 ** -4)).toBe(2 ** -5);
    expect(previousPowerOfTwo(2 ** -4.1)).toBe(2 ** -5);

    expect(previousPowerOfTwo(2 ** -5)).toBe(2 ** -6);
    expect(previousPowerOfTwo(2 ** -5.1)).toBe(2 ** -6);

    expect(previousPowerOfTwo(MIN_ZOOM)).toBe(MIN_ZOOM);
  });

  it("Should return max zoom if input is greater than max zoom", () => {
    expect(previousPowerOfTwo(MAX_ZOOM + 1)).toBe(MAX_ZOOM);
  });

  it("Should return min zoom if input is less than min zoom", () => {
    expect(previousPowerOfTwo(MIN_ZOOM - 1)).toBe(MIN_ZOOM);
  });
});
