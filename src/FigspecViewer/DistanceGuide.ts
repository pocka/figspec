import { css, svg } from "lit";
import { styleMap } from "lit/directives/style-map.js";

import { DistanceGuide, getDistanceGuides, round } from "./utils";

import type { SizedNode } from "./types";

interface LineProps {
  guide: DistanceGuide;

  reverseScale: number;
}

const Line = ({ guide, reverseScale }: LineProps) => {
  const xLength = Math.abs(guide.points[0].x - guide.points[1].x);
  const yLength = Math.abs(guide.points[0].y - guide.points[1].y);

  if (xLength === 0 && yLength === 0) {
    return null;
  }

  return svg`
    <line
      class="distance-line"
      x1=${guide.points[0].x}
      y1=${guide.points[0].y}
      x2=${guide.points[1].x}
      y2=${guide.points[1].y}
    />

    ${
      guide.bisector &&
      svg`
        <line
          class="distance-line"
          x1=${guide.bisector[0].x}
          y1=${guide.bisector[0].y}
          x2=${guide.bisector[1].x}
          y2=${guide.bisector[1].y}
          style=${styleMap({
            strokeDasharray: `${4 * reverseScale}`,
          })}
          shape-rendering="geometricPrecision"
          fill="none"
        />
      `
    }
  `;
};

interface TooltipProps {
  guide: DistanceGuide;

  reverseScale: number;
  fontSize: number;
}

const Tooltip = ({ guide, reverseScale, fontSize }: TooltipProps) => {
  const xLength = Math.abs(guide.points[0].x - guide.points[1].x);
  const yLength = Math.abs(guide.points[0].y - guide.points[1].y);

  if (xLength === 0 && yLength === 0) {
    return null;
  }

  const text = round(Math.max(xLength, yLength)).toString(10);

  // Decreases font width because every text is a number (narrow).
  // We can measure the correct width with getComputedTextLength method on
  // <text> element, but it needs access to DOM or creating an element each
  // render cycle, both have performance costs.
  const width = text.length * fontSize * 0.5;

  const startMargin = fontSize * 0.25;

  const vPadding = fontSize * 0.25;
  const hPadding = fontSize * 0.5;

  const x =
    xLength > yLength
      ? (guide.points[0].x + guide.points[1].x) / 2 - width / 2
      : guide.points[0].x;

  const y =
    xLength > yLength
      ? guide.points[0].y
      : (guide.points[0].y + guide.points[1].y) / 2 - fontSize / 2;

  const transform = [
    `scale(${reverseScale})`,
    xLength > yLength
      ? `translate(0, ${startMargin + vPadding})`
      : `translate(${startMargin + hPadding}, 0)`,
  ].join(" ");

  const cx = x + width / 2;
  const cy = y + fontSize / 2;

  const transformOrigin = xLength > yLength ? `${cx} ${y}` : `${x} ${cy}`;

  return svg`
    <g class="distance-tooltip">
      <rect
        x=${x - hPadding}
        y=${y - vPadding}
        rx="2"
        width=${width + hPadding * 2}
        height=${fontSize + vPadding * 2}
        transform=${transform}
        transform-origin=${transformOrigin}
        stroke="none"
      />

      <text
        x=${cx}
        y=${y + fontSize - vPadding / 2}
        text-anchor="middle"
        transform=${transform}
        transform-origin=${transformOrigin}
        stroke="none"
        fill="white"
        style="font-size: ${fontSize}px"
      >
        ${text}
      </text>
    </g>
  `;
};

export interface GuidesProps {
  node: SizedNode;
  distanceTo: SizedNode;

  reverseScale: number;

  fontSize: number;
}

const guidesCache = new Map<string, readonly DistanceGuide[]>();

export const Guides = ({
  node,
  distanceTo,
  reverseScale,
  fontSize,
}: GuidesProps) => {
  const combinedId = node.id + "\n" + distanceTo.id;

  let guides = guidesCache.get(combinedId);

  if (!guides) {
    guides = getDistanceGuides(
      node.absoluteBoundingBox,
      distanceTo.absoluteBoundingBox,
    );

    guidesCache.set(combinedId, guides);
  }

  return [
    ...guides.map((guide) => Line({ guide, reverseScale })),
    ...guides.map((guide) => Tooltip({ guide, reverseScale, fontSize })),
  ];
};

export const styles = css`
  .distance-line {
    shape-rendering: geometricPrecision;
    fill: none;
    opacity: 0;
  }

  .distance-tooltip {
    opacity: 0;
  }

  .guide:hover ~ .distance-line,
  .guide:hover ~ .distance-tooltip {
    opacity: 1;
  }
`;
