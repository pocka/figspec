export interface Preferences {
  /**
   * For future changes.
   */
  version: 1;

  /**
   * How many decimal places are shown?
   * NOTE: Some properties uses fixed decimal places.
   */
  decimalPlaces: number;

  viewportZoomSpeed: number;
  viewportPanSpeed: number;

  /**
   * What unit should be used in generated CSS code?
   */
  lengthUnit: "px" | "rem";
  rootFontSizeInPx: number;

  /**
   * How to display a color in generated CSS code?
   */
  cssColorNotation: // #rrggbb / #rrggbbaa
  | "hex"
    // rgb(r g b / a)
    | "rgb"
    // hsl(h s l / a)
    | "hsl"
    // color(srgb r g b / a)
    | "color-srgb"
    // color(display-p3 r g b / a)
    // For showing colors in Display P3 color space, where the Figma file uses Display P3.
    // If a Figma file uses sRGB, colors are stretched to full Display P3 space.
    | "display-p3"
    // color(display-p3 r g b / a)
    // For showing colors in Display P3 color space, where the Figma file uses sRGB.
    // If a Figma file uses Display P3, colors are unnaturally compressed to sRGB space (same as other sRGB notations).
    | "srgb-to-display-p3";

  enableColorPreview: boolean;
}

export const defaultPreferenecs = Object.freeze<Preferences>({
  version: 1,
  decimalPlaces: 2,
  viewportPanSpeed: 500,
  viewportZoomSpeed: 500,
  cssColorNotation: "hex",
  lengthUnit: "px",
  rootFontSizeInPx: 16,
  enableColorPreview: true,
});

export function isEqual(
  a: Readonly<Preferences>,
  b: Readonly<Preferences>,
): boolean {
  if (a.version !== b.version) {
    return false;
  }

  for (const [key, value] of Object.entries(a)) {
    if (b[key as keyof typeof a] !== value) {
      return false;
    }
  }

  return true;
}
