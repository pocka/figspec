import * as figma from "../../../figma.js";
import { type Preferences } from "../../../preferences.js";

import { isTransparent, srgbToDisplayP3 } from "./colors.js";
import { CSSStyle, CSSStyleValue, CSSStyleValueTypes } from "./CSSStyle.js";
import { getLinearGradientAngle } from "./gradient.js";
import { serializeValue } from "./serialize.js";

export function fromNode(
  node: figma.Node,
  preferences: Readonly<Preferences>,
): readonly CSSStyle[] {
  let styles: CSSStyle[] = [];

  if (figma.hasBoundingBox(node)) {
    styles.push(
      {
        propertyName: "width",
        value: px(node.absoluteBoundingBox.width, preferences),
      },
      {
        propertyName: "height",
        value: px(node.absoluteBoundingBox.height, preferences),
      },
    );
  }

  if (figma.hasPadding(node)) {
    styles.push({
      propertyName: "padding",
      value: padding(
        node.paddingTop,
        node.paddingRight,
        node.paddingBottom,
        node.paddingLeft,
        preferences,
      ),
    });
  } else if (figma.hasLegacyPadding(node)) {
    styles.push({
      propertyName: "padding",
      value: padding(
        node.verticalPadding,
        node.horizontalPadding,
        node.verticalPadding,
        node.horizontalPadding,
        preferences,
      ),
    });
  }

  if (figma.hasTypeStyle(node)) {
    styles.push(
      {
        propertyName: "font-family",
        value: {
          type: CSSStyleValueTypes.String,
          value: node.style.fontFamily,
        },
      },
      {
        propertyName: "font-size",
        value: px(node.style.fontSize, preferences),
      },
      {
        propertyName: "font-weight",
        value: {
          type: CSSStyleValueTypes.Number,
          value: node.style.fontWeight,
          precision: 0,
        },
      },
      {
        propertyName: "line-height",
        value:
          typeof node.style.lineHeightPercentFontSize === "number"
            ? {
                type: CSSStyleValueTypes.List,
                separator: " ",
                head: {
                  type: CSSStyleValueTypes.Number,
                  value: node.style.lineHeightPercentFontSize / 100,
                  precision: 3,
                },
                tail: [
                  {
                    type: CSSStyleValueTypes.Comment,
                    text: `or ${node.style.lineHeightPx}px`,
                  },
                ],
              }
            : px(node.style.lineHeightPx, preferences),
      },
      {
        // NOTE: This CSS generation uses physical properties instead of logical properties,
        //       due to Figma API does not have/return text flow related information.
        propertyName: "text-align",
        value: {
          type: CSSStyleValueTypes.Keyword,
          ident:
            node.style.textAlignHorizontal === "JUSTIFIED"
              ? "justify"
              : node.style.textAlignHorizontal.toLowerCase(),
        },
      },
    );

    if (node.style.letterSpacing) {
      styles.push({
        propertyName: "letter-spacing",
        value: px(node.style.letterSpacing, preferences),
      });
    }

    if (node.style.italic) {
      styles.push({
        propertyName: "font-style",
        value: {
          type: CSSStyleValueTypes.Keyword,
          ident: "italic",
        },
      });
    }

    // There is no equivalent `text-transform` value for `SMALL_CAPS(_FORCED)`
    switch (node.style.textCase) {
      case "LOWER":
        styles.push({
          propertyName: "text-transform",
          value: {
            type: CSSStyleValueTypes.Keyword,
            ident: "lowercase",
          },
        });
        break;
      case "UPPER":
        styles.push({
          propertyName: "text-transform",
          value: {
            type: CSSStyleValueTypes.Keyword,
            ident: "uppercase",
          },
        });
        break;
      case "TITLE":
        styles.push({
          propertyName: "text-transform",
          value: {
            type: CSSStyleValueTypes.Keyword,
            ident: "capitalize",
          },
        });
        break;
    }
  }

  if (figma.hasStroke(node) && node.strokes[0]) {
    // Outputting `border-image` is impossible due to lacking of source value(s) for
    // `border-image-slice`.
    if (node.strokes[0].type === "SOLID") {
      styles.push({
        propertyName: "border",
        value: {
          type: CSSStyleValueTypes.List,
          separator: " ",
          head: px(node.strokeWeight, preferences),
          tail: [
            {
              type: CSSStyleValueTypes.Keyword,
              ident: "solid",
            },
            figmaPaintToCssPaint(node.strokes[0], preferences),
          ],
        },
      });
    }
  }

  if (figma.hasFills(node) && node.fills.length > 0) {
    const props = fills(node, preferences);
    if (props.length > 0) {
      styles.push(...props);
    }
  }

  if (figma.hasRadius(node) && node.cornerRadius > 0) {
    styles.push({
      propertyName: "border-radius",
      value: px(node.cornerRadius, preferences),
    });
  } else if (figma.hasRadii(node)) {
    const [head, ...tail] = node.rectangleCornerRadii;

    styles.push({
      propertyName: "border-radius",
      value: {
        type: CSSStyleValueTypes.List,
        head: px(head, preferences),
        tail: tail.map((value) => {
          return px(value, preferences);
        }),
        separator: " ",
      },
    });
  }

  if (figma.hasEffects(node)) {
    const { shadows, layerBlurs, bgBlurs } = node.effects.reduce<{
      shadows: readonly figma.ShadowEffect[];
      layerBlurs: readonly figma.Effect[];
      bgBlurs: readonly figma.Effect[];
    }>(
      ({ shadows, layerBlurs, bgBlurs }, effect) => {
        if (!effect.visible) {
          return { shadows, layerBlurs, bgBlurs };
        }

        if (figma.isShadowEffect(effect)) {
          return { shadows: [...shadows, effect], layerBlurs, bgBlurs };
        }

        switch (effect.type) {
          case "LAYER_BLUR":
            return { shadows, layerBlurs: [...layerBlurs, effect], bgBlurs };
          case "BACKGROUND_BLUR":
            return { shadows, layerBlurs, bgBlurs: [...bgBlurs, effect] };
          default:
            return { shadows, layerBlurs, bgBlurs };
        }
      },
      { shadows: [], layerBlurs: [], bgBlurs: [] },
    );

    if (shadows.length > 0) {
      const [head, ...tail] = shadows;

      styles.push({
        propertyName: "box-shadow",
        value: {
          type: CSSStyleValueTypes.List,
          separator: ", ",
          head: shadow(head, preferences),
          tail: tail.map((s) => shadow(s, preferences)),
        },
      });
    }

    if (layerBlurs.length > 0) {
      const [head, ...tail] = layerBlurs;

      styles.push({
        propertyName: "filter",
        value: {
          type: CSSStyleValueTypes.List,
          separator: " ",
          head: effectToBlur(head, preferences),
          tail: tail.map((blur) => effectToBlur(blur, preferences)),
        },
      });
    }

    if (bgBlurs.length > 0) {
      const [head, ...tail] = bgBlurs;

      styles.push({
        propertyName: "backdrop-filter",
        value: {
          type: CSSStyleValueTypes.List,
          separator: " ",
          head: effectToBlur(head, preferences),
          tail: tail.map((blur) => effectToBlur(blur, preferences)),
        },
      });
    }
  }

  return styles;
}

