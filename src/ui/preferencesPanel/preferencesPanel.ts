import { attr, className, el, type ElementFn, on, prop } from "../../dom.js";
import { roundTo } from "../../math.js";
import { type Preferences } from "../../preferences.js";
import { compute, Signal } from "../../signal.js";

import { choice, styles as choiceStyles } from "./choice.js";

export const styles =
  /* css */ `
  .pp-root {
    overflow-y: auto;
  }

  .pp-section-header {
    display: block;
    margin: 0;
    margin-top: var(--spacing_5);
    margin-bottom: var(--spacing_1);
    font-size: calc(var(--font-size) * 1.1);
    font-weight: bold;
  }

  .pp-choice-list {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: var(--spacing_-2);
  }

  .pp-input {
    appearance: none;
    border: 1px solid var(--action-border);
    padding: var(--action-vertical-padding) var(--action-horizontal-padding);
    display: inline-block;
    font-size: calc(var(--font-size) * 0.9);
    min-width: 6em;

    background: transparent;
    border-radius: var(--action-radius);
    color: var(--fg);
  }
  .pp-input:focus {
    outline: none;
  }
  .pp-input:focus-visible {
    border-color: SelectedItem;
    outline: 1px solid SelectedItem;
  }

  .pp-description, .pp-error {
    margin: 0;
    margin-top: var(--spacing_0);
    font-size: calc(var(--font-size) * 0.8);

    color: var(--subtle-fg);
  }

  .pp-error {
    color: var(--error-fg);
  }
` + choiceStyles;

interface PreferencesPanelProps {
  preferences: Signal<Readonly<Preferences>>;
}

export function preferencesPanel({
  preferences: $preferences,
}: PreferencesPanelProps): HTMLElement {
  return el(
    "div",
    [className("pp-root")],
    [
      cssColorNotation($preferences),
      lengthUnit($preferences),
      rootFontSizeInPx($preferences),
      enableColorPreview($preferences),
      decimalPlaces($preferences),
      viewportPanSpeed($preferences),
      viewportZoomSpeed($preferences),
    ],
  );
}

interface NumberInputProps {
  $error: Signal<string | null>;
  initialValue: number;
  min: number;
  max: number;
  step?: number;
  attrs?: readonly ElementFn<HTMLInputElement>[];
  onChange(value: number): void;
}

function numberInput({
  $error,
  initialValue,
  min,
  max,
  step = 1,
  attrs = [],
  onChange,
}: NumberInputProps): HTMLInputElement {
  return el("input", [
    ...attrs,
    className("pp-input"),
    attr("type", "number"),
    prop("value", initialValue.toString(10)),
    attr("min", min.toString(10)),
    attr("max", max.toString(10)),
    attr("step", step.toString(10)),
    attr(
      "aria-invalid",
      compute(() => ($error.get() ? "true" : false)),
    ),
    on("change", (ev) => {
      ev.preventDefault();

      const value = parseInt((ev.currentTarget as HTMLInputElement).value, 10);

      if (!Number.isFinite(value)) {
        $error.set("Please input a valid number.");
        return;
      }

      if (value < min) {
        $error.set(
          "Input must be greater than or equal to " + min.toString(10) + ".",
        );
        return;
      }

      if (value > max) {
        $error.set(
          "Input must be less than or equal to " + max.toString(10) + ".",
        );
        return;
      }

      $error.set(null);
      onChange(value);
    }),
  ]);
}

