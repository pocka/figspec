import type * as figma from "../../../figma.js";

/**
 * Returns whether the given color is a _transparent black_ (value of the `transparent` keyword).
 *
 * https://www.w3.org/TR/css-color-3/#transparent
 */
export function isTransparent({ r, g, b, a }: figma.Color): boolean {
  return !r && !g && !b && !a;
}

// https://drafts.csswg.org/css-color-4/#predefined-sRGB
function toLinearLight(c: number): number {
  const abs = Math.abs(c);

  return abs < 0.04045
    ? c / 12.92
    : (c < 0 ? -1 : 1) * Math.pow((abs + 0.055) / 1.055, 2.4);
}

// https://drafts.csswg.org/css-color-4/#color-conversion-code
function gammaEncode(c: number): number {
  const abs = Math.abs(c);

  return abs > 0.0031308
    ? (c < 0 ? -1 : 1) * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055)
    : 12.92 * c;
}

type Vec3 = readonly [number, number, number];

export function mmul(a: readonly [Vec3, Vec3, Vec3], b: Vec3): Vec3 {
  return [
    a[0][0] * b[0] + a[0][1] * b[1] + a[0][2] * b[2],
    a[1][0] * b[0] + a[1][1] * b[1] + a[1][2] * b[2],
    a[2][0] * b[0] + a[2][1] * b[1] + a[2][2] * b[2],
  ];
}

// https://drafts.csswg.org/css-color-4/#color-conversion-code
function srgbToXYZ(c: figma.Color): Vec3 {
  const r = toLinearLight(c.r);
  const g = toLinearLight(c.g);
  const b = toLinearLight(c.b);

  return mmul(
    [
      [506752 / 1228815, 87881 / 245763, 12673 / 70218],
      [87098 / 409605, 175762 / 245763, 12673 / 175545],
      [7918 / 409605, 87881 / 737289, 1001167 / 1053270],
    ],
    [r, g, b],
  );
}

// https://drafts.csswg.org/css-color-4/#color-conversion-code
function xyzToDisplayP3(xyz: Vec3): figma.Color {
  const [r, g, b] = mmul(
    [
      [446124 / 178915, -333277 / 357830, -72051 / 178915],
      [-14852 / 17905, 63121 / 35810, 423 / 17905],
      [11844 / 330415, -50337 / 660830, 316169 / 330415],
    ],
    xyz,
  );

  return {
    r: gammaEncode(r),
    g: gammaEncode(g),
    b: gammaEncode(b),
    a: 1,
  };
}

export function srgbToDisplayP3(srgb: figma.Color): figma.Color {
  return {
    ...xyzToDisplayP3(srgbToXYZ(srgb)),
    a: srgb.a,
  };
}