function padding(
  top: number,
  right: number,
  bottom: number,
  left: number,
  preferences: Readonly<Preferences>,
): CSSStyleValue {
  if (top === bottom && right === left) {
    if (top !== right) {
      return {
        type: CSSStyleValueTypes.List,
        separator: " ",
        head: px(top, preferences),
        tail: [px(right, preferences)],
      };
    }

    return px(top, preferences);
  }

  return {
    type: CSSStyleValueTypes.List,
    separator: " ",
    head: px(top, preferences),
    tail: [
      px(right, preferences),
      px(bottom, preferences),
      px(left, preferences),
    ],
  };
}

function effectToBlur(
  effect: figma.Effect,
  preferences: Readonly<Preferences>,
): CSSStyleValue {
  return {
    type: CSSStyleValueTypes.FunctionCall,
    functionName: "blur",
    args: px(effect.radius, preferences),
  };
}

function shadow(
  shadow: figma.ShadowEffect,
  preferences: Readonly<Preferences>,
): CSSStyleValue {
  const tail: (CSSStyleValue | null)[] = [
    px(shadow.offset.y, preferences),
    px(shadow.radius, preferences),
    shadow.spread ? px(shadow.spread, preferences) : null,
    withColorPreview(colorToValue(shadow.color, preferences), preferences),
    shadow.type === "INNER_SHADOW"
      ? {
          type: CSSStyleValueTypes.Keyword,
          ident: "inset",
        }
      : null,
  ];

  return {
    type: CSSStyleValueTypes.List,
    separator: " ",
    head: px(shadow.offset.x, preferences),
    tail: tail.filter((value): value is CSSStyleValue => !!value),
  };
}

