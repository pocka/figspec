import { css, html, svg } from "lit-element";
import { styleMap, StyleInfo } from "lit-html/directives/style-map";

import { DistanceGuide as TDistanceGuide, Point2D, round } from "./utils";

export interface DistaneGuideProps {
  guide: TDistanceGuide;

  reverseScale: number;
}

export const DistanceGuide = ({ guide, reverseScale }: DistaneGuideProps) => {
  return svg`
    <line
      x1=${guide.points[0].x}
      y1=${guide.points[0].y}
      x2=${guide.points[1].x}
      y2=${guide.points[1].y}
      shape-rendering="geometricPrecision"
    />

    ${
      guide.bisector &&
      svg`
        <line
          x1=${guide.bisector[0].x}
          y1=${guide.bisector[0].y}
          x2=${guide.bisector[1].x}
          y2=${guide.bisector[1].y}
          style=${styleMap({
            strokeDasharray: `${4 * reverseScale}`,
          })}
          shape-rendering="geometricPrecision"
        />
      `
    }
  `;
};

export const styles = css``;
