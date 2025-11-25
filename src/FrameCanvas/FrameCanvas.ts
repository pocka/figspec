import { attr, className, el, on, style, svg } from "../dom.js";
import * as figma from "../figma.js";
import {
  roundTo,
  nextPowerOfTwo,
  previousPowerOfTwo,
  MAX_ZOOM,
  MIN_ZOOM,
} from "../math.js";
import { type Preferences } from "../preferences.js";
import { effect, Signal } from "../signal.js";

import { BoundingBoxMeasurement } from "./BoundingBoxMeasurement.js";
import { getDistanceGuides } from "./distanceGuide.js";
import { getRenderBoundingBox } from "./getRenderBoundingBox.js";
import * as TooltipLayer from "./TooltipLayer.js";

const enum DragState {
  Disabled = 0,
  Idle,
  Dragging,
}

const enum TouchGestureState {
  Idle = 0,
  Touching,
}

const enum TouchingStateModes {
  Panning = 0,
  Scaling,
}

interface Panning {
  mode: TouchingStateModes.Panning;
  initialTouch: Touch;
  initialX: number;
  initialY: number;
}

interface Scaling {
  mode: TouchingStateModes.Scaling;
  initialDist: number;
  initialScale: number;
}

type TouchingState = Panning | Scaling;

export class FrameCanvas {
  static get styles(): string {
    return (
      /* css */ `
      .fc-viewport {
        --tooltip-font-size: var(--guide-tooltip-font-size);

        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column-reverse;

        background-color: var(--canvas-bg);
        touch-action: none;
      }

      .fc-canvas {
        position: absolute;
        top: 50%;
        left: 50%;
        flex: 1;

        overflow: visible;
      }

      .fc-rendered-image {
        position: absolute;
        top: 0;
        left: 0;

        overflow: hidden;
        pointer-events: none;
      }

      .fc-guide-canvas {
        position: absolute;

        overflow: visible;
        fill: none;
        stroke-width: calc(var(--guide-thickness) / var(--_scale, 1));
        pointer-events: none;
        z-index: calc(var(--z-index) + 3);
      }

      .fc-guide-selection-layer {
        stroke: var(--guide-selected-color);
      }

      .fc-tooltip-selection-layer {
        --tooltip-bg: var(--guide-selected-tooltip-bg);
        --tooltip-fg: var(--guide-selected-tooltip-fg);
      }

      .fc-guide-hover-layer {
        stroke: var(--guide-color);
      }

      .fc-tooltip-hover-layer {
        --tooltip-bg: var(--guide-tooltip-bg);
        --tooltip-fg: var(--guide-tooltip-fg);
      }

      .fc-hitbox-layer, .fc-hitbox {
        position: absolute;
      }

      .fc-hitbox-layer {
        top: 0;
        left: 0;
      }

      .fc-hitbox[data-select-mute] {
        pointer-events: none;
      }
    ` + TooltipLayer.styles
    );
  }

  static DRAG_MODE_KEY = " ";

  #container: HTMLElement;
  #canvas = el("div", [className("fc-canvas")]);
  #viewport: HTMLElement;

  #hitboxToNodeMap: WeakMap<Element, figma.Node> = new WeakMap();

  #x = 0;
  #y = 0;
  #scale = 1;

  #preferences!: Readonly<Preferences>;
  #selected: Signal<figma.Node | null>;
  #hovered = new Signal<figma.Node | null>(null);

  #dragState = new Signal<DragState>(DragState.Disabled);
  #isActive = false;

  #touchState = new Signal<TouchGestureState>(TouchGestureState.Idle);
  #touchingState = new Signal<TouchingState | null>(null);
  #activeGestureTouches = 0;

  get container() {
    return this.#container;
  }

