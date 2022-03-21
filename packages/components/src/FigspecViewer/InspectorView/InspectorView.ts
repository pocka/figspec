import { css, html } from "lit";

import {
  HorizontalPaddingIcon,
  VerticalPaddingIcon,
  CloseIcon,
  CopyIcon,
} from "../Icons";
import { FigmaNode, getStyleRule, NodeStyles } from "./utils";
import type { CSSRule } from "./utils";

const copy = async (text: string) => {
  await navigator.clipboard.writeText(text);
};

export type InspectorViewProps = {
  node: FigmaNode;
  onClose: () => void;
};

export const View = ({ node, onClose }: InspectorViewProps) => {
  if (!node) {
    return null;
  }

  const nodeStyles = new NodeStyles(node);

  // In order to disable canvas interactions (e.g. pan, click to
  // deselect), we need to cancel JavaScript event propagation
  // on the root element.
  const stopPropagation = (ev: Event) => ev.stopPropagation();

  return html`
    <div
      class="inspector-view"
      @click=${stopPropagation}
      @wheel=${stopPropagation}
      @keydown=${stopPropagation}
      @keyup=${stopPropagation}
      @pointermove=${stopPropagation}
    >
      <div class="inspector-section selectable-content">
        <div class="title-section">
          <h4>${node.name}</h4>
          ${CloseIcon({ onClick: onClose })}
        </div>
        <div class="properties-overview">
          <div class="title-section">
            <p class="inspector-property">
              <span>W: </span>${nodeStyles.width}
            </p>
            <p class="inspector-property" style="margin-left: 16px;">
              <span>H: </span>${nodeStyles.height}
            </p>
          </div>
          ${nodeStyles.fontPostScriptName
            ? html`<p class="inspector-property">
                <span>Font:</span>
                ${nodeStyles.fontPostScriptName}
              </p>`
            : null}
        </div>
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
            <p class="node-content code-section selectable-content">
              ${node.characters}
            </p>
          </div>`
        : null}
      ${StylesSection(nodeStyles)}
    </div>
  `;
};

export const StylesSection = (nodeStyles: NodeStyles) => {
  const onClick = () => copy(nodeStyles.getStyleSheet());
  const styles = nodeStyles.getStyles();

  return html`<div class="inspector-section">
    <div class="title-section style-section">
      <h4>CSS</h4>
      ${CopyIcon({ onClick })}
    </div>
    <div class="code-section selectable-content">
      ${styles.map(CSSProperty)}
    </div>
  </div>`;
};

const CSSProperty = (cssProperty: CSSRule) => {
  const { property, value, color } = cssProperty;
  let coloredSquare = null;
  switch (property) {
    case "background":
    case "fill":
    case "border":
    case "box-shadow":
    case "color":
      coloredSquare = html`<span
        class="color-preview"
        style="background-color: ${color}"
      ></span>`;
      break;
    case "background-image":
      coloredSquare = html`<span
        class="color-preview"
        style="background-image: ${value}"
      ></span>`;
      break;
  }

  return html`<div class="css-property" @click=${() =>
    copy(getStyleRule(cssProperty))}>
    <span>${property}:</span>${coloredSquare}<span class="css-value">${value}</span>;</span>
  </div>`;
};

export const styles = css`
  .inspector-view {
    height: 100%;
    width: 300px;
    position: absolute;
    right: 0;
    background: white;
    border-left: 1px solid #ccc;
    overflow-y: auto;
    z-index: calc(var(--z-index) + 2);
  }

  .inspector-view h4 {
    font-size: 16px;
    margin: 0;
  }

  .style-section {
    margin-bottom: 12px;
  }

  .title-section {
    display: flex;
    align-items: center;
  }

  .code-section {
    padding: 8px;
    background: #f3f3f3;
    font-family: monospace;
  }

  .title-section svg {
    cursor: pointer;
    margin-left: auto;
  }

  .inspector-section {
    padding: 16px;
    border-bottom: 1px solid #eee;
  }

  .properties-overview {
    font-family: monospace;
    color: #518785;
  }

  .properties-overview p span {
    color: #121212;
  }

  .inspector-property {
    display: flex;
    align-items: center;
    margin-bottom: 0;
  }

  .inspector-property span {
    color: #b3b3b3;
    margin-right: 4px;
  }

  .inspector-property svg {
    margin-right: 8px;
  }

  .css-property {
    margin: 8px;
    transition: background-color ease-in-out 100ms;
  }

  .css-property:hover {
    cursor: pointer;
    background-color: #e8e8e8;
  }

  .css-value {
    color: #518785;
    margin-left: 4px;
  }

  .color-preview {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 1px solid #ccc;
    margin-left: 4px;
    vertical-align: middle;
  }

  .selectable-content {
    cursor: text;
    user-select: text;
  }
`;
