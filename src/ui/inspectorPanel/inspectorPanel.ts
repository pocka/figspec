import { attr, className, el, on } from "../../dom";
import * as figma from "../../figma";
import { roundTo } from "../../math";
import { type Preferences } from "../../preferences";
import { compute, effect, Signal } from "../../signal";

import { type SnackbarContent } from "../snackbar/snackbar";

import { cssCode, styles as cssCodeStyles } from "./cssCode";
import * as cssgen from "./cssgen/cssgen";
import { section } from "./section";

export const styles =
  /* css */ `
  .ip-root {
    position: absolute;
    height: 100%;
    width: 300px;
    right: 0;
    border-left: var(--panel-border);

    background: var(--bg);
    color: var(--fg);
    overflow-y: auto;
    z-index: calc(var(--z-index) + 10);
  }
  .ip-root:focus-visible {
    box-shadow: inset 0 0 0 2px SelectedItem;
    outline: none;
  }

  .ip-section {
    padding: 16px;
    border-bottom: var(--panel-border);
  }

  .ip-section-heading {
    display: flex;
    align-items: center;
    margin: 0;
    margin-bottom: 12px;
  }

  .ip-section-heading-title {
    flex-grow: 1;
    flex-shrink: 1;
    font-size: calc(var(--font-size) * 1);
    margin: 0;
  }

  .ip-style-section {
    margin-bottom: 12px;
  }

  .ip-overview {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 24px;
    margin: 0;
    margin-top: 16px;
  }

  .ip-prop {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    margin: 0;
    gap: 2px;
  }

  .ip-prop-label {
    font-weight: bold;
    font-size: calc(var(--font-size) * 0.7);

    color: var(--subtle-fg);
  }
  .ip-prop-value {
    font-size: calc(var(--font-size) * 0.9);

    color: var(--fg);
    user-select: text;
  }

  .ip-text-content {
    display: block;
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
    font-family: var(--font-family-mono);
    font-size: calc(var(--font-size) * 0.8);

    background: var(--code-bg);
    border-radius: var(--panel-radii);
    color: var(--code-text);
    user-select: text;
  }

  .ip-options {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;
  }

  .ip-pref-action {
    appearance: none;
    border: 1px solid var(--action-border);
    padding: var(--action-vertical-padding) var(--action-horizontal-padding);

    background: transparent;
    border-radius: var(--action-radius);
    color: var(--fg);
    cursor: pointer;
  }
  .ip-pref-action:hover {
    background-color: var(--action-overlay);
  }
  .ip-pref-action:focus {
    outline: none;
  }
  .ip-pref-action:focus-visible {
    border-color: SelectedItem;
    outline: 1px solid SelectedItem;
  }
` + cssCodeStyles;

interface InspectorPanelProps {
  snackbar: Signal<SnackbarContent>;

  preferences: Signal<Readonly<Preferences>>;

  selected: Signal<figma.Node | null>;

  onOpenPreferencesPanel(): void;
}