function fills(
  node: figma.Node,
  preferences: Readonly<Preferences>,
): readonly CSSStyle[] {
  if (!figma.hasFills(node)) {
    return [];
  }

  const visibleFills = node.fills.filter((fill) => fill.visible !== false);
  if (!visibleFills.length) {
    return [];
  }

  if (node.type === "TEXT") {
    const fill = visibleFills[0]!;

    // Text fill can't be other than solid
    if (fill.type !== "SOLID") {
      return [];
    }

    return [
      {
        propertyName: "color",
        value: withColorPreview(
          colorToValue(fill.color, preferences),
          preferences,
        ),
      },
    ];
  }

  // `fills` is bloated property: it is foreground color of TEXT, background color
  // of rectangle shaped nodes, and fill color of Vector (not limited to VECTOR) nodes.
  // In order to make generated code both correct and relatable, only support background
  // color usage. (Foreground handling is already done, see above)
  switch (node.type) {
    case "FRAME":
    case "COMPONENT":
    case "COMPONENT_SET":
    case "INSTANCE":
    case "RECTANGLE":
      break;
    default:
      return [];
  }

  const [head, ...tail] = visibleFills;

  if (tail.length === 0) {
    switch (head.type) {
      case "SOLID": {
        return [
          {
            propertyName: "background-color",
            value: figmaPaintToCssPaint(head, preferences),
          },
        ];
      }
      case "IMAGE":
      case "GRADIENT_ANGULAR":
      case "GRADIENT_DIAMOND":
      case "GRADIENT_LINEAR":
      case "GRADIENT_RADIAL": {
        return [
          {
            propertyName: "background-image",
            value: figmaPaintToCssPaint(head, preferences),
          },
        ];
      }
      default: {
        return [];
      }
    }
  }

  return [
    {
      propertyName: "background",
      value: {
        type: CSSStyleValueTypes.List,
        separator: ", ",
        head: figmaPaintToCssPaint(head, preferences),
        tail: tail.map((paint) => figmaPaintToCssPaint(paint, preferences)),
      },
    },
  ];
}

function withColorPreview(
  value: CSSStyleValue,
  preferences: Readonly<Preferences>,
): CSSStyleValue {
  if (!preferences.enableColorPreview) {
    return value;
  }

  return {
    type: CSSStyleValueTypes.Color,
    value,
    color: serializeValue(value, preferences),
  };
}

function px(size: number, preferences: Readonly<Preferences>): CSSStyleValue {
  if (preferences.lengthUnit === "px") {
    return {
      type: CSSStyleValueTypes.Number,
      value: size,
      unit: "px",
    };
  }

  return {
    type: CSSStyleValueTypes.Number,
    value: size / preferences.rootFontSizeInPx,
    unit: "rem",
    precision: 2 + preferences.decimalPlaces,
  };
}

