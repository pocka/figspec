import * as Figma from "figma-js";

type ElementColor = Figma.Color;

type GradientStop = { color: ElementColor; position: number };

type GradientHandlePosition = {
  x: number;
  y: number;
};

type ElementGradientColor = {
  gradientHandlePositions: GradientHandlePosition[];
  gradientStops: GradientStop[];
};

export type FigmaNode = Figma.Node & {
  name: string;
  characters: string;
  background: { color: ElementColor }[];
  backgroundColor: ElementColor;
  fills: { color: ElementColor }[];
  absoluteBoundingBox: {
    height: number;
    width: number;
  };
  cornerRadius?: number;
  rectangleCornerRadii?: number[];
  horizontalPadding: number;
  verticalPadding: number;
  style?: {
    fontFamily: string;
    fontPostScriptName: string;
    fontSize: number;
    fontWeight: number;
    lineHeightPx: number;
    textAlignHorizontal: string;
    textAlignVertical: string;
  };
  type: "TEXT" | "INSTANCE" | "FRAME" | "VECTOR" | "RECTANGLE";
};

export type CSSRule = {
  property: string;
  value: string;
  color?: string;
};

const extractColorStyle = (color: ElementColor) => {
  if (color.a === 0) {
    return "transparent";
  } else if (color.a < 1) {
    return `rgba(${rgbToIntArray(color).join(", ")}, ${color.a.toFixed(2)})`;
  } else {
    return rgbToHex(color);
  }
};

const extractGradientColorStyle = (color: ElementGradientColor) => {
  return new Gradient(color).cssColor;
};

export class Gradient {
  colors;
  colorObjects;
  angle;
  gradientHandles: {
    start: GradientHandlePosition;
    end: GradientHandlePosition;
  };

  constructor(data: ElementGradientColor) {
    this.gradientHandles = {
      start: data.gradientHandlePositions[0],
      end: data.gradientHandlePositions[1],
    };

    this.colors = data.gradientStops;
    this.colorObjects = this.createColorObjects(this.colors);

    this.angle = this.calculateAngle(
      this.gradientHandles.start,
      this.gradientHandles.end,
    );
  }

  get cssGradientArray() {
    return this.colorObjects.map((color, index) => {
      const position = this.floatToPercent(this.colors[index].position);
      return color + " " + position;
    });
  }

  get cssColor() {
    const cssGradientArray = this.cssGradientArray;
    cssGradientArray.unshift(this.angle + "deg");
    return `linear-gradient(${cssGradientArray.join(", ")})`;
  }

  private createColorObjects(colors: GradientStop[]) {
    return colors.map(({ color }) => extractColorStyle(color));
  }

  private floatToPercent(value: number) {
    return (value *= 100).toFixed(0) + "%";
  }

  private calculateAngle(
    startHandle: GradientHandlePosition,
    endHandle: GradientHandlePosition,
  ) {
    const radians = Math.atan(this.calculateGradient(startHandle, endHandle));
    return parseInt(this.radToDeg(radians).toFixed(1));
  }

  private calculateGradient(
    startHandle: GradientHandlePosition,
    endHandle: GradientHandlePosition,
  ) {
    return ((endHandle.y - startHandle.y) / (endHandle.x - startHandle.x)) * -1;
  }

  private radToDeg(radian: number) {
    return (180 * radian) / Math.PI;
  }
}

export class NodeStyles {
  background;
  backgroundImage;
  border;
  borderColor;
  borderRadius;
  boxShadow;
  boxShadowColor;
  color;
  fontFamily;
  fontPostScriptName;
  fontSize;
  fontWeight;
  height;
  horizontalPadding;
  lineHeight;
  verticalPadding;
  width;

  hasPadding = false;

  constructor(node: FigmaNode) {
    this.height = `${Math.trunc(node.absoluteBoundingBox.height)}px`;
    this.width = `${Math.trunc(node.absoluteBoundingBox.width)}px`;

    // paddings
    if (node.horizontalPadding || node.verticalPadding) {
      this.hasPadding = true;
      this.horizontalPadding = `${node.horizontalPadding}px`;
      this.verticalPadding = `${node.verticalPadding}px`;
    }

    // font styles
    if (node.style) {
      this.fontFamily = node.style.fontFamily;
      this.fontPostScriptName = node.style.fontPostScriptName?.replace(
        "-",
        " ",
      );
      this.fontWeight = node.style.fontWeight;
      this.fontSize = `${Math.ceil(node.style.fontSize)}px`;
      this.lineHeight = `${Math.trunc(node.style.lineHeightPx)}px`;
    }

    // border radii
    if (node.rectangleCornerRadii) {
      this.borderRadius =
        node.rectangleCornerRadii.filter(
          (radius) => radius === node.cornerRadius,
        ).length < 4
          ? `${node.rectangleCornerRadii.join("px ")}px`
          : `${node.cornerRadius}px`;
    }

    // colors, background, fill
    if (node.backgroundColor || node.backgroundColor) {
      const color = node.backgroundColor || node.background?.[0].color;
      this.background = extractColorStyle(color);
    }

    const fillColor = node.fills?.[0];
    if (fillColor && fillColor.visible !== false) {
      if (node.type === "TEXT") {
        this.color = extractColorStyle(fillColor.color);
      } else if (fillColor.type.includes("GRADIENT")) {
        this.backgroundImage = extractGradientColorStyle(
          fillColor as unknown as ElementGradientColor,
        );
      } else if (fillColor.type === "SOLID") {
        this.background = extractColorStyle(fillColor.color);
      }
    }

    // borders
    if (node.strokes && node.strokes.length > 0) {
      this.borderColor = extractColorStyle(
        node.strokes[0].color as ElementColor,
      );
      this.border = `${node.strokeWeight}px solid ${this.borderColor}`;
    }

    // box-shadow
    if (node.effects && node.effects.length > 0) {
      const { offset, radius, color } = node.effects[0];
      this.boxShadowColor = extractColorStyle(color as Figma.Color);
      this.boxShadow = `${offset?.x || 0}px ${offset?.y || 0}px 0 ${radius} ${
        this.boxShadowColor
      }`;
    }
  }

  getStyles() {
    return [
      this.height && { property: "height", value: this.height },
      this.width && { property: "width", value: this.width },
      this.fontFamily && { property: "font-family", value: this.fontFamily },
      this.fontSize && { property: "font-size", value: this.fontSize },
      this.fontWeight && { property: "font-weight", value: this.fontWeight },
      this.lineHeight && { property: "line-height", value: this.lineHeight },
      this.borderRadius && {
        property: "border-radius",
        value: this.borderRadius,
      },
      this.backgroundImage && {
        property: "background-image",
        value: this.backgroundImage,
      },
      this.boxShadow && {
        property: "box-shadow",
        value: this.boxShadow,
        color: this.boxShadowColor,
      },
      this.border && {
        property: "border",
        value: this.border,
        color: this.borderColor,
      },
      this.background && {
        property: "background",
        value: this.background,
        color: this.background,
      },
      this.color && { property: "color", value: this.color, color: this.color },
    ].filter(Boolean) as CSSRule[];
  }

  getStyleSheet() {
    return this.getStyles().map(getStyleRule).join("\n");
  }
}

const rgbToIntArray = (color: ElementColor) => [
  Math.trunc(255 * color.r),
  Math.trunc(255 * color.g),
  Math.trunc(255 * color.b),
];

const rgbToHex = (color: ElementColor) => {
  const [r, g, b] = rgbToIntArray(color);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const getStyleRule = ({ property, value }: CSSRule) =>
  `${property}: ${value};`;
