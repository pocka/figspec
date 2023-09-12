import { className, el } from "../../dom.js";
import { fullscreenPanel } from "../fullscreenPanel/fullscreenPanel.js";

export const styles = /* css */ `
  .em-container {
    margin: 0 auto;
    max-width: calc(var(--font-size) * 30);
    margin-top: var(--spacing_3);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing_2);

    user-select: text;
  }

  .em-title {
    margin: 0;
    font-size: calc(var(--font-size) * 1.2);
    font-weight: bold;

    color: var(--fg);
  }

  .em-body {
    margin: 0;
    width: 100%;
  }
  .em-body p {
    margin: 0;
    margin-bottom: var(--spacing_1);
    font-size: calc(var(--font-size) * 1);

    color: var(--subtle-fg);
  }
  .em-body pre {
    align-self: stretch;
    display: block;
    width: 100%;
    font-family: var(--font-family-mono);
    font-size: calc(var(--font-size) * 0.9);
    padding: var(--spacing_0);
    tab-size: 2;

    background-color: var(--code-bg);
    border-radius: var(--panel-radii);
    color: var(--code-fg);
    overflow: auto;
  }
`;

type ElementChildren = NonNullable<Parameters<typeof el>[2]>;

interface EmptyProps {
  title: ElementChildren;

  body: ElementChildren;
}

export function empty({ title, body }: EmptyProps): HTMLElement {
  return fullscreenPanel({
    body: [
      el(
        "div",
        [className("em-container")],
        [
          el("p", [className("em-title")], title),
          el("div", [className("em-body")], body),
        ],
      ),
    ],
  });
}
