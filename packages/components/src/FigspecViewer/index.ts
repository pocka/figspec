import type * as Figma from "figma-js";

import {
  LitElement,
  TemplateResult,
  css,
  html,
  property,
  svg,
} from "lit-element";
import { styleMap } from "lit-html/directives/style-map";

import * as DistanceGuide from "./DistanceGuide";
import * as ErrorMessage from "./ErrorMessage";
import * as Node from "./Node";

import { PositionedMixin } from "./PositionedMixin";

type SizedNode = Extract<Figma.Node, { absoluteBoundingBox: any }>;

// TODO: Move docs for props in mixins (waiting for support at web-component-analyzer)
/**
 * A Figma spec viewer. Displays a rendered image alongside sizing guides.
 * @element figspec-viewer
 *
 * @property {number} [panX=0]
 * Current pan offset in px for X axis.
 * This is a "before the scale" value.
 *
 * @property {number} [panY=0]
 * Current pan offset in px for Y axis.
 * This is a "before the scale" value.
 *
 * @property {number} [scale=1]
 * Current zoom level, where 1.0 = 100%.
 *
 * @property {number} [zoomSpeed=500]
 * How fast zooming when do ctrl+scroll / pinch gestures.
 * Available values: 1 ~ 1000
 * @attr [zoom-speed=500] See docs for `zoomSpeed` property.
 *
 * @property {number} [panSpeed=500]
 * How fast panning when scroll vertically or horizontally.
 * This does not affect to dragging with middle button pressed.
 * Available values: 1 ~ 1000.
 * @attr [pan-speed=500] See docs for `panSpeed` property.
 *
 * @fires scalechange When a user zoom-in or zoom-out the preview.
 * @fires positionchange When a user panned the preview.
 */
export class FigspecViewer extends PositionedMixin(LitElement) {
  /**
   * A response of "GET file nodes" API.
   * https://www.figma.com/developers/api#get-file-nodes-endpoint
   */
  @property({
    type: Object,
  })
  nodes: Figma.FileNodesResponse | null = null;

  /**
   * An image rendered by "GET image" API.
   * https://www.figma.com/developers/api#get-images-endpoint
   */
  @property({
    type: String,
    attribute: "rendered-image",
  })
  renderedImage: string | null = null;

  /**
   * Current selected node.
   */
  @property({
    attribute: false,
  })
  selectedNode: SizedNode | null = null;

  /**
   * The minimum margin for the preview canvas. Will be used when the preview
   * setting a default zooming scale for the canvas.
   */
  @property({
    type: Number,
    attribute: "zoom-margin",
  })
  zoomMargin: number = 50;

  // Computed values. In order to avoid computing each time scale/pan, we
  // compute these values only when the source attributes has changed.
  #flattenedNodes?: ReturnType<typeof flattenNode>;
  #canvasMargin?: ReturnType<typeof getCanvasMargin>;

  constructor() {
    super();

    this.addEventListener("click", () => {
      this.selectedNode = null;
    });
  }

  static get styles() {
    return [
      css`
        :host {
          --bg: var(--figspec-viewer-bg, #666);
          --z-index: var(--figspec-viewer-z-index, 0);
          --error-bg: var(--figspec-viewer-error-bg, #870909);
          --error-fg: var(--figspec-viewer-error-fg, white);

          --guide-thickness: var(--figspec-viewer-guide-thickness, 1.5px);
          --guide-color: var(--figspec-viewer-guide-color, tomato);
          --guide-selected-color: var(
            --figspec-viewer-guide-selected-color,
            dodgerblue
          );
          --guide-tooltip-fg: var(--figspec-viewer-guide-tooltip-fg, white);
          --guide-selected-tooltip-fg: var(
            --figspec-viewer-guide-selected-tooltip-fg,
            white
          );
          --guide-tooltip-bg: var(
            --figspec-viewer-guide-tooltip-bg,
            var(--guide-color)
          );
          --guide-selected-tooltip-bg: var(
            --figspec-viewer-guide-selected-tooltip-bg,
            var(--guide-selected-color)
          );
          --guide-tooltip-font-size: var(
            --figspec-viewer-guide-tooltip-font-size,
            12px
          );

          position: relative;
          display: block;

          background-color: var(--bg);
          user-select: none;
          overflow: hidden;
          z-index: var(--z-index);
        }

        .canvas {
          position: absolute;
          top: 50%;
          left: 50%;
        }

        .rendered-image {
          position: absolute;
          top: 0;
          left: 0;
        }

        .guides {
          position: absolute;

          overflow: visible;
          stroke: var(--guide-color);
          fill: var(--guide-color);
          pointer-events: none;
          z-index: calc(var(--z-index) + 2);
        }
      `,
      Node.styles,
      ErrorMessage.styles,
      DistanceGuide.styles,
    ];
  }