function figmaPaintToCssPaint(
  paint: figma.Paint,
  preferences: Readonly<Preferences>,
): CSSStyleValue {
  switch (paint.type) {
    case "SOLID": {
      const opacity = paint.opacity ?? 1;

      return withColorPreview(
        colorToValue(
          { ...paint.color, a: paint.color.a * opacity },
          preferences,
        ),
        preferences,
      );
    }
    case "EMOJI":
    case "VIDEO": {
      return {
        type: CSSStyleValueTypes.Comment,
        text: `This fill is unavailable as a CSS background (${paint.type})`,
      };
    }
    case "IMAGE": {
      return {
        type: CSSStyleValueTypes.FunctionCall,
        functionName: "url",
        args: {
          type: CSSStyleValueTypes.Comment,
          text: "image file",
        },
      };
    }
    case "GRADIENT_LINEAR": {
      return withColorPreview(
        {
          type: CSSStyleValueTypes.FunctionCall,
          functionName: "linear-gradient",
          args: {
            type: CSSStyleValueTypes.List,
            separator: ", ",
            head: {
              type: CSSStyleValueTypes.Number,
              value: getLinearGradientAngle(
                paint.gradientHandlePositions[0],
                paint.gradientHandlePositions[1],
              ),
              precision: 2,
              unit: "deg",
            },
            tail: paint.gradientStops.map((stop) => {
              return {
                type: CSSStyleValueTypes.List,
                separator: " ",
                head: withColorPreview(
                  colorToValue(stop.color, preferences),
                  preferences,
                ),
                tail: [
                  {
                    type: CSSStyleValueTypes.Number,
                    value: stop.position * 100,
                    precision: 2,
                    unit: "%",
                  },
                ],
              };
            }),
          },
        },
        preferences,
      );
    }
    case "GRADIENT_ANGULAR":
    case "GRADIENT_DIAMOND":
    case "GRADIENT_RADIAL": {
      return {
        type: CSSStyleValueTypes.Comment,
        text: "Not implemented",
      };
    }
  }
}

function colorToValue(
  color: figma.Color,
  preferences: Readonly<Preferences>,
): CSSStyleValue {
  if (isTransparent(color)) {
    return {
      type: CSSStyleValueTypes.Keyword,
      ident: "transparent",
    };
  }

  switch (preferences.cssColorNotation) {
    case "hex": {
      return toHex(color);
    }
    case "color-srgb": {
      return toColorSrgb(color);
    }
    case "rgb": {
      return toRgb(color);
    }
    case "hsl": {
      return toHsl(color);
    }
    case "display-p3": {
      return toDisplayP3(color);
    }
    case "srgb-to-display-p3": {
      return toDisplayP3SrgbSrc(color);
    }
  }
}

function toHex(color: figma.Color): CSSStyleValue {
  const r = (color.r * 0xff) | 0;
  const g = (color.g * 0xff) | 0;
  const b = (color.b * 0xff) | 0;
  const a = color.a;

  return {
    type: CSSStyleValueTypes.Literal,
    text:
      "#" +
      r.toString(16).padStart(2, "0") +
      g.toString(16).padStart(2, "0") +
      b.toString(16).padStart(2, "0") +
      (a === 1 ? "" : ((a * 0xff) | 0).toString(16).padStart(2, "0")),
  };
}

function toRgb(color: figma.Color): CSSStyleValue {
  return {
    type: CSSStyleValueTypes.FunctionCall,
    functionName: "rgb",
    args: {
      type: CSSStyleValueTypes.List,
      separator: " ",
      head: {
        type: CSSStyleValueTypes.Number,
        value: color.r * 0xff,
        precision: 0,
      },
      tail: [
        {
          type: CSSStyleValueTypes.Number,
          value: color.g * 0xff,
          precision: 0,
        },
        {
          type: CSSStyleValueTypes.Number,
          value: color.b * 0xff,
          precision: 0,
        },
        {
          type: CSSStyleValueTypes.Literal,
          text: "/",
        },
        {
          type: CSSStyleValueTypes.Number,
          value: color.a,
          precision: 2,
        },
      ],
    },
  };
}

