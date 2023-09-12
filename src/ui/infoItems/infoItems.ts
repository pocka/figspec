import { attr, className, el } from "../../dom.js";
import { compute, Signal } from "../../signal.js";

export const styles = /* css */ `
  .ii-list {
    padding: 0;
    margin: 0;
    user-select: text;
  }

  .ii-label {
    padding: 0;
    margin: 0;
    margin-bottom: var(--spacing_-5);
    font-size: calc(var(--font-size) * 0.8);
    font-weight: bold;

    color: var(--subtle-fg);
  }

  .ii-content {
    padding: 0;
    margin: 0;
    margin-bottom: var(--spacing_3);
    font-size: var(--font-size);
    font-weight: normal;

    color: var(--fg);
  }
`;

type Children = NonNullable<Parameters<typeof el>[2]>;

interface Item {
  label: Children[number];

  content: Children;
}

export function infoItems(
  items: readonly (Item | Signal<Item | null> | null)[],
): HTMLElement {
  return el(
    "dl",
    [className("ii-list")],
    items
      .map((item) => {
        if (!item) {
          return [];
        }

        if (item instanceof Signal) {
          return [map(label, item), map(content, item)];
        }

        return [label(item), content(item)];
      })
      .flat(),
  );
}

function map<T, P>(f: (v: T) => P, s: Signal<T | null>): Signal<P | null> {
  return compute(() => {
    const v = s.get();
    if (v === null) {
      return null;
    }

    return f(v);
  });
}

function label(item: Item): HTMLElement {
  return el(
    "dt",
    [className("ii-label")],
    [item.label, el("span", [attr("aria-hidden", "true")], [":"])],
  );
}

function content(item: Item): HTMLElement {
  return el("dd", [className("ii-content")], item.content);
}
