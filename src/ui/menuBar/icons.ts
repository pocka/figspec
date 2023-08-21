import { attr, className, svg, style } from "../../dom";

export const icons = {
  info: () =>
    svg(
      "svg",
      [
        attr("viewBox", "0 0 100 100"),
        className("mb-icon"),
        attr("fill", "none"),
        attr("stroke-width", "8"),
      ],
      [
        svg("circle", [
          attr("cx", "50"),
          attr("cy", "50"),
          attr("r", "42"),
          attr("stroke", "currentColor"),
        ]),
        svg("circle", [
          attr("cx", "50"),
          attr("cy", "30"),
          attr("r", "9"),
          attr("fill", "currentColor"),
        ]),
        svg("rect", [
          attr("x", "44"),
          attr("y", "45"),
          attr("width", "12"),
          attr("height", "35"),
          attr("fill", "currentColor"),
        ]),
      ],
    ),
  preferences: () =>
    svg(
      "svg",
      [
        attr("viewBox", "0 0 100 100"),
        className("mb-icon"),
        attr("fill", "none"),
        attr("stroke-width", "10"),
      ],
      [
        svg("circle", [
          attr("cx", "50"),
          attr("cy", "50"),
          attr("r", "30"),
          attr("stroke", "currentColor"),
        ]),
        ...Array.from({ length: 8 }).map((_, i) => {
          const deg = 45 * i;

          return svg("path", [
            attr("d", "M45,2 l10,0 l5,15 l-20,0 Z"),
            attr("fill", "currentColor"),
            style({
              transform: `rotate(${deg}deg)`,
              "transform-origin": "50px 50px",
            }),
          ]);
        }),
      ],
    ),
} as const;
