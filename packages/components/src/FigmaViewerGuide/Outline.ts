import * as Figma from "figma-js";
import { css, svg } from "lit-element";
import { styleMap, StyleInfo } from "lit-html/directives/style-map";

export interface OutlineProps {
  node: Extract<Figma.Node, { absoluteBoundingBox: any }>;

  computedThickness: number;

  style?: StyleInfo;
}

export const Outline = ({
  node,
  computedThickness,
  style = {},
}: OutlineProps) => {
  const { width, height } = node.absoluteBoundingBox;

  const guideStyle: StyleInfo = {
    width: `${width}px`,
    height: `${height}px`,
    ...style,
  };

  const radius: {
    topLeft: number;
    topRight: number;
    bottomRight: number;
    bottomLeft: number;
  } =
    "cornerRadius" in node && node.cornerRadius
      ? {
          topLeft: node.cornerRadius,
          topRight: node.cornerRadius,
          bottomRight: node.cornerRadius,
          bottomLeft: node.cornerRadius,
        }
      : "rectangleCornerRadii" in node && node.rectangleCornerRadii
      ? {
          topLeft: node.rectangleCornerRadii[0],
          topRight: node.rectangleCornerRadii[1],
          bottomRight: node.rectangleCornerRadii[2],
          bottomLeft: node.rectangleCornerRadii[3],
        }
      : {
          topLeft: 0,
          topRight: 0,
          bottomRight: 0,
          bottomLeft: 0,
        };

  // Since SVG can't control where to draw borders (I mean you can't draw inset borders), we need to
  // shift each drawing points by the half of the border width.
  const shift = computedThickness / 2;

  // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
  // [M] ... Move to
  // [L] ... Line to
  // [A] ... Arc to
  // [Z] ... Close path
  const moveTo = (x: number, y: number) => `M${x},${y}`;
  const lineTo = (x: number, y: number) => `L${x},${y}`;
  const arcTo = (r: number, x: number, y: number) =>
    `A${r},${r} 0 0 1 ${x},${y}`;

  const boxPath = [
    moveTo(radius.topLeft + shift, shift),
    lineTo(width - radius.topRight, shift),
    arcTo(radius.topRight - shift, width - shift, radius.topRight),
    lineTo(width - shift, height - radius.bottomRight),
    arcTo(
      radius.bottomRight - shift,
      width - radius.bottomRight,
      height - shift
    ),
    lineTo(radius.bottomLeft, height - shift),
    arcTo(radius.bottomLeft - shift, shift, height - radius.bottomLeft),
    lineTo(shift, radius.topLeft),
    arcTo(radius.topLeft - shift, radius.topLeft, shift),
    "Z",
  ].join(" ");

  return svg`
    <svg
      class="guide"
      viewBox="0 0 ${width} ${height}"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      style="${styleMap(guideStyle)}"
    >
      <path
        d=${boxPath}
        shape-rendering="geometricPrecision"
      />
    </svg>
  `;
};

export const styles = css`
  .guide {
    position: absolute;
    stroke: none;

    /*
     * SVGs cannot be pixel perfect, especially floating values.
     * Since many platform renders them visually incorrectly (probably they
     * are following the spec), it's safe to set overflow to visible.
     * Cropped borders are hard to visible and ugly.
     */
    overflow: visible;
  }
  .guide:hover {
    stroke: var(--color);
  }
  :host([selected]) > .guide {
    stroke: var(--selected-color);
  }
`;
