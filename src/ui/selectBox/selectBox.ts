import {
  attr,
  className,
  el,
  on,
  raf,
  svg,
  type ElementFn,
} from "../../dom.js";
import { compute, Signal } from "../../signal.js";

export const styles = /* css */ `
  .sl-wrapper {
    --_caret-size: calc(var(--font-size) * 0.625);
    --_caret-width: calc(var(--_caret-size) * 0.8);

    position: relative;
    display: inline-flex;
    box-sizing: border-box;
  }

  .sl-select {
    appearance: none;
    padding: var(--action-vertical-padding) var(--action-horizontal-padding);
    padding-right: calc(var(--action-horizontal-padding) * 2 + var(--_caret-size));
    margin: 0;
    border: 1px solid var(--action-border);
    border: none;
    box-sizing: border-box;
    font-size: calc(var(--font-size) * 0.8);
    width: 100%;

    background: transparent;
    border-radius: var(--action-radius);
    color: inherit;
    cursor: pointer;
    outline: none;
  }
  .sl-select:hover {
    background-color: var(--action-overlay);
  }
  .sl-select:focus {
    outline: none;
  }
  .sl-select:focus-visible {
    outline: 2px solid SelectedItem;
  }

  .sl-caret {
    position: absolute;
    right: var(--action-horizontal-padding);
    width: var(--_caret-size);
    height: var(--_caret-size);
    top: 0;
    bottom: 0;
    margin: auto 0;

    pointer-events: none;
    stroke: currentColor;
    stroke-width: var(--_caret-width);
    fill: none;
  }
`;

interface SelectboxProps {
  attrs?: readonly ElementFn<HTMLSelectElement>[];

  options: readonly HTMLOptionElement[];

  wrapperAttrs?: readonly ElementFn<HTMLElement>[];

  value: string | undefined | Signal<string | undefined>;

  onChange?(value: string): void;
}

export function selectBox({
  options,
  attrs = [],
  wrapperAttrs = [],
  value,
  onChange,
}: SelectboxProps): HTMLElement {
  return el(
    "div",
    [className("sl-wrapper"), ...wrapperAttrs],
    [
      el(
        "select",
        [
          className("sl-select"),
          raf(
            compute(() => (el) => {
              el.value = (value instanceof Signal ? value.get() : value) || "";
            }),
          ),
          on("change", (ev) => {
            if (!(ev.currentTarget instanceof HTMLSelectElement)) {
              return;
            }

            onChange?.(ev.currentTarget.value);
          }),
          ...attrs,
        ],
        options,
      ),
      svg(
        "svg",
        [
          attr("viewBox", "0 0 100 100"),
          className("sl-caret"),
          attr("aria-hidden", "true"),
        ],
        [svg("path", [attr("d", "M0,25 l50,50 l50,-50")])],
      ),
    ],
  );
}
