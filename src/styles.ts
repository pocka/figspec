import { styles as uiStyles } from "./ui/styles";

const commonHostStyles = /* css */ `
  :host {
    /*
      Palette from: https://yeun.github.io/open-color/
      https://github.com/yeun/open-color/blob/3a716ee1f5ff5456db33cb8a6e964afdca1e7bc3/LICENSE
    */
    --color-gray-0: 248 249 250;
    --color-gray-1: 241 243 245;
    --color-gray-2: 233 236 239;
    --color-gray-3: 222 226 230;
    --color-gray-5: 173 181 189;
    --color-gray-6: 134 142 150;
    --color-gray-7: 73 80 87;
    --color-gray-8: 52 58 64;
    --color-gray-9: 33 37 41;
    --color-red-4: 255 135 135;
    --color-red-9: 201 42 42;
    --color-grape-3: 229 153 247;
    --color-grape-8: 156 54 181;
    --color-blue-9: 24 100 171;
    --color-cyan-3: 102 217 232;
    --color-cyan-8: 12 133 153;
    --color-green-3: 140 233 154;
    --color-green-8: 47 158 68;
    --color-yellow-2: 255 236 153;
    --color-orange-8: 232 89 12;
    --color-orange-9: 217 72 15;

    /* Typography */
    --font-family-sans: var(--figspec-font-family-sans, system-ui, ui-sans-serif, sans-serif);
    --font-family-mono: var(--figspec-font-family-mono, monospace);
    --font-size: var(--figspec-font-size, 1rem);

    /* Action */
    --default-action-overlay: rgb(var(--color-gray-8) / 0.1);
    --default-action-border: rgb(var(--color-gray-5) / 0.5);
    --default-action-horizontal-padding: 6px;
    --default-action-vertical-padding: 4px;

    --action-overlay: var(--figspec-action-overlay, var(--default-action-overlay));
    --action-border: var(--figspec-action-border, var(--default-action-border));
    --action-horizontal-padding: var(--figspec-action-horizontal-padding, var(--default-action-horizontal-padding));
    --action-vertical-padding: var(--figspec-action-vertical-padding, var(--default-action-vertical-padding));
    --action-radius: var(--figspec-action-radius, 4px);

    /* Canvas */
    --default-canvas-bg: #e5e5e5;

    --canvas-bg: var(--figspec-canvas-bg, var(--default-canvas-bg));

    /* Base styles */
    --default-fg: rgb(var(--color-gray-9));
    --default-bg: rgb(var(--color-gray-0));
    --default-subtle-fg: rgb(var(--color-gray-7));
    --default-success-fg: rgb(var(--color-green-8));
    --default-error-fg: rgb(var(--color-red-9));

    --fg: var(--figspec-fg, var(--default-fg));
    --bg: var(--figspec-bg, var(--default-bg));
    --subtle-fg: var(--figspec-subtle-fg, var(--default-subtle-fg));
    --success-fg: var(--figspec-success-fg, var(--default-success-fg));
    --error-fg: var(--figspec-error-fg, var(--default-error-fg));
    --z-index: var(--figspec-viewer-z-index, 0);

    /* Code, syntax highlighting */
    /* https://yeun.github.io/open-color/ */
    --default-code-bg: rgb(var(--color-gray-2));
    --default-code-text: rgb(var(--color-gray-9));
    --default-code-keyword: rgb(var(--color-grape-8));
    --default-code-string: rgb(var(--color-green-8));
    --default-code-number: rgb(var(--color-cyan-8));
    --default-code-list: rgb(var(--color-gray-6));
    --default-code-comment: rgb(var(--color-gray-5));
    --default-code-literal: var(--default-code-number);
    --default-code-function: var(--default-code-keyword);
    --default-code-unit: rgb(var(--color-orange-8));

    --code-bg: var(--figspec-code-bg, var(--default-code-bg));
    --code-text: var(--figspec-code-text, var(--default-code-text));
    --code-keyword: var(--figspec-code-keyword, var(--default-code-keyword));
    --code-string: var(--figspec-code-string, var(--default-code-string));
    --code-number: var(--figspec-code-number, var(--default-code-number));
    --code-list: var(--figspec-code-list, var(--default-code-list));
    --code-comment: var(--figspec-code-comment, var(--default-code-comment));
    --code-literal: var(--figspec-code-literal, var(--default-code-literal));
    --code-function: var(--figspec-code-function, var(--default-code-function));
    --code-unit: var(--figspec-code-unit, var(--default-code-unit));

    /* Panel */
    --panel-border: 1px solid rgb(var(--color-gray-5) / 0.5);
    --panel-radii: 2px;

    --guide-thickness: var(--figspec-guide-thickness, 1.5px);
    --guide-color: var(--figspec-guide-color, rgb(var(--color-orange-9)));
    --guide-selected-color: var(
      --figspec-guide-selected-color,
      rgb(var(--color-blue-9))
    );
    --guide-tooltip-fg: var(--figspec-guide-tooltip-fg, rgb(var(--color-gray-0)));
    --guide-selected-tooltip-fg: var(
      --figspec-guide-selected-tooltip-fg,
      rgb(var(--color-gray-0))
    );
    --guide-tooltip-bg: var(
      --figspec-guide-tooltip-bg,
      var(--guide-color)
    );
    --guide-selected-tooltip-bg: var(
      --figspec-guide-selected-tooltip-bg,
      var(--guide-selected-color)
    );
    --guide-tooltip-font-size: var(
      --figspec-guide-tooltip-font-size,
      calc(var(--font-size) * 0.8)
    );

    position: relative;
    display: block;
    font-size: var(--font-size);
    font-family: var(--font-family-sans);

    background-color: var(--bg);
    color: var(--fg);
    user-select: none;
    overflow: hidden;
    z-index: var(--z-index);
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --default-action-overlay: rgb(var(--color-gray-0) / 0.15);

      --default-fg: rgb(var(--color-gray-0));
      --default-bg: rgb(var(--color-gray-9));
      --default-subtle-fg: rgb(var(--color-gray-5));
      --default-success-fg: rgb(var(--color-green-3));
      --default-error-fg: rgb(var(--color-red-4));

      --default-code-bg: rgb(var(--color-gray-8));
      --default-code-text: rgb(var(--color-gray-1));
      --default-code-keyword: rgb(var(--color-grape-3));
      --default-code-string: rgb(var(--color-green-3));
      --default-code-number: rgb(var(--color-cyan-3));
      --default-code-list: rgb(var(--color-gray-3));
      --default-code-comment: rgb(var(--color-gray-6));
      --default-code-unit: rgb(var(--color-yellow-2));
    }
  }

  @media (pointer: coarse) {
    :host {
      --default-action-horizontal-padding: 8px;
      --default-action-vertical-padding: 6px;
    }
  }
`;

export const styles = commonHostStyles + uiStyles;
