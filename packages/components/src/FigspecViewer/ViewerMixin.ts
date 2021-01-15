import type * as Figma from "figma-js";
import {
  LitElement,
  css,
  html,
  svg,
  property,
  TemplateResult,
} from "lit-element";
import { styleMap } from "lit-html/directives/style-map";

import { Constructor, extendStyles, SizedNode } from "./utils";

import { INodeSelectable, NodeSelectableMixin } from "./NodeSelectableMixin";
import { Positioned, PositionedMixin } from "./PositionedMixin";

import * as DistanceGuide from "./DistanceGuide";
import * as InspectorView from "./InspectorView/InspectorView";
import type { FigmaNode } from "./InspectorView/utils";
import * as ErrorMessage from "./ErrorMessage";
import * as Node from "./Node";

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface IViewer {
  zoomMargin: number;

  /**
   * A record of rendered images.
   * Key is an id of the node.
   * Value is an URL of the rendered image.
   */
  __images: Record<string, string>;

  readonly error?: string | TemplateResult | Error | null;

  __updateTree(node: Figma.Node): void;
  __updateEffectMargins(): void;
  resetZoom(): void;
}

export const ViewerMixin = <T extends Constructor<LitElement>>(
  superClass: T
): T & Constructor<IViewer & INodeSelectable & Positioned> => {
  class Viewer extends NodeSelectableMixin(PositionedMixin(superClass)) {
    @property({
      type: Number,
      attribute: "zoom-margin",
    })
    zoomMargin: number = 50;

    static get styles() {
      // @ts-ignore
      const styles = super.styles;

      return extendStyles(styles, [
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

          .spec-canvas-wrapper {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
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
        InspectorView.styles,
      ]);
    }

    get __images(): Record<string, string> {
      return {};
    }

    // Cached values
    #canvasSize?: Figma.Rect;
    #effectMargins?: Record<string, Margin>;
    #flattenedNodes?: readonly SizedNode[];

    constructor(...args: any[]) {
      super(...args);
    }

    deselectNode() {
      this.selectedNode = null;
    }

    get error(): string | Error | null | TemplateResult | undefined {
      if (!this.#canvasSize || !this.#flattenedNodes) {
        return ErrorMessage.ErrorMessage({
          title: "Error",
          children:
            "Please call `__updateTree/1` method with a valid parameter.",
        });
      }

      return null;
    }

    render() {
      if (this.error) {
        if (this.error instanceof Error) {
          return ErrorMessage.ErrorMessage({
            title: this.error.name || "Error",
            children: this.error.message,
          });
        }

        if (typeof this.error === "string") {
          return ErrorMessage.ErrorMessage({
            title: "Error",
            children: this.error,
          });
        }

        return this.error;
      }

      const canvasSize = this.#canvasSize!;

      const reverseScale = 1 / this.scale;

      const guideThickness = `calc(var(--guide-thickness) * ${reverseScale})`;

      const computedGuideThickness = parseFloat(
        getComputedStyle(this).getPropertyValue("--guide-thickness")
      );

      const computedGuideTooltipFontSize = parseFloat(
        getComputedStyle(this).getPropertyValue("--guide-tooltip-font-size")
      );

      return html`
        <div class="spec-canvas-wrapper" @click=${this.deselectNode}>
          <div
            class="canvas"
            style="
          width: ${canvasSize.width}px;
          height: ${canvasSize.height}px;

          transform: translate(-50%, -50%) ${this.canvasTransform.join(" ")}
        "
          >
            ${Object.entries(this.__images).map(([nodeId, uri]) => {
              const node = this.#getNodeById(nodeId);

              if (
                !node ||
                !("absoluteBoundingBox" in node) ||
                !this.#effectMargins?.[node.id]
              ) {
                return null;
              }

              const margin = this.#effectMargins[node.id];

              return html`
                <img class="rendered-image" src="${uri}"
                style=${styleMap({
                  top: `${node.absoluteBoundingBox.y - canvasSize.y}px`,
                  left: `${node.absoluteBoundingBox.x - canvasSize.x}px`,
                  marginTop: `${-margin.top}px`,
                  marginLeft: `${-margin.left}px`,
                  width:
                    node.absoluteBoundingBox.width +
                    margin.left +
                    margin.right +
                    "px",
                  height:
                    node.absoluteBoundingBox.height +
                    margin.top +
                    margin.bottom +
                    "px",
                })}"
                " />
              `;
            })}
            ${this.selectedNode &&
            Node.Tooltip({
              nodeSize: this.selectedNode.absoluteBoundingBox,
              offsetX: -canvasSize.x,
              offsetY: -canvasSize.y,
              reverseScale,
            })}
            ${svg`
            <svg
              class="guides"
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
                Node.Outline({
                  node: this.selectedNode,
                  selected: true,
                  computedThickness: computedGuideThickness * reverseScale,
                })
              }

              ${this.#flattenedNodes!.map((node) => {
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
          ${InspectorView.View({
            node: this.selectedNode as FigmaNode,
            onClose: this.deselectNode,
          })}
        </div>
      `;
    }

    connectedCallback() {
      super.connectedCallback();

      this.resetZoom();
    }

    updated(changedProperties: Parameters<LitElement["updated"]>[0]) {
      super.updated(changedProperties);
    }

    __updateTree(node: Figma.Node) {
      if (
        !(
          node.type === "CANVAS" ||
          node.type === "FRAME" ||
          node.type === "COMPONENT"
        )
      ) {
        throw new Error(
          "Cannot update node tree: Top level node MUST be one of CANVAS, FRAME, or COMPONENT"
        );
      }

      this.#canvasSize =
        node.type === "CANVAS" ? getCanvasSize(node) : node.absoluteBoundingBox;

      this.#flattenedNodes = flattenNode(node);

      // Since above properties aren't "attribute", their changes does not
      // trigger an update. We need to manually request an update.
      this.requestUpdate();
    }

    __updateEffectMargins() {
      if (!this.__images) {
        return;
      }

      const containers = Object.keys(this.__images)
        .map(this.#getNodeById)
        .filter((n): n is NonNullable<typeof n> => !!n);

      this.#effectMargins = containers.reduce<Record<string, Margin>>(
        (margin, node) => {
          if (!("absoluteBoundingBox" in node)) {
            return margin;
          }

          return {
            ...margin,
            [node.id]: getEffectMargin(node, flattenNode(node)),
          };
        },
        {}
      );

      this.requestUpdate();
    }

    resetZoom() {
      if (this.#canvasSize) {
        // Set initial zoom level based on element size
        const { width, height } = this.#canvasSize;
        const {
          width: elementWidth,
          height: elementHeight,
        } = this.getBoundingClientRect();

        const wDiff = elementWidth / (width + this.zoomMargin * 2);
        const hDiff = elementHeight / (height + this.zoomMargin * 2);

        this.scale = Math.min(wDiff, hDiff, 1);
      }
    }

    #handleNodeClick = (node: SizedNode) => (ev: MouseEvent) => {
      ev.preventDefault();
      ev.stopPropagation();

      this.selectedNode = node;
    };

    #getNodeById = (id: string): Figma.Node | null => {
      return this.#flattenedNodes?.find((n) => n.id === id) ?? null;
    };
  }

  return Viewer;
};

function getCanvasSize(node: Figma.Canvas): Figma.Rect {
  const left: number[] = [];
  const right: number[] = [];
  const top: number[] = [];
  const bottom: number[] = [];

  for (const child of node.children) {
    if (child.type !== "FRAME" && child.type !== "COMPONENT") {
      continue;
    }

    const { x, y, width, height } = child.absoluteBoundingBox;

    left.push(x);
    right.push(x + width);
    top.push(y);
    bottom.push(y + height);
  }

  const minX = Math.min(...left);
  const minY = Math.min(...top);

  return {
    x: minX,
    y: minY,
    width: Math.abs(Math.max(...right) - minX),
    height: Math.abs(Math.min(...bottom) - minY),
  };
}

function getEffectMargin(
  container: SizedNode,
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
    top: container.absoluteBoundingBox.y - bounds.top,
    right:
      bounds.right -
      container.absoluteBoundingBox.x -
      container.absoluteBoundingBox.width,
    bottom:
      bounds.bottom -
      container.absoluteBoundingBox.y -
      container.absoluteBoundingBox.height,
    left: container.absoluteBoundingBox.x - bounds.left,
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
