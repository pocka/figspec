import { attr, svg, type ElementFn } from "../../dom";

export function close(
  attrs: readonly ElementFn<SVGSVGElement>[] = [],
): SVGSVGElement {
  return svg(
    "svg",
    [...attrs, attr("viewBox", "0 0 20 20"), attr("aria-label", "Close icon")],
    [
      svg(
        "path",
        [
          attr("d", "M1 19L19 1M19 19L1 1"),
          attr("stroke-width", "2"),
          attr("stroke", "currentColor"),
        ],
        [],
      ),
    ],
  );
}

export function copy(
  attrs: readonly ElementFn<SVGSVGElement>[] = [],
): SVGSVGElement {
  return svg(
    "svg",
    [...attrs, attr("viewBox", "0 0 30 30"), attr("aria-label", "Copy icon")],
    [
      svg(
        "path",
        [
          attr(
            "d",
            "M21 25.5C21 24.9477 20.5523 24.5 20 24.5C19.4477 24.5 19 24.9477 19 25.5H21ZM13 2H25V0H13V2ZM28 5V21H30V5H28ZM25 24H13V26H25V24ZM10 21V5H8V21H10ZM13 24C11.3431 24 10 22.6569 10 21H8C8 23.7614 10.2386 26 13 26V24ZM28 21C28 22.6569 26.6569 24 25 24V26C27.7614 26 30 23.7614 30 21H28ZM25 2C26.6569 2 28 3.34315 28 5H30C30 2.23858 27.7614 0 25 0V2ZM13 0C10.2386 0 8 2.23858 8 5H10C10 3.34315 11.3431 2 13 2V0ZM16.5 28H5V30H16.5V28ZM2 25V10H0V25H2ZM5 28C3.34315 28 2 26.6569 2 25H0C0 27.7614 2.23858 30 5 30V28ZM5 7H8V5H5V7ZM2 10C2 8.34315 3.34315 7 5 7V5C2.23858 5 0 7.23858 0 10H2ZM16.5 30C18.9853 30 21 27.9853 21 25.5H19C19 26.8807 17.8807 28 16.5 28V30Z",
          ),
          attr("fill", "currentColor"),
        ],
        [],
      ),
    ],
  );
}
