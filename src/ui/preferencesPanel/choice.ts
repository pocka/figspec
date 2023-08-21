import { attr, className, el, prop, on } from "../../dom";
import { compute, Signal } from "../../signal";

import { check } from "./icons";

export const styles = /* css */ `
  .pp-choice-container {
    position: relative;
  }

  .pp-choice-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 1px;

    opacity: 0;
  }

  .pp-choice-box {
    padding: var(--action-vertical-padding) var(--action-horizontal-padding);
    display: grid;
    grid-template-columns: min-content minmax(0, 1fr);
    grid-template-rows: max-content max-content;
    align-items: center;
    gap: 4px 8px;
    border: 1px solid var(--action-border);
    border: 1px solid transparent;

    border-radius: var(--action-radius);
    cursor: pointer;
  }
  .pp-choice-input:checked + .pp-choice-box {
    border-color: var(--action-border);
  }
  .pp-choice-input:checked + .pp-choice-box > .pp-choice-check {
    color: var(--success-fg);

    opacity: 1;
  }
  .pp-choice-input:focus-visible + .pp-choice-box {
    box-shadow: 0 0 0 1px inset SelectedItem;
    border-color: SelectedItem;
  }
  .pp-choice-box:hover {
    background-color: var(--action-overlay);
  }

  .pp-choice-check {
    height: calc(var(--font-size) * 0.8);
    width: auto;

    color: var(--subtle-fg);

    opacity: 0.15;
  }

  .pp-choice-label {
    font-size: calc(var(--font-size) * 1);

    color: var(--fg);
  }

  .pp-choice-desc {
    grid-column: 1 / 3;
    margin: 0;
    font-size: calc(var(--font-size) * 0.8);

    color: var(--subtle-fg);
  }
`;

type ElementChildren = NonNullable<Parameters<typeof el>[2]>;

interface ChoiceProps<T extends string> {
  value: T;

  label: ElementChildren[number];

  description?: ElementChildren;

  selected: Signal<T>;

  group: string;

  onChange(value: T): void;
}

export function choice<T extends string>({
  value,
  label,
  description,
  selected,
  group,
  onChange,
}: ChoiceProps<T>): HTMLElement {
  const id = group + "_" + value;
  const labelId = id + "_label";
  const descriptionId = id + "_description";

  const input = el("input", [
    attr("id", id),
    className("pp-choice-input"),
    attr("aria-labelledby", labelId),
    attr("aria-describedby", description ? descriptionId : false),
    attr("type", "radio"),
    attr("name", group),
    prop(
      "checked",
      compute(() => selected.get() === value),
    ),
    on("change", (ev) => {
      ev.preventDefault();

      onChange(value);
    }),
  ]);

  return el(
    "div",
    [className("pp-choice-container")],
    [
      input,
      el(
        "div",
        [
          className("pp-choice-box"),
          on("click", (ev) => {
            if (ev.target instanceof HTMLAnchorElement) {
              return;
            }

            ev.preventDefault();

            input.click();
          }),
        ],
        [
          check([className("pp-choice-check")]),
          el(
            "span",
            [attr("id", labelId), className("pp-choice-label")],
            [label],
          ),
          description &&
            el(
              "p",
              [attr("id", descriptionId), className("pp-choice-desc")],
              description,
            ),
        ],
      ),
    ],
  );
}
