import { attr, className, svg } from "../dom.js";

export const CENTER = 0x0;
export const LEFT = 0x1;
export const RIGHT = 0x2;
export const TOP = 0x10;
export const BOTTOM = 0x20;

export const styles = /* css */ `
  .tl-bg {
    stroke: none;
    fill: var(--tooltip-bg);
  }

  .tl-text {
    font-size: var(--tooltip-font-size);
    stroke: none;
    fill: var(--tooltip-fg);
  }
`;

export class TooltipLayer {
  #container: SVGElement;

  get container(): SVGElement {
    return this.#container;
  }

  constructor(container: SVGElement = svg("g")) {
    this.#container = container;
  }

  show(text: string, x: number, y: number, placement: number) {
    // 0 ... center, 1 ... left, 2 ... right
    const hp = placement & 0xf;
    // 0 ... center, 1 ... top,  2 ... bottom
    const vp = (placement & 0xf0) >> 4;

    // Elements should be added to DOM tree as soon as it created:
    // `SVGGraphicsElement.getBBox` does not work for orphan element (does not throw an error!)
    const group = svg("g");
    this.#container.appendChild(group);

    const bg = svg("rect", [attr("rx", "2"), className("tl-bg")]);
    group.appendChild(bg);

    const el = svg(
      "text",
      [
        attr("text-anchor", "middle"),
        // By default, `<text>` locates it's baseline on `y`.
        // This attribute changes that stupid default
        attr("dominant-baseline", "central"),
        className("tl-text"),
      ],
      [text],
    );
    group.appendChild(el);

    const bbox = el.getBBox();

    const margin = bbox.height * 0.25;
    const vPadding = bbox.height * 0.15;
    const hPadding = bbox.height * 0.25;

    const px =
      hp === 1
        ? x - bbox.width * 0.5 - (margin + hPadding)
        : hp === 2
        ? x + bbox.width * 0.5 + (margin + hPadding)
        : x;

    const py =
      vp === 1
        ? y - bbox.height * 0.5 - (margin + vPadding)
        : vp === 2
        ? y + bbox.height * 0.5 + (margin + vPadding)
        : y;

    el.setAttribute("x", px.toString());
    el.setAttribute("y", py.toString());

    bg.setAttribute("x", (px - bbox.width * 0.5 - hPadding).toString());
    bg.setAttribute("y", (py - bbox.height * 0.5 - vPadding).toString());
    bg.setAttribute("width", (bbox.width + hPadding * 2).toString());
    bg.setAttribute("height", (bbox.height + vPadding * 2).toString());

    group.style.transform = `scale(calc(1 / var(--_scale)))`;

    const tox = hp === 1 ? x - margin : hp === 2 ? x + margin : x;

    const toy = vp === 1 ? y - margin : vp === 2 ? y + margin : y;

    group.style.transformOrigin = `${tox}px ${toy}px`;
  }

  clear() {
    this.#container.replaceChildren();
  }
}
