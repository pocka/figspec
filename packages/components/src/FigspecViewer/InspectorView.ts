import { css, html } from "lit-element";
import {
  BorderRadiusIcon,
  HorizontalPaddingIcon,
  VerticalPaddingIcon,
} from "./Icons";

export interface FigmaNode {
  name: string;
  backgroundColor: {
    a: number;
    r: number;
    g: number;
    b: number;
  };
  absoluteBoundingBox: {
    height: number;
    width: number;
  };
  cornerRadius?: number;
  rectangleCornerRadii?: number[];
  horizontalPadding: number;
  verticalPadding: number;
  style?: {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    lineHeightPx: number;
    textAlignHorizontal: string;
    textAlignVertical: string;
  };
  type: "TEXT" | "INSTANCE" | "FRAME" | "VECTOR" | "RECTANGLE";
}

export const View = (node: FigmaNode) => {
  if (!node) {
    return null;
  }

  let borderRadius;
  if (node.rectangleCornerRadii) {
    borderRadius =
      node.rectangleCornerRadii.filter((radius) => radius === node.cornerRadius)
        .length < 4
        ? node.rectangleCornerRadii.join("px, ")
        : node.cornerRadius;
  }

  return html`
    <div class="inspector-view">
      <div class="inspector-section">
        <h4>${node.name}</h4>
      </div>
      <div class="inspector-section">
        <h4>Properties</h4>
        <p class="inspector-property">W: ${node.absoluteBoundingBox.width}px</p>
        <p class="inspector-property">
          H: ${node.absoluteBoundingBox.height}px
        </p>
        ${borderRadius &&
        html`<p class="inspector-property">
          ${BorderRadiusIcon()} ${borderRadius}px
        </p>`}
      </div>
      ${(node.horizontalPadding || node.verticalPadding) &&
      html`<div class="inspector-section">
        <h4>Layout</h4>
        <p class="inspector-property">
          ${HorizontalPaddingIcon()} ${node.horizontalPadding}px
        </p>
        <p class="inspector-property">
          ${VerticalPaddingIcon()} ${node.verticalPadding}px
        </p>
      </div>`}
      ${node.style &&
      html`<div class="inspector-section">
        <h4>Text</h4>
        <p>Font-family: ${node.style.fontFamily}</p>
        <p>Font size: ${node.style.fontSize}</p>
        <p>Font weight: ${node.style.fontWeight}</p>
      </div>`}
    </div>
  `;
};

export const styles = css`
  .inspector-view {
    height: 100vh;
    width: 300px;
    position: fixed;
    right: 0;
    background: white;
    border-left: 1px solid #ccc;
  }

  .inspector-section {
    padding: 1rem;
    border-bottom: 1px solid #ccc;
  }

  .inspector-section h4 {
    margin: 0;
  }

  .inspector-property {
    display: flex;
    align-items: center;
    margin-bottom: 0;
  }

  .inspector-property svg {
    margin-right: 8px;
  }
`;
