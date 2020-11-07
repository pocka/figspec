import * as Figma from "figma-js";
import { CSSResultArray, LitElement } from "lit-element";

export type SizedNode = Extract<Figma.Node, { absoluteBoundingBox: any }>;

export interface Point2D {
  x: number;
  y: number;
}

export type DistanceGuide = {
  /**
   * Solid line
   */
  points: [Point2D, Point2D];

  /**
   * Dashed line
   */
  bisector?: [Point2D, Point2D];
};

interface AbsRect {
  /**
   * min y of the rect.
   * y of the top line.
   */
  top: number;

  /**
   * max x of the rect.
   * x of the right line.
   */
  right: number;

  /**
   * max y of the rect.
   * y of the bottom line.
   */
  bottom: number;

  /**
   * min x of the rect.
   * x of the left line.
   */
  left: number;
}

function absRect(rect: Figma.Rect): AbsRect {
  return {
    top: rect.y,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height,
    left: rect.x,
  };
}

export function getDistanceGuides(
  selected: Figma.Rect,
  compared: Figma.Rect
): readonly DistanceGuide[] {
  const a = absRect(selected);
  const b = absRect(compared);

  const isYIntersecting = !(a.top > b.bottom || a.bottom < b.top);
  const isXIntersecting = !(a.left > b.right || a.right < b.left);

  // Rects are intersecting.
  if (isXIntersecting && isYIntersecting) {
    // Center of intersecting region.
    const intersectCenter: Point2D = {
      x: (Math.max(a.left, b.left) + Math.min(a.right, b.right)) / 2,
      y: (Math.max(a.top, b.top) + Math.min(a.bottom, b.bottom)) / 2,
    };

    return [
      {
        points: [
          { x: a.left, y: intersectCenter.y },
          { x: b.left, y: intersectCenter.y },
        ],
      },
      {
        points: [
          {
            x: a.right,
            y: intersectCenter.y,
          },
          { x: b.right, y: intersectCenter.y },
        ],
      },
      {
        points: [
          { y: a.top, x: intersectCenter.x },
          { y: b.top, x: intersectCenter.x },
        ],
      },
      {
        points: [
          {
            y: a.bottom,
            x: intersectCenter.x,
          },
          { y: b.bottom, x: intersectCenter.x },
        ],
      },
    ];
  }

  const isALeft = a.left > b.right;
  const isABelow = a.top > b.bottom;

  const selectedCenter: Point2D = {
    x: selected.x + selected.width / 2,
    y: selected.y + selected.height / 2,
  };

  const guides: readonly (DistanceGuide | null)[] = [
    !isXIntersecting
      ? {
          points: [
            { x: isALeft ? a.left : a.right, y: selectedCenter.y },
            { x: isALeft ? b.right : b.left, y: selectedCenter.y },
          ],
          bisector: !isYIntersecting
            ? [
                { x: isALeft ? b.right : b.left, y: selectedCenter.y },
                {
                  x: isALeft ? b.right : b.left,
                  y: isABelow ? b.bottom : b.top,
                },
              ]
            : void 0,
        }
      : null,
    !isYIntersecting
      ? {
          points: [
            { y: isABelow ? a.top : a.bottom, x: selectedCenter.x },
            { y: isABelow ? b.bottom : b.top, x: selectedCenter.x },
          ],
          bisector: !isXIntersecting
            ? [
                { y: isABelow ? b.bottom : b.top, x: selectedCenter.x },
                {
                  y: isABelow ? b.bottom : b.top,
                  x: isALeft ? b.right : b.left,
                },
              ]
            : void 0,
        }
      : null,
  ];

  return guides.filter((x): x is DistanceGuide => !!x);
}

/**
 * x.xxxxx... -> x.xx
 */
export function round(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * Utility type for creating constructor type from an interface.
 * @example
 * function FooMixin<T extends Constructor<LitElement>>(Base: T): T & Constructor<MixinInterface> {
 *  // ...
 * }
 */
export type Constructor<T> = new (...args: any[]) => T;

export function extendStyles(
  left: typeof LitElement.styles,
  right: typeof LitElement.styles
): CSSResultArray {
  return [...stylesToArray(left), ...stylesToArray(right)];
}

function stylesToArray(styles: typeof LitElement.styles): CSSResultArray {
  if (!styles) {
    return [];
  }

  if (styles instanceof Array) {
    return styles;
  }

  return [styles];
}
