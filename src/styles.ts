import { styles as uiStyles } from "./ui/styles.js";

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

    /* Spacing */
    --spacing-base: var(--figspec-spacing-base, 10px);
    --spacing-scale: var(--figspec-spacing-scale, 1.25);

    --spacing_0: var(--figspec-spacing_0, var(--spacing-base));
    --spacing_1: var(--figspec_spacing_1, calc(var(--spacing_0) * var(--spacing-scale)));
    --spacing_2: var(--figspec_spacing_2, calc(var(--spacing_1) * var(--spacing-scale)));
    --spacing_3: var(--figspec_spacing_3, calc(var(--spacing_2) * var(--spacing-scale)));
    --spacing_4: var(--figspec_spacing_4, calc(var(--spacing_3) * var(--spacing-scale)));
    --spacing_5: var(--figspec_spacing_5, calc(var(--spacing_4) * var(--spacing-scale)));
    --spacing_-1: var(--figspec_spacing_-1, calc(var(--spacing_0) / var(--spacing-scale)));
    --spacing_-2: var(--figspec_spacing_-2, calc(var(--spacing_-1) / var(--spacing-scale)));
    --spacing_-3: var(--figspec_spacing_-3, calc(var(--spacing_-2) / var(--spacing-scale)));
    --spacing_-4: var(--figspec_spacing_-4, calc(var(--spacing_-3) / var(--spacing-scale)));
    --spacing_-5: var(--figspec_spacing_-5, calc(var(--spacing_-4) / var(--spacing-scale)));

    /* Action */
    --default-action-overlay: rgb(var(--color-gray-8) / 0.1);
    --default-action-border: rgb(var(--color-gray-5) / 0.5);
    --default-action-horizontal-padding: var(--spacing_-1);
    --default-action-vertical-padding: var(--spacing_-2);

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
    --panel-width: 300px;

    /* Snackbar */
    --default-snackbar-bg: rgb(var(--color-gray-8));
    --default-snackbar-fg: rgb(var(--color-gray-0));
    --snackbar-fg: var(--figspec-snackbar-fg, var(--default-snackbar-fg));
    --snackbar-bg: var(--figspec-snackbar-bg, var(--default-snackbar-bg));
    --snackbar-radius: var(--figspec-snackbar-radius, 6px);
    --snackbar-font-size: var(--figspec-snackbar-font-size, calc(var(--font-size) * 0.9));
    --snackbar-font-family: var(--figspec-snackbar-font-family, var(--font-family-sans));
    --snackbar-shadow: var(--figspec-snackbar-shadow, 0 1px 3px rgb(0 0 0 / 0.3));
    --snackbar-margin: var(--figspec-snackbar-margin, var(--spacing_-3) var(--spacing_-2));
    --snackbar-padding: var(--figspec-snackbar-padding, var(--spacing_-2) var(--spacing_0));
    --snackbar-border: var(--figspec-snackbar-border, none);

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
      --default-action-horizontal-padding: var(--spacing_0);
      --default-action-vertical-padding: var(--spacing_-1);
    }
  }
`;

export const styles = commonHostStyles + uiStyles;
