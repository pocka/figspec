import { attr, svg, type ElementFn } from "../../dom";

export function check(
  attrs: readonly ElementFn<SVGSVGElement>[] = [],
): SVGSVGElement {
  return svg(
    "svg",
    [
      ...attrs,
      attr("viewBox", "0 0 100 100"),
      attr("aria-label", "Check mark"),
    ],
    [
      svg("path", [
        attr("d", "M10,50 L40,80 L90,20"),
        attr("fill", "none"),
        attr("stroke", "currentColor"),
        attr("stroke-width", "15"),
      ]),
    ],
  );
}