export function inspectorPanel({
  snackbar: $snackbar,
  preferences: $preferences,
  selected: $selected,
  onOpenPreferencesPanel,
}: InspectorPanelProps): Signal<HTMLElement | null> {
  effect(() => {
    // No need to rerun this effect on node-to-node changes
    if (!compute(() => !!$selected.get()).get()) {
      return;
    }

    const onEsc = (ev: KeyboardEvent) => {
      if (ev.key !== "Escape" || ev.isComposing) {
        return;
      }

      ev.preventDefault();
      ev.stopPropagation();

      $selected.set(null);
    };

    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("keydown", onEsc);
    };
  });

  return compute(() => {
    const node = $selected.get();
    if (!node) {
      return null;
    }

    return el(
      "div",
      [className("ip-root")],
      [
        section({
          title: node.name,
          body: [
            el(
              "div",
              [className("ip-overview")],
              [
                el(
                  "p",
                  [className("ip-prop")],
                  [
                    el("span", [className("ip-prop-label")], ["Type:"]),
                    el("span", [className("ip-prop-value")], [node.type]),
                  ],
                ),
              ],
            ),
            figma.hasBoundingBox(node)
              ? el(
                  "div",
                  [className("ip-overview")],
                  [
                    el(
                      "p",
                      [className("ip-prop")],
                      [
                        el("span", [className("ip-prop-label")], ["Width:"]),
                        el(
                          "span",
                          [className("ip-prop-value")],
                          [
                            compute(
                              () =>
                                roundTo(
                                  node.absoluteBoundingBox.width,
                                  $preferences.get().decimalPlaces,
                                ) + "px",
                            ),
                          ],
                        ),
                      ],
                    ),
                    el(
                      "p",
                      [className("ip-prop")],
                      [
                        el("span", [className("ip-prop-label")], ["Height:"]),
                        el(
                          "span",
                          [className("ip-prop-value")],
                          [
                            compute(
                              () =>
                                roundTo(
                                  node.absoluteBoundingBox.height,
                                  $preferences.get().decimalPlaces,
                                ) + "px",
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                )
              : null,
            figma.hasTypeStyle(node)
              ? el(
                  "div",
                  [className("ip-overview")],
                  [
                    el(
                      "p",
                      [className("ip-prop")],
                      [
                        el("span", [className("ip-prop-label")], ["Font:"]),
                        el(
                          "span",
                          [className("ip-prop-value")],
                          [
                            node.style.fontPostScriptName ||
                              node.style.fontFamily,
                          ],
                        ),
                      ],
                    ),
                  ],
                )
              : null,
          ],
          icon: "close",
          onIconClick: () => {
            $selected.set(null);
          },
        }),
        figma.hasPadding(node) &&
        (node.paddingTop > 0 ||
          node.paddingRight > 0 ||
          node.paddingBottom > 0 ||
          node.paddingLeft > 0)
          ? section({
              title: "Padding",
              body: [
                el(
                  "p",
                  [className("ip-prop")],
                  [
                    el("span", [className("ip-prop-label")], ["Top:"]),
                    el(
                      "span",
                      [className("ip-prop-value")],
                      [node.paddingTop.toString(10)],
                    ),
                  ],
                ),
                el(
                  "p",
                  [className("ip-prop")],
                  [
                    el("span", [className("ip-prop-label")], ["Right:"]),
                    el(
                      "span",
                      [className("ip-prop-value")],
                      [node.paddingRight.toString(10)],
                    ),
                  ],
                ),
                el(
                  "p",
                  [className("ip-prop")],
                  [
                    el("span", [className("ip-prop-label")], ["Bottom:"]),
                    el(
                      "span",
                      [className("ip-prop-value")],
                      [node.paddingBottom.toString(10)],
                    ),
                  ],
                ),
                el(
                  "p",
                  [className("ip-prop")],
                  [
                    el("span", [className("ip-prop-label")], ["Left:"]),
                    el(
                      "span",
                      [className("ip-prop-value")],
                      [node.paddingLeft.toString(10)],
                    ),
                  ],
                ),
              ],
            })
          : figma.hasLegacyPadding(node) &&
            (node.horizontalPadding > 0 || node.verticalPadding > 0)
          ? section({
              title: "Layout",
              body: [
                node.horizontalPadding > 0
                  ? el(
                      "p",
                      [className("ip-prop")],
                      [
                        el("span", [], ["Padding(H): "]),
                        node.horizontalPadding.toString(10),
                      ],
                    )
                  : null,
                node.verticalPadding > 0
                  ? el(
                      "p",
                      [className("ip-prop")],
                      [
                        el("span", [], ["Padding(V): "]),
                        node.verticalPadding.toString(10),
                      ],
                    )
                  : null,
              ],
            })
          : null,
        figma.hasCharacters(node)
          ? section({
              title: "Content",
              body: [
                el("code", [className("ip-text-content")], [node.characters]),
              ],
              icon: "copy",
              async onIconClick() {
                try {
                  await navigator.clipboard.writeText(node.characters);

                  $snackbar.set(["Copied text content to clipboard"]);
                } catch (error) {
                  console.error("Failed to copy text content", error);
                  $snackbar.set([
                    "Failed to copy text content: ",
                    error instanceof Error ? error.message : String(error),
                  ]);
                }
              },
            })
          : null,
        section({
          title: "CSS",
          body: [
            compute(() => {
              const preferences = $preferences.get();
              const css = cssgen.fromNode(node, preferences);

              return cssCode(css, preferences);
            }),
            el(
              "div",
              [className("ip-options")],
              [
                el(
                  "button",
                  [
                    className("ip-pref-action"),
                    on("click", () => {
                      onOpenPreferencesPanel();
                    }),
                  ],
                  ["Customize"],
                ),
              ],
            ),
          ],
          icon: "copy",
          onIconClick: async () => {
            const preferences = $preferences.once();

            const css = cssgen.fromNode(node, preferences);

            const code = css
              .map((style) => cssgen.serializeStyle(style, preferences))
              .join("\n");

            try {
              await navigator.clipboard.writeText(code);

              $snackbar.set(["Copied CSS code to clipboard"]);
            } catch (error) {
              console.error("Failed to copy CSS code", error);
              $snackbar.set([
                "Failed to copy CSS code: ",
                error instanceof Error ? error.message : String(error),
              ]);
            }
          },
        }),
      ],
    );
  });
}