  constructor(
    preferences: Signal<Readonly<Preferences>>,
    selected: Signal<figma.Node | null>,
    container: HTMLElement = el("div"),
  ) {
    effect(() => {
      this.#preferences = preferences.get();
    });

    this.#container = container;
    this.#selected = selected;

    this.#viewport = el(
      "div",
      [
        className("fc-viewport"),
        // Some UA defaults to passive (breaking but they did it anyway).
        // This component prevents every native wheel behavior on it.
        on("wheel", this.#onWheel, { passive: false }),
        on("pointerdown", this.#onPointerDown),
        on("pointerup", this.#onPointerUp),
        on("pointermove", this.#onPointerMove),
        on("pointerover", this.#onPointerOver),
        on("pointerout", this.#onPointerLeave),
        on("touchstart", this.#onTouchStart),
        on("touchend", this.#onTouchEnd),
        on("touchcancel", this.#onTouchCancel),
        on("touchmove", this.#onTouchMove),
      ],
      [this.#canvas],
    );

    this.#container.appendChild(this.#viewport);
  }

  /**
   * Render a Figma frame to a DOM element.
   *
   * @param nodes
   * @param renderedImages
   */
  render(
    nodes: readonly figma.Node[],
    renderedImages: Map<string, string>,
    backgroundColor?: figma.Color,
  ): void {
    this.clear();

    const bbox = new BoundingBoxMeasurement();

    const hitboxLayer = el("div", [className("fc-hitbox-layer")], []);

    for (const child of nodes) {
      for (const node of figma.walk(child)) {
        if (!figma.hasBoundingBox(node)) {
          continue;
        }

        bbox.addNode(node);

        const renderedImage = renderedImages.get(node.id);
        if (renderedImage) {
          const box = getRenderBoundingBox(node);

          const img = el("img", [
            attr("src", renderedImage),
            attr("alt", `Figma frame: ${node.name}`),
            className("fc-rendered-image"),
            style({
              left: box.x + "px",
              top: box.y + "px",
              width: box.width + "px",
              height: box.height + "px",
            }),
          ]);

          this.#canvas.appendChild(img);
        }

        const { x, y, width, height } = node.absoluteBoundingBox;

        const radius: {
          topLeft: number;
          topRight: number;
          bottomRight: number;
          bottomLeft: number;
        } = figma.hasRadius(node)
          ? {
              topLeft: node.cornerRadius,
              topRight: node.cornerRadius,
              bottomRight: node.cornerRadius,
              bottomLeft: node.cornerRadius,
            }
          : figma.hasRadii(node)
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

        const hitbox = el(
          "div",
          [
            className("fc-hitbox"),
            attr("data-node-id", node.id),
            style({
              top: y + "px",
              left: x + "px",
              width: width + "px",
              height: height + "px",
              "border-top-left-radius": radius.topLeft + "px",
              "border-top-right-radius": radius.topRight + "px",
              "border-bottom-right-radius": radius.bottomRight + "px",
              "border-bottom-left-radius": radius.bottomLeft + "px",
            }),
          ],
          [],
        );

        this.#hitboxToNodeMap.set(hitbox, node);

        hitboxLayer.appendChild(hitbox);
      }
    }

    const boundingRect = bbox.measure();

    requestAnimationFrame(() => {
      const viewportSize = this.#viewport.getBoundingClientRect();

      this.#scale =
        Math.min(
          viewportSize.width / boundingRect.width,
          viewportSize.height / boundingRect.height,
        ) * 0.75;

      this.#applyTransform();
    });

    if (backgroundColor) {
      const { r, g, b, a } = backgroundColor;
      this.#viewport.style.backgroundColor = `rgb(${(r * 0xff) | 0} ${
        (g * 0xff) | 0
      } ${(b * 0xff) | 0} / ${a})`;
    }

    this.#canvas.style.width = boundingRect.width + "px";
    this.#canvas.style.height = boundingRect.height + "px";

    hitboxLayer.style.width = boundingRect.width + "px";
    hitboxLayer.style.height = boundingRect.height + "px";

    this.#canvas.appendChild(hitboxLayer);

    this.#x = -boundingRect.x;
    this.#y = -boundingRect.y;

    const hoverGuideLayer = svg("g", [className("fc-guide-hover-layer")]);
    const hoverTooltipLayer = new TooltipLayer.TooltipLayer(
      svg("g", [className("fc-tooltip-hover-layer")]),
    );
    const selectionGuideLayer = svg("g", [
      className("fc-guide-selection-layer"),
    ]);
    const selectionTooltipLayer = new TooltipLayer.TooltipLayer(
      svg("g", [className("fc-tooltip-selection-layer")]),
    );

    this.#canvas.appendChild(
      svg(
        "svg",
        [
          className("fc-guide-canvas"),
          attr(
            "viewBox",
            [
              boundingRect.x,
              boundingRect.y,
              boundingRect.width,
              boundingRect.height,
            ].join(" "),
          ),
          style({
            left: boundingRect.x + "px",
            top: boundingRect.y + "px",
            width: boundingRect.width + "px",
            height: boundingRect.height + "px",
          }),
        ],
        [
          hoverGuideLayer,
          selectionGuideLayer,
          selectionTooltipLayer.container,
          hoverTooltipLayer.container,
        ],
      ),
    );

    // Draw guides on select
    effect(() => {
      const selected = this.#selected.get();

      selectionGuideLayer.replaceChildren();
      this.#drawGuide(selected, selectionGuideLayer);

      selectionTooltipLayer.clear();
      if (selected && figma.hasBoundingBox(selected)) {
        const {
          absoluteBoundingBox: { x, y, width, height },
        } = selected;

        selectionTooltipLayer.show(
          `${roundTo(width, this.#preferences.decimalPlaces)} × ${roundTo(
            height,
            this.#preferences.decimalPlaces,
          )}`,
          x + width * 0.5,
          y + height,
          TooltipLayer.BOTTOM,
        );
      }

      // Disable selected hitbox so a user can click backward elements with
      // exact same position/size.
      if (selected) {
        const hitbox = hitboxLayer.querySelector(
          `[data-node-id="${selected.id}"]`,
        );
        if (hitbox) {
          hitbox.setAttribute("data-select-mute", "");

          return () => {
            hitbox.removeAttribute("data-select-mute");
          };
        }
      }
    });

    // Draw guides on hover
    effect(() => {
      const selected = this.#selected.get();
      const hovered = this.#hovered.get();

      if (!hovered) {
        return;
      }

      hoverGuideLayer.replaceChildren();
      this.#drawGuide(hovered, hoverGuideLayer);

      if (selected) {
        hoverTooltipLayer.clear();
        this.#drawDistance(
          selected,
          hovered,
          hoverGuideLayer,
          hoverTooltipLayer,
        );
      }

      return () => {
        hoverGuideLayer.replaceChildren();
        hoverTooltipLayer.clear();
      };
    });

    // Change cursor based on drag state
    effect(() => {
      switch (this.#dragState.get()) {
        case DragState.Dragging: {
          document.body.style.cursor = "grabbing";

          return () => {
            document.body.style.cursor = "auto";
          };
        }
        case DragState.Idle: {
          document.body.style.cursor = "grab";

          return () => {
            document.body.style.cursor = "auto";
          };
        }
      }
    });

    this.#isActive = true;

    this.#applyTransform();
  }

  /**
   * Single-element update queue for viewport CSS transform.
   */
  #transformQueue: string | null = null;

  #applyTransform() {
    // Schedule an update for next frame.
    // Probably it's safe to schedule without `if` guard, but there is no reason
    // to push unnecessary no-op callbacks to the RAF queue.
    if (!this.#transformQueue) {
      requestAnimationFrame(() => {
        if (!this.#transformQueue) {
          return;
        }

        this.#canvas.style.transform = this.#transformQueue;
        this.#canvas.style.setProperty("--_scale", this.#scale.toPrecision(5));
        this.#transformQueue = null;
      });
    }

    // prettier-ignore
    // Prettier breaks down this into fucking ugly multiline code if we omit the above line,
    // but I don't wanna add an unnecessary runtime computation (`[...].join("\n")`)
    // just because source code is ugly. It seems newer Prettier versions changed this
    // behaviour so I should try it. Still no option to disable this feature, though.
    this.#transformQueue = `translate(-50%, -50%) scale(${this.#scale}) translate(${this.#x}px, ${this.#y}px)`;
  }

  /**
   * Clear the viewport.
   */
  clear(): void {
    this.#canvas.replaceChildren();
    this.#isActive = false;
  }

  /**
   * Reset the canvas state.
   * This method does not clear the canvas.
   */
  reset(): void {
    this.#x = 0;
    this.#y = 0;
    this.#scale = 1;

    this.#applyTransform();
  }

  #drawGuide(node: figma.Node | null, layer: SVGElement): void {
    if (!node || !figma.hasBoundingBox(node)) {
      return;
    }

    const { x, y, width, height } = node.absoluteBoundingBox;

    const radius: {
      topLeft: number;
      topRight: number;
      bottomRight: number;
      bottomLeft: number;
    } = figma.hasRadius(node)
      ? {
          topLeft: node.cornerRadius,
          topRight: node.cornerRadius,
          bottomRight: node.cornerRadius,
          bottomLeft: node.cornerRadius,
        }
      : figma.hasRadii(node)
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

    // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
    // [M] ... Move to
    // [L] ... Line to
    // [A] ... Arc to
    // [Z] ... Close path
    const moveTo = (tx: number, ty: number) => `M${x + tx},${y + ty}`;
    const lineTo = (tx: number, ty: number) => `L${x + tx},${y + ty}`;
    const arcTo = (r: number, tx: number, ty: number) =>
      `A${r},${r} 0 0 1 ${x + tx},${y + ty}`;

    const boxPath = [
      moveTo(radius.topLeft, 0),
      lineTo(width - radius.topRight, 0),
      arcTo(radius.topRight, width, radius.topRight),
      lineTo(width, height - radius.bottomRight),
      arcTo(radius.bottomRight, width - radius.bottomRight, height),
      lineTo(radius.bottomLeft, height),
      arcTo(radius.bottomLeft, 0, height - radius.bottomLeft),
      lineTo(0, radius.topLeft),
      arcTo(radius.topLeft, radius.topLeft, 0),
      "Z",
    ].join(" ");

    const guide = svg("path", [attr("d", boxPath)], []);

    layer.appendChild(guide);
  }

  #drawDistance(
    from: figma.Node,
    to: figma.Node,
    guideLayer: SVGElement,
    tooltipLayer?: TooltipLayer.TooltipLayer,
  ): void {
    if (!figma.hasBoundingBox(from) || !figma.hasBoundingBox(to)) {
      return;
    }

    const guides = getDistanceGuides(
      from.absoluteBoundingBox,
      to.absoluteBoundingBox,
    );

    guides.forEach(({ points, bisector }) => {
      const hl = Math.abs(points[0].x - points[1].x);
      const vl = Math.abs(points[0].y - points[1].y);

      if (hl === 0 && vl === 0) {
        return null;
      }

      guideLayer.appendChild(
        svg(
          "line",
          [
            attr("x1", points[0].x.toString()),
            attr("y1", points[0].y.toString()),
            attr("x2", points[1].x.toString()),
            attr("y2", points[1].y.toString()),
          ],
          [],
        ),
      );

      tooltipLayer?.show(
        roundTo(Math.max(hl, vl), this.#preferences.decimalPlaces).toString(10),
        hl > vl ? (points[0].x + points[1].x) * 0.5 : points[0].x,
        vl > hl ? (points[0].y + points[1].y) * 0.5 : points[0].y,
        hl > vl ? TooltipLayer.BOTTOM : TooltipLayer.RIGHT,
      );

      if (bisector) {
        guideLayer.appendChild(
          svg(
            "line",
            [
              attr("x1", bisector[0].x.toString()),
              attr("y1", bisector[0].y.toString()),
              attr("x2", bisector[1].x.toString()),
              attr("y2", bisector[1].y.toString()),
              style({
                "stroke-dasharray": "calc(4px / var(--_scale))",
              }),
              attr("shape-rendering", "geometricPrecision"),
            ],
            [],
          ),
        );
      }
    });
  }

  select(node: figma.Node | null): void {
    this.#selected.set(node);
  }

  connectedCallback() {
    document.addEventListener("keydown", this.#onKeyDown);
    document.addEventListener("keyup", this.#onKeyUp);
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.#onKeyDown);
    document.removeEventListener("keyup", this.#onKeyUp);
  }

  #onPointerDown = (ev: MouseEvent) => {
    if (this.#dragState.once() !== DragState.Idle) {
      return;
    }

    ev.preventDefault();
    ev.stopPropagation();

    this.#dragState.set(DragState.Dragging);
  };

  #onPointerUp = (ev: MouseEvent) => {
    if (this.#activeGestureTouches > 0) {
      this.#activeGestureTouches--;
      return;
    }

    ev.preventDefault();
    ev.stopPropagation();

    if (this.#dragState.once() !== DragState.Dragging) {
      const node =
        (ev.target &&
          ev.target instanceof Element &&
          this.#hitboxToNodeMap.get(ev.target)) ||
        null;

      this.select(node);

      return;
    }

    this.#dragState.set(DragState.Idle);
  };

  #onPointerMove = (ev: MouseEvent) => {
    // Performs pan when middle button is pressed or component is in Dragging state.
    //
    // 4 ... Auxiliary button (usually the mouse wheel button or middle button)
    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
    if (!(ev.buttons & 4 || this.#dragState.once() === DragState.Dragging)) {
      return;
    }

    ev.preventDefault();

    this.#x += ev.movementX / this.#scale;
    this.#y += ev.movementY / this.#scale;

    this.#applyTransform();
  };

  #onPointerOver = (ev: Event) => {
    if (!ev.target || !(ev.target instanceof Element)) {
      return;
    }

    const node = this.#hitboxToNodeMap.get(ev.target);
    if (!node) {
      return;
    }

    ev.stopPropagation();

    this.#hovered.set(node);
  };

  #onPointerLeave = (_ev: Event) => {
    this.#hovered.set(null);
  };

  #onWheel = (ev: WheelEvent) => {
    if (!this.#isActive) {
      return;
    }

    ev.preventDefault();

    if (ev.ctrlKey) {
      // Performs zoom when ctrl key is pressed.
      let { deltaY } = ev;

      switch (ev.deltaMode) {
        // DOM_DELTA_LINE
        case 1: {
          // Hard-coded because it's nearly impossible to obtain scroll amount in pixel
          // when UA uses DOM_DELTA_LINE (technically possible but it's too hacky and
          // comes with huge performance penalty).
          deltaY *= 15;
          break;
        }
        // DOM_DELTA_PAGE
        case 2: {
          // Honestly, I don't know how to deal with this one...
          // 100 because it's larger than 15 :)
          deltaY *= 100;
          break;
        }
      }

      const prevScale = this.#scale;

      // Clamp scale between MIN_ZOOM and MAX_ZOOM
      this.#scale = Math.max(
        MIN_ZOOM,
        Math.min(
          MAX_ZOOM,
          this.#scale *
            (1 - deltaY / ((1000 - this.#preferences.viewportZoomSpeed) * 0.5)),
        ),
      );

      // Calling layout-read method on every `wheel` event is not desirable.
      // While `getBoundingClientRect` in here runs immediately according to Chrome performance
      // profiler (Firefox profiler is hot garbage), not accessing layout-related
      // properties and methods is easy to estimate and optimise.
      // However, this call is necessary due to the stupid standard provides no way to
      // explicitly limit `wheel` event target and/or prevent `wheel` action happening from
      // a particular element, like `touch-action`. Because of this shitty situation,
      // the `offsetX` and `offsetY` change their value semantics ("where is the origin?"")
      // based on now-hovered element. So most of the time the origin point would be
      // `.fc-rendered-image`'s left-top point, not `.fc-viewport`'s one.
      // Subtracting boundingClientRect's x/y from `MouseEvent.clientX/Y` is the
      // simplest and most perfomant way to calculate "offsetX/Y for currentTarget" I can
      // think of. If there is a better way to compute a relative pointer position
      // inside `.fc-viewport` without perfomance compromise, you should rewrite these
      // logic and remove this comment to bring calm and peace to the project.
      const viewport = this.#viewport.getBoundingClientRect();

      const [offsetX, offsetY] =
        !ev.target || ev.target === ev.currentTarget
          ? [ev.offsetX, ev.offsetY]
          : [ev.clientX - viewport.x, ev.clientY - viewport.y];

      const pointerOffsetX = offsetX - viewport.width * 0.5;
      const pointerOffsetY = offsetY - viewport.height * 0.5;

      // Performs pan to archive "zoom at the pointer" behavior.
      this.#x += pointerOffsetX / this.#scale - pointerOffsetX / prevScale;
      this.#y += pointerOffsetY / this.#scale - pointerOffsetY / prevScale;
    } else {
      // Performs pan otherwise (to be close to native behavior)
      // Adjusting panSpeed in order to make panSpeed=500 to match to the Figma's one.
      const speed = this.#preferences.viewportPanSpeed * 0.002;

      this.#x -= (ev.deltaX * speed) / this.#scale;
      this.#y -= (ev.deltaY * speed) / this.#scale;
    }

    this.#applyTransform();
  };

  // Handles pan and zoom with keyboard shortcuts
  // arrow keys for pan and -/=(+) for zoom
  #handleKeyDownPanOrZoom = (ev: KeyboardEvent) => {
    if (
      !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "=", "-"].includes(
        ev.key,
      ) ||
      this.#dragState.get() === DragState.Disabled ||
      ev.ctrlKey
    ) {
      return;
    }

    ev.preventDefault();
    ev.stopPropagation();

    // Matches Figma's keyboard zoom behavior
    // Figma changes current scale to next/previous (in/out) power of two (including negative powers)
    if (ev.key === "=" || ev.key === "-") {
      this.#scale =
        ev.key === "="
          ? nextPowerOfTwo(this.#scale)
          : previousPowerOfTwo(this.#scale);
    } else {
      // Figma moves ~65px per keydown, 13 percent of the default viewport pan speed of 500 is 65px;
      const distance = this.#preferences.viewportPanSpeed * 0.13;

      this.#x +=
        ev.key === "ArrowLeft"
          ? distance
          : ev.key === "ArrowRight"
          ? -distance
          : 0;
      this.#y +=
        ev.key === "ArrowDown"
          ? -distance
          : ev.key === "ArrowUp"
          ? distance
          : 0;
    }

    this.#applyTransform();
  };

  #onKeyDown = (ev: KeyboardEvent) => {
    this.#handleKeyDownPanOrZoom(ev);

    if (ev.key !== FrameCanvas.DRAG_MODE_KEY) {
      return;
    }

    ev.preventDefault();
    ev.stopPropagation();

    if (this.#dragState.once() === DragState.Disabled) {
      this.#dragState.set(DragState.Idle);
    }
  };

  #onKeyUp = (ev: KeyboardEvent) => {
    if (ev.key !== FrameCanvas.DRAG_MODE_KEY) {
      return;
    }

    ev.preventDefault();
    ev.stopPropagation();

    this.#dragState.set(DragState.Disabled);
  };

  #onTouchStart = (ev: TouchEvent) => {
    const firstTouch = ev.touches.item(0);
    if (!firstTouch) {
      return;
    }

    if (this.#touchState.once() === TouchGestureState.Idle) {
      this.#touchState.set(TouchGestureState.Touching);
    }

    if (ev.touches.length >= 2) {
      this.#activeGestureTouches += ev.touches.length;

      const initialDist = getTouchAvgDist(ev.touches);
      if (initialDist === null) {
        return;
      }

      this.#touchingState.set({
        mode: TouchingStateModes.Scaling,
        initialScale: this.#scale,
        initialDist,
      });
      return;
    }

    this.#touchingState.set({
      mode: TouchingStateModes.Panning,
      initialTouch: firstTouch,
      initialX: this.#x,
      initialY: this.#y,
    });
  };

  #onTouchEnd = (ev: TouchEvent) => {
    if (this.#touchState.once() === TouchGestureState.Idle) {
      return;
    }

    switch (ev.touches.length) {
      case 0: {
        this.#touchState.set(TouchGestureState.Idle);
        this.#touchingState.set(null);
        return;
      }
      case 1: {
        this.#touchingState.set({
          mode: TouchingStateModes.Panning,
          initialTouch: ev.touches.item(0)!,
          initialX: this.#x,
          initialY: this.#y,
        });
        return;
      }
      case 2: {
        const initialDist = getTouchAvgDist(ev.touches);
        if (initialDist === null) {
          return;
        }

        this.#touchingState.set({
          mode: TouchingStateModes.Scaling,
          initialDist,
          initialScale: this.#scale,
        });
      }
    }
  };

  #onTouchCancel = () => {
    this.#touchState.set(TouchGestureState.Idle);
  };

  #onTouchMove = (ev: TouchEvent) => {
    if (this.#activeGestureTouches === 0) {
      this.#activeGestureTouches++;
    }

    if (this.#touchState.once() === TouchGestureState.Idle) {
      return;
    }

    const state = this.#touchingState.once();
    if (!state) {
      return;
    }

    if (state.mode === TouchingStateModes.Panning) {
      this.#x =
        state.initialX + (ev.touches[0].clientX - state.initialTouch.clientX);
      this.#y =
        state.initialY + (ev.touches[0].clientY - state.initialTouch.clientY);
      this.#applyTransform();
      return;
    }

    const dist = getTouchAvgDist(ev.touches);
    if (dist === null) {
      return;
    }

    this.#scale = state.initialScale * (dist / state.initialDist);
    this.#applyTransform();
  };
}

/**
 * Returns distance between a first touch and center point of every touches.
 */
function getTouchAvgDist(touches: TouchList): number | null {
  let px: number | null = null;
  let py: number | null = null;
  let tx: number = 0;
  let ty: number = 0;

  for (let i = 0, touch: Touch | null; (touch = touches.item(i)); i++) {
    if (px === null || py === null) {
      px = touch.clientX;
      py = touch.clientY;
    }

    tx += touch.clientX;
    ty += touch.clientY;
  }

  const l = touches.length;
  if (px === null || py === null || !l) {
    return null;
  }

  const cx = tx / l;
  const cy = ty / l;

  return Math.sqrt(Math.pow(px - cx, 2) + Math.pow(py - cy, 2));
}