  /** @private */
  get isMovable(): boolean {
    return !!(this.nodes && this.renderedImage && this.documentNode);
  }

  /**
   * Readonly. Document node (= root drawable node).
   * @readonly
   */
  get documentNode(): SizedNode | null {
    if (!this.nodes) {
      return null;
    }

    const documentNode = Object.values(this.nodes.nodes)[0];

    if (!documentNode || !("absoluteBoundingBox" in documentNode.document)) {
      return null;
    }

    return documentNode.document;
  }

  /**
   * @private
   */
  get parameterError(): TemplateResult | null {
    if (!this.nodes || !this.renderedImage) {
      return html`Both <code>nodes</code> and <code>rendered-image</code> are
        required.`;
    }

    if (!this.documentNode) {
      return html`Document node is empty or does not have size.`;
    }

    return null;
  }

  render() {
    if (this.parameterError) {
      return ErrorMessage.ErrorMessage({
        title: "Parameter error",
        children: this.parameterError,
      });
    }

    if (!this.#flattenedNodes || !this.#canvasMargin) {
      return ErrorMessage.ErrorMessage({
        title: "Computation Error",
        children: "Failed to calculate based on given inputs.",
      });
    }

    const documentNode = this.documentNode as SizedNode;
    const margin = this.#canvasMargin;

    const canvasSize = documentNode.absoluteBoundingBox;

    const { scale, panX, panY } = this;

    const reverseScale = 1 / scale;

    const guideThickness = `calc(var(--guide-thickness) * ${reverseScale})`;

    const computedGuideThickness = parseFloat(
      getComputedStyle(this).getPropertyValue("--guide-thickness")
    );

    const computedGuideTooltipFontSize = parseFloat(
      getComputedStyle(this).getPropertyValue("--guide-tooltip-font-size")
    );

    return html`
      <div
        class="canvas"
        style="
          width: ${canvasSize.width}px;
          height: ${canvasSize.height}px;

          transform: translate(-50%, -50%) scale(${scale}) translate(${panX}px, ${panY}px);
        "
      >
        <img
          class="rendered-image"
          src="${this.renderedImage}"
          style="
            margin-top: ${-margin.top}px;
            margin-left: ${-margin.left}px;
            width: ${canvasSize.width + margin.left + margin.right}px;
            height: ${canvasSize.height + margin.top + margin.bottom}px;
          "
        />

        ${this.selectedNode &&
        Node.Tooltip({
          nodeSize: this.selectedNode.absoluteBoundingBox,
          offsetX: -canvasSize.x,
          offsetY: -canvasSize.y,
          reverseScale,
        })}
        ${svg`
            <svg class="guides"
            viewBox="0 0 5 5"
            width="5"
            height="5"
            style=${styleMap({
              left: `${-canvasSize.x}px`,
              top: `${-canvasSize.y}px`,
              strokeWidth: guideThickness,
            })}
            >
              ${
                this.selectedNode &&
                svg`
                  <g data-selected>
                    ${Node.Outline({
                      node: this.selectedNode,
                      computedThickness: computedGuideThickness * reverseScale,
                    })}
                  </g>
                `
              }

              ${this.#flattenedNodes.map((node) => {
                if (node.id === this.selectedNode?.id) {
                  return null;
                }

                return svg`
                  <g>
                    ${Node.Outline({
                      node,
                      computedThickness: computedGuideThickness * reverseScale,
                      onClick: this.#handleNodeClick(node),
                    })}
                    ${
                      this.selectedNode &&
                      DistanceGuide.Guides({
                        node,
                        distanceTo: this.selectedNode,
                        reverseScale,
                        fontSize: computedGuideTooltipFontSize,
                      })
                    }
                  </g>
                `;
              })}
            </svg>
          `}
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();

    this.#resetZoom();
  }

  updated(changedProperties: Parameters<LitElement["updated"]>[0]) {
    super.updated(changedProperties);

    // Flatten a node tree and calculate outermost boundary rect,
    // then save these result.
    if (changedProperties.has("nodes")) {
      if (!this.documentNode) return;

      this.#flattenedNodes = flattenNode(this.documentNode);
      this.#canvasMargin = getCanvasMargin(
        this.documentNode,
        this.#flattenedNodes
      );

      // Since above properties aren't "attribute", their changes does not
      // trigger an update. We need to manually request an update.
      this.requestUpdate();
    }

    // Dispatch "nodeselect" event.
    if (changedProperties.has("selectedNode")) {
      /**
       * When a user selected / unselected a node.
       */
      this.dispatchEvent(
        new CustomEvent<{ selectedNode: Figma.Node | null }>("nodeselect", {
          detail: {
            selectedNode: this.selectedNode,
          },
        })
      );
    }
  }

  #handleNodeClick = (node: SizedNode) => (ev: MouseEvent) => {
    ev.preventDefault();
    ev.stopPropagation();

    this.selectedNode = node;
  };

  #resetZoom = () => {
    if (this.documentNode) {
      // Set initial zoom level based on element size
      const { width, height } = this.documentNode.absoluteBoundingBox;
      const {
        width: elementWidth,
        height: elementHeight,
      } = this.getBoundingClientRect();

      const wDiff = elementWidth / (width + this.zoomMargin * 2);
      const hDiff = elementHeight / (height + this.zoomMargin * 2);

      this.scale = Math.min(wDiff, hDiff, 1);
    }
  };
}

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

function getCanvasMargin(
  documentNode: SizedNode,
  nodes: readonly SizedNode[]
): Margin {
  const points = nodes.map((node) => {
    if (!("effects" in node)) {
      return {
        top: node.absoluteBoundingBox.y,
        right: node.absoluteBoundingBox.x + node.absoluteBoundingBox.width,
        bottom: node.absoluteBoundingBox.y + node.absoluteBoundingBox.height,
        left: node.absoluteBoundingBox.x,
      };
    }

    const blurRadiuses = node.effects
      .filter((effect) => effect.visible && effect.type === "LAYER_BLUR")
      .map((effect) => effect.radius);

    const shadowMargins = node.effects
      .filter(
        (
          effect
        ): effect is Figma.Effect & {
          offset: NonNullable<Figma.Effect["offset"]>;
        } => effect.visible && effect.type === "DROP_SHADOW" && !!effect.offset
      )
      .map<Margin>((effect) => {
        return {
          left: effect.radius - effect.offset.x,
          top: effect.radius - effect.offset.y,
          right: effect.radius + effect.offset.x,
          bottom: effect.radius + effect.offset.y,
        };
      });

    const margin: Margin = {
      top: Math.max(
        0,
        ...blurRadiuses,
        ...shadowMargins.map((margin) => margin.top)
      ),
      right: Math.max(
        0,
        ...blurRadiuses,
        ...shadowMargins.map((margin) => margin.right)
      ),
      bottom: Math.max(
        0,
        ...blurRadiuses,
        ...shadowMargins.map((margin) => margin.bottom)
      ),
      left: Math.max(
        0,
        ...blurRadiuses,
        ...shadowMargins.map((margin) => margin.left)
      ),
    };

    return {
      top: node.absoluteBoundingBox.y - margin.top,
      right:
        node.absoluteBoundingBox.x +
        node.absoluteBoundingBox.width +
        margin.right,
      bottom:
        node.absoluteBoundingBox.y +
        node.absoluteBoundingBox.height +
        margin.bottom,
      left: node.absoluteBoundingBox.x - margin.left,
    };
  });

  const bounds = {
    top: Math.min(...points.map((p) => p.top)),
    right: Math.max(...points.map((p) => p.right)),
    bottom: Math.max(...points.map((p) => p.bottom)),
    left: Math.min(...points.map((p) => p.left)),
  };

  return {
    top: documentNode.absoluteBoundingBox.y - bounds.top,
    right:
      bounds.right -
      documentNode.absoluteBoundingBox.x -
      documentNode.absoluteBoundingBox.width,
    bottom:
      bounds.bottom -
      documentNode.absoluteBoundingBox.y -
      documentNode.absoluteBoundingBox.height,
    left: documentNode.absoluteBoundingBox.x - bounds.left,
  };
}

function flattenNode(
  node: Figma.Node,
  depth: number = 0
): readonly (SizedNode & {
  depth: number;
})[] {
  if (!("absoluteBoundingBox" in node)) {
    return node.children.map((child) => flattenNode(child, depth + 1)).flat();
  }

  if (!("children" in node) || node.children.length === 0) {
    return [{ ...node, depth }];
  }

  return [
    { ...node, depth },
    ...node.children.map((child) => flattenNode(child, depth + 1)).flat(),
  ];
}