function cssColorNotation(
  $preferences: Signal<Readonly<Preferences>>,
): HTMLElement {
  const selected = compute(() => $preferences.get().cssColorNotation);

  const onChange = (cssColorNotation: Preferences["cssColorNotation"]) => {
    $preferences.set({
      ...$preferences.once(),
      cssColorNotation,
    });
  };

  return el(
    "div",
    [],
    [
      el("span", [className("pp-section-header")], ["CSS color notation"]),
      el(
        "div",
        [className("pp-choice-list")],
        [
          choice({
            value: "hex",
            label: "RGB (Hex)",
            selected,
            group: "color_notation",
            onChange,
          }),
          choice({
            value: "rgb",
            label: "RGB",
            selected,
            group: "color_notation",
            onChange,
          }),
          choice({
            value: "hsl",
            label: "HSL",
            selected,
            group: "color_notation",
            onChange,
          }),
          choice({
            value: "color-srgb",
            label: "sRGB",
            selected,
            description: [
              "Display colors with ",
              el("code", [], ["color"]),
              " function in sRGB color space. When the Figma file is set to use Display P3 color space, ",
              "color gamut would be inaccurate.",
            ],
            group: "color_notation",
            onChange,
          }),
          choice({
            value: "display-p3",
            label: "Display P3",
            selected,
            description: [
              "Display colors in Display P3 color space. ",
              "Suitable for Figma files set to use Display P3 color space. ",
              "When the Figma file is set to use sRGB color space (default), resulting colors may be oversaturated. ",
              "If the user environment does not support Display P3 color space, out-of-gamut colors are clamped (CSS Gamut Mapping).",
            ],
            group: "color_notation",
            onChange,
          }),
          choice({
            value: "srgb-to-display-p3",
            label: "Display P3 (sRGB range)",
            selected,
            description: [
              "Display colors in Display P3 color space. ",
              "This mode treats original color as sRGB and converts it to Display P3 color using ",
              el(
                "a",
                [
                  attr(
                    "href",
                    "https://drafts.csswg.org/css-color-4/#predefined-to-predefined",
                  ),
                  attr("target", "_blank"),
                ],
                ["a method described in CSS Color Module 4 draft spec"],
              ),
              ". ",
              "When the Figma file is set to use Display P3 color space, resulting colors may be undersaturated. ",
              "The colors generated by this mode look same regardless of whether the user environment supports Display P3 color space or not. ",
            ],
            group: "color_notation",
            onChange,
          }),
        ],
      ),
    ],
  );
}

function lengthUnit($preferences: Signal<Readonly<Preferences>>): HTMLElement {
  const selected = compute(() => $preferences.get().lengthUnit);

  const onChange = (lengthUnit: Preferences["lengthUnit"]) => {
    $preferences.set({
      ...$preferences.once(),
      lengthUnit,
    });
  };

  return el(
    "div",
    [],
    [
      el("span", [className("pp-section-header")], ["CSS length unit"]),
      el(
        "div",
        [className("pp-choice-list")],
        [
          choice({
            value: "px",
            label: "px",
            selected,
            group: "length_unit",
            onChange,
          }),
          choice({
            value: "rem",
            label: "rem",
            selected,
            description: [
              "Showing rem sizes to match the px sizes, assuming the ",
              el("code", [], [":root"]),
              " is set to ",
              compute(() => {
                const { rootFontSizeInPx, decimalPlaces } = $preferences.get();

                return roundTo(rootFontSizeInPx, decimalPlaces).toString(10);
              }),
              "px. ",
              "This option changes ",
              el("b", [], ["every"]),
              " length unit to rem, even where the use of px is preferable.",
            ],
            group: "length_unit",
            onChange,
          }),
        ],
      ),
    ],
  );
}

function rootFontSizeInPx(
  $preferences: Signal<Readonly<Preferences>>,
): Signal<HTMLElement | null> {
  const $isUsingRem = compute(() => $preferences.get().lengthUnit === "rem");
  const $error = new Signal<string | null>(null);

  return compute(() => {
    if (!$isUsingRem.get()) {
      return null;
    }

    return el(
      "div",
      [],
      [
        el(
          "span",
          [className("pp-section-header")],
          ["Root font size for rem calculation"],
        ),
        numberInput({
          $error,
          initialValue: $preferences.once().rootFontSizeInPx,
          min: 1,
          max: 100,
          attrs: [attr("aria-describedby", "root_font_size_desc")],
          onChange(rootFontSizeInPx) {
            $preferences.set({
              ...$preferences.once(),
              rootFontSizeInPx,
            });
          },
        }),
        compute(() => {
          const error = $error.get();
          if (!error) {
            return null;
          }

          return el("p", [className("pp-error")], [error]);
        }),
        el(
          "p",
          [attr("id", "root_font_size_desc"), className("pp-description")],
          [
            "Font size set to your page's ",
            el("code", [], [":root"]),
            " in px. ",
            "When unset, 16px (default value) is the recommended value as it is the default value most browser/platform uses. ",
            "When you set 62.5% (or similar) to make 1rem to match 10px, input 10px. ",
            "With the current setting, 1px = ",
            compute(() => {
              const { rootFontSizeInPx, decimalPlaces } = $preferences.get();

              return roundTo(1 / rootFontSizeInPx, decimalPlaces + 2).toString(
                10,
              );
            }),
            "rem. ",
          ],
        ),
      ],
    );
  });
}

