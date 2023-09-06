import { attr, el, className, svg } from "../../dom";
import { effect } from "../../signal";

import { iconButton } from "../iconButton/iconButton";

export const styles = /* css */ `
  .fp-root {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background-color: var(--bg);
    color: var(--fg);
  }

  .fp-close {
    position: absolute;
    right: var(--spacing_-1);
    top: var(--spacing_-1);

    background-color: inherit;
    border-radius: var(--panel-radii);
    z-index: calc(var(--z-index) + 5);

    opacity: 0.5;
  }
  .fp-close:hover, .fp-close:focus-within {
    opacity: 1;
  }

  .fp-close-icon {
    font-size: calc(var(--font-size) * 1.1);
  }

  .fp-body {
    max-width: 100%;
    max-height: 100%;
    padding: var(--spacing_1);
    box-sizing: border-box;

    overflow-y: auto;
  }
`;

interface FullscreenPanelProps {
  body: Parameters<typeof el>[2];

  onClose?(): void;
}

export function fullscreenPanel({
  body,
  onClose,
}: FullscreenPanelProps): HTMLElement {
  effect(() => {
    if (!onClose) {
      return;
    }

    const onEsc = (ev: KeyboardEvent) => {
      if (ev.key !== "Escape") {
        return;
      }

      ev.preventDefault();
      ev.stopPropagation();

      onClose();
    };

    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("keydown", onEsc);
    };
  });

  return el(
    "div",
    [className("fp-root")],
    [
      onClose
        ? el(
            "div",
            [className("fp-close")],
            [
              iconButton({
                title: "Close",
                icon: svg(
                  "svg",
                  [
                    className("fp-close-icon"),
                    attr("viewBox", "0 0 10 10"),
                    attr("fill", "none"),
                    attr("stroke", "currentColor"),
                  ],
                  [svg("path", [attr("d", "M2,2 L8,8 M8,2 L2,8")])],
                ),
                onClick() {
                  onClose();
                },
              }),
            ],
          )
        : null,
      el("div", [className("fp-body")], body),
    ],
  );
}
