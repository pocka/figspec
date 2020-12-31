import { css, html } from "lit-element";
import * as Figma from "figma-js";
import * as copy from "copy-to-clipboard";

import {
  BorderRadiusIcon,
  HorizontalPaddingIcon,
  VerticalPaddingIcon,
  CloseIcon,
  CopyIcon,
} from "./Icons";

type Color = {
  a: number;
  r: number;
  g: number;
  b: number;
};

export type FigmaNode = Figma.Node & {
  name: string;
  characters: string;
  background: { color: Color }[];
  backgroundColor: Color;
  fills: { color: Color }[];
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
};

export type InspectorViewProps = {
  node: FigmaNode;
  onClose: () => void;
};

/**
 * Figma returns rbg in values from 0 to 1. We multiply by 255 and truncate them
 * https://www.figma.com/plugin-docs/api/RGB/
 */
const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }) =>
  "#" +
  (
    (1 << 24) +
    (Math.trunc(255 * r) << 16) +
    (Math.trunc(255 * g) << 8) +
    Math.trunc(255 * b)
  )
    .toString(16)
    .slice(1);

class NodeStyles {
  background;
  borderRadius;
  color;
  fontFamily;
  fontSize;
  fontWeight;
  height;
  horizontalPadding;
  lineHeight;
  verticalPadding;
  width;

  hasStyles = false;
  hasPadding = false;

  constructor(node: FigmaNode) {
    this.height = `${Math.trunc(node.absoluteBoundingBox.height)}px`;
    this.width = `${Math.trunc(node.absoluteBoundingBox.width)}px`;

    if (node.horizontalPadding || node.verticalPadding) {
      this.hasPadding = true;
      this.horizontalPadding = `${node.horizontalPadding}px`;
      this.verticalPadding = `${node.verticalPadding}px`;
    }

    if (node.style) {
      this.fontFamily = node.style.fontFamily;
      this.fontWeight = node.style.fontWeight;
      this.fontSize = `${node.style.fontSize}px`;
      this.lineHeight = `${Math.trunc(node.style.lineHeightPx)}px`;
    }

    if (node.rectangleCornerRadii) {
      this.borderRadius =
        node.rectangleCornerRadii.filter(
          (radius) => radius === node.cornerRadius
        ).length < 4
          ? `${node.rectangleCornerRadii.join("px, ")}px`
          : `${node.cornerRadius}px`;
    }

    if (node.backgroundColor || node.backgroundColor) {
      const colors =
        node.backgroundColor ||
        node.background?.[0].color ||
        node.fills?.[0].color;
      this.background = rgbToHex(colors);
    }

    if (node.fills && node.fills.length > 0) {
      this.color = rgbToHex(node.fills[0].color);
    }

    this.hasStyles = !!(
      node.style ||
      node.rectangleCornerRadii ||
      this.background ||
      this.color
    );
  }

  getStyles() {
    return [
      this.height && `height: ${this.height};`,
      this.width && `width: ${this.width};`,
      this.fontFamily && `font-family: ${this.fontFamily};`,
      this.fontSize && `font-size: ${this.fontSize};`,
      this.fontWeight && `font-weight: ${this.fontWeight};`,
      this.lineHeight && `line-height: ${this.lineHeight};`,
      this.borderRadius && `border-radius: ${this.borderRadius};`,
      this.background && `background: ${this.background};`,
      this.color && `color: ${this.color};`,
    ].filter(Boolean) as string[];
  }

  copyStyleSheet() {
    copy(this.getStyles().join("\n"));
  }
}

export const View = ({ node, onClose }: InspectorViewProps) => {
  if (!node) {
    return null;
  }

  const nodeStyles = new NodeStyles(node);

  return html`
    <div class="inspector-view">
      <div class="inspector-section title-section">
        <h4>${node.name}</h4>
        ${CloseIcon({ onClick: onClose })}
      </div>
      <div class="inspector-section">
        <h4>Properties</h4>
        <p class="inspector-property">W: ${nodeStyles.width}</p>
        <p class="inspector-property">H: ${nodeStyles.height}</p>
        ${nodeStyles.borderRadius
          ? html`<p class="inspector-property">
              ${BorderRadiusIcon()} ${nodeStyles.borderRadius}
            </p>`
          : null}
      </div>
      ${nodeStyles.hasPadding
        ? html`<div class="inspector-section">
            <h4>Layout</h4>
            ${nodeStyles.horizontalPadding &&
            html`<p class="inspector-property">
              ${HorizontalPaddingIcon()} ${nodeStyles.horizontalPadding}
            </p>`}
            ${nodeStyles.verticalPadding &&
            html`<p class="inspector-property">
              ${VerticalPaddingIcon()} ${nodeStyles.verticalPadding}
            </p>`}
          </div>`
        : null}
      ${node.characters
        ? html`<div class="inspector-section">
            <div class="title-section">
              <h4>Content</h4>
              ${CopyIcon({ onClick: () => copy(node.characters) })}
            </div>
            <p class="node-content node-code">${node.characters}</p>
          </div>`
        : null}
      ${nodeStyles.hasStyles ? StylesSection(nodeStyles) : null}
    </div>
  `;
};

export const StylesSection = (nodeStyles: NodeStyles) => {
  const onClick = () => nodeStyles.copyStyleSheet();
  const styles = nodeStyles.getStyles();

  return html`<div class="inspector-section">
    <div class="title-section style-section">
      <h4>CSS</h4>
      ${CopyIcon({ onClick })}
    </div>
    <div class="node-code">
      ${styles.map(
        (style) =>
          html`<p class="css-property" @click=${() => copy(style)}>${style}</p>`
      )}
    </div>
  </div> `;
};

export const styles = css`
  .css-property:hover {
    cursor: pointer;
    background-color: #e8e8e8;
  }

  .style-section {
    padding: 1rem 0;
  }

  .title-section {
    display: flex;
    align-items: center;
  }

  .title-section svg {
    cursor: pointer;
    margin-left: auto;
  }

  .node-content {
    cursor: text;
    user-select: text;
  }

  .node-code {
    padding: 0.5rem;
    background: #f3f3f3;
    font-family: monospace;
  }

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