function toColorSrgb(color: figma.Color): CSSStyleValue {
  return {
    type: CSSStyleValueTypes.FunctionCall,
    functionName: "color",
    args: {
      type: CSSStyleValueTypes.List,
      separator: " ",
      head: {
        type: CSSStyleValueTypes.Keyword,
        ident: "srgb",
      },
      tail: [
        {
          type: CSSStyleValueTypes.Number,
          value: color.r,
          precision: 6,
        },
        {
          type: CSSStyleValueTypes.Number,
          value: color.g,
          precision: 6,
        },
        {
          type: CSSStyleValueTypes.Number,
          value: color.b,
          precision: 6,
        },
        {
          type: CSSStyleValueTypes.Literal,
          text: "/",
        },
        {
          type: CSSStyleValueTypes.Number,
          value: color.a,
          precision: 6,
        },
      ],
    },
  };
}

/**
 * Generate `color(display-p3 r g b)` assuming the `color` being Display P3.
 */
function toDisplayP3(color: figma.Color): CSSStyleValue {
  return {
    type: CSSStyleValueTypes.FunctionCall,
    functionName: "color",
    args: {
      type: CSSStyleValueTypes.List,
      separator: " ",
      head: {
        type: CSSStyleValueTypes.Keyword,
        ident: "display-p3",
      },
      tail: [
        {
          type: CSSStyleValueTypes.Number,
          value: color.r,
          precision: 6,
        },
        {
          type: CSSStyleValueTypes.Number,
          value: color.g,
          precision: 6,
        },
        {
          type: CSSStyleValueTypes.Number,
          value: color.b,
          precision: 6,
        },
        {
          type: CSSStyleValueTypes.Literal,
          text: "/",
        },
        {
          type: CSSStyleValueTypes.Number,
          value: color.a,
          precision: 6,
        },
      ],
    },
  };
}

/**
 * Generate `color(display-p3 r g b)` assuming the `color` being sRGB.
 * This produces a perceptually identical color in Display P3 space.
 *
 * Implements color conversion defined in CSS Color Module Level 4 draft.
 * https://drafts.csswg.org/css-color-4/#color-conversion
 */
function toDisplayP3SrgbSrc(color: figma.Color): CSSStyleValue {
  return toDisplayP3(srgbToDisplayP3(color));
}

function toHsl(color: figma.Color): CSSStyleValue {
  // https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB
  const v = Math.max(color.r, color.g, color.b);
  const c = v - Math.min(color.r, color.g, color.b);
  const l = v - c / 2;
  const h =
    60 *
    (c === 0
      ? 0
      : v === color.r
      ? ((color.g - color.b) / c) % 6
      : v === color.g
      ? (color.b - color.r) / c + 2
      : (color.r - color.g) / c + 4);
  const s = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);

  return {
    type: CSSStyleValueTypes.FunctionCall,
    functionName: "hsl",
    args: {
      type: CSSStyleValueTypes.List,
      separator: " ",
      head: {
        type: CSSStyleValueTypes.Number,
        value: h,
        unit: "deg",
      },
      tail: [
        {
          type: CSSStyleValueTypes.Number,
          value: s * 100,
          unit: "%",
        },
        {
          type: CSSStyleValueTypes.Number,
          value: l * 100,
          unit: "%",
        },
        {
          type: CSSStyleValueTypes.Literal,
          text: "/",
        },
        {
          type: CSSStyleValueTypes.Number,
          value: color.a,
        },
      ],
    },
  };
}