function enableColorPreview(
  $preferences: Signal<Readonly<Preferences>>,
): HTMLElement {
  const selected = compute(() =>
    $preferences.get().enableColorPreview ? "true" : "false",
  );

  const onChange = (enableColorPreview: "true" | "false") => {
    $preferences.set({
      ...$preferences.once(),
      enableColorPreview: enableColorPreview === "true",
    });
  };

  return el(
    "div",
    [],
    [
      el("span", [className("pp-section-header")], ["CSS color preview"]),
      el(
        "div",
        [className("pp-choice-list")],
        [
          choice({
            value: "true",
            label: "Enabled",
            selected,
            description: [
              "Displays a color preview next to a CSS color value.",
            ],
            group: "color_preview",
            onChange,
          }),
          choice({
            value: "false",
            label: "Disabled",
            selected,
            description: ["Do not display color previews inside CSS code."],
            group: "color_preview",
            onChange,
          }),
        ],
      ),
    ],
  );
}

const ROUND_TEST_VALUE = 1.23456789123;

function decimalPlaces(
  $preferences: Signal<Readonly<Preferences>>,
): HTMLElement {
  const $error = new Signal<string | null>(null);

  return el(
    "div",
    [],
    [
      el("span", [className("pp-section-header")], ["Decimal places"]),
      numberInput({
        $error,
        initialValue: $preferences.once().decimalPlaces,
        min: 0,
        max: 10,
        attrs: [attr("aria-describedby", "decimal_places_desc")],
        onChange(decimalPlaces) {
          $preferences.set({
            ...$preferences.once(),
            decimalPlaces,
          });
        },
      }),
      compute(() => {
        const error = $error.get();
        if (!error) {
          return null;
        }

        return el("p", [className("pp-error")], [error]);
      }),
      el(
        "p",
        [attr("id", "decimal_places_desc"), className("pp-description")],
        [
          "The number of decimal places to show in UI and CSS code. Some parts ignore, add to, or subtract to this number. ",
          "With the current setting, ",
          ROUND_TEST_VALUE.toString(10),
          " would be rounded to ",
          compute(() => {
            const { decimalPlaces } = $preferences.get();

            return (
              roundTo(
                ROUND_TEST_VALUE,
                $preferences.get().decimalPlaces,
              ).toString(10) + (decimalPlaces === 0 ? " (integer)" : "")
            );
          }),
          ". ",
        ],
      ),
    ],
  );
}

function viewportZoomSpeed(
  $preferences: Signal<Readonly<Preferences>>,
): HTMLElement {
  const $error = new Signal<string | null>(null);

  return el(
    "div",
    [],
    [
      el("span", [className("pp-section-header")], ["Viewport zoom speed"]),
      numberInput({
        $error,
        initialValue: $preferences.once().viewportZoomSpeed,
        min: 0,
        max: 999,
        attrs: [attr("aria-describedby", "zoom_speed_desc")],
        onChange(viewportZoomSpeed) {
          $preferences.set({
            ...$preferences.once(),
            viewportZoomSpeed,
          });
        },
      }),
      compute(() => {
        const error = $error.get();
        if (!error) {
          return null;
        }

        return el("p", [className("pp-error")], [error]);
      }),
      el(
        "p",
        [attr("id", "zoom_speed_desc"), className("pp-description")],
        ["The speed of viewport scaling action."],
      ),
    ],
  );
}

function viewportPanSpeed(
  $preferences: Signal<Readonly<Preferences>>,
): HTMLElement {
  const $error = new Signal<string | null>(null);

  return el(
    "div",
    [],
    [
      el("span", [className("pp-section-header")], ["Viewport pan speed"]),
      numberInput({
        $error,
        initialValue: $preferences.once().viewportPanSpeed,
        min: 0,
        max: 999,
        attrs: [attr("aria-describedby", "pan_speed_desc")],
        onChange(viewportPanSpeed) {
          $preferences.set({
            ...$preferences.once(),
            viewportPanSpeed,
          });
        },
      }),
      compute(() => {
        const error = $error.get();
        if (!error) {
          return null;
        }

        return el("p", [className("pp-error")], [error]);
      }),
      el(
        "p",
        [attr("id", "pan_speed_desc"), className("pp-description")],
        ["The speed of viewport pan/move action."],
      ),
    ],
  );
}
