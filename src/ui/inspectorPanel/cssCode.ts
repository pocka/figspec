import { attr, className, el, style } from "../../dom.js";
import { roundTo } from "../../math.js";
import { type Preferences } from "../../preferences.js";

import {
  type CSSStyle,
  type CSSStyleValue,
  CSSStyleValueTypes,
} from "./cssgen/cssgen.js";

export const styles = /* css */ `
  .cc-container {
    margin: 0;
    padding: var(--spacing_-1);

    background: var(--code-bg);
    border-radius: var(--panel-radii);
    color: var(--code-text);
    overflow: auto;
    user-select: text;
  }

  .cc-code {
    font-family: var(--font-family-mono);
    font-size: calc(var(--font-size) * 0.8);
  }

  .cc-color-preview {
    --_size: calc(var(--font-size) * 0.8);

    position: relative;
    display: inline-flex;
    width: var(--_size);
    height: var(--_size);
    border-radius: calc(var(--_size) / 6);
    margin: 0 var(--spacing_-5);

    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect x="0" y="0" width="10" height="10" fill="%23fff" /><rect x="5" y="0" width="5" height="5" fill="%23ccc" /><rect x="0" y="5" width="5" height="5" fill="%23ccc" /></svg>');
    overflow: hidden;
    vertical-align: middle;
  }
  .cc-color-preview::after {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border: 1px solid rgb(var(--color-gray-5) / 0.7);

    background: var(--_bg, transparent);
    border-radius: inherit;
  }

  .cc-token-string {
    color: var(--code-string);
  }

  .cc-token-number {
    color: var(--code-number);
  }

  .cc-token-comment {
    color: var(--code-comment);
    font-style: italic;
  }

  .cc-token-keyword {
    color: var(--code-keyword);
  }

  .cc-token-list {
    color: var(--code-list);
  }

  .cc-token-function {
    color: var(--code-function);
  }

  .cc-token-unit {
    color: var(--code-unit);
  }
`;

export function cssCode(
  styles: readonly CSSStyle[],
  preferences: Readonly<Preferences>,
): HTMLElement {
  return el(
    "pre",
    [className("cc-container")],
    [
      el(
        "code",
        [className("cc-code")],
        styles.map((style) => {
          return el(
            "span",
            [],
            [
              style.propertyName,
              ": ",
              cssValue(style.value, preferences),
              ";\n",
            ],
          );
        }),
      ),
    ],
  );
}

function cssValue(
  value: CSSStyleValue,
  preferences: Readonly<Preferences>,
): HTMLElement {
  switch (value.type) {
    case CSSStyleValueTypes.Comment:
      return el(
        "span",
        [className("cc-token-comment")],
        ["/* ", value.text, " */"],
      );
    case CSSStyleValueTypes.Color:
      return el(
        "span",
        [],
        [
          el(
            "i",
            [
              className("cc-color-preview"),
              style({ "--_bg": value.color }),
              attr("aria-hidden", "true"),
            ],
            [],
          ),
          cssValue(value.value, preferences),
        ],
      );
    case CSSStyleValueTypes.Keyword:
      return el("span", [className("cc-token-keyword")], [value.ident]);
    case CSSStyleValueTypes.List:
      return el(
        "span",
        [],
        [
          [cssValue(value.head, preferences)],
          ...value.tail.map((v) => [
            el("span", [className("cc-token-list")], [value.separator]),
            cssValue(v, preferences),
          ]),
        ].flat(),
      );
    case CSSStyleValueTypes.Number:
      const precision = value.precision ?? preferences.decimalPlaces;

      return el(
        "span",
        [className("cc-token-number")],
        [
          roundTo(value.value, precision).toString(10),
          el("span", [className("cc-token-unit")], [value.unit || ""]),
        ],
      );
    case CSSStyleValueTypes.String:
      return el(
        "span",
        [className("cc-token-string")],
        [`"`, value.value.replace(/"/g, `\\"`), `"`],
      );
    case CSSStyleValueTypes.Literal:
      return el("span", [className("cc-token-literal")], [value.text]);
    case CSSStyleValueTypes.FunctionCall:
      return el(
        "span",
        [],
        [
          el("span", [className("cc-token-function")], [value.functionName]),
          "(",
          cssValue(value.args, preferences),
          ")",
        ],
      );
    case CSSStyleValueTypes.Unknown:
      return el("span", [className("cc-token-unknown")], [value.text]);
  }
}
