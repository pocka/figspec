import { attr, className, el } from "../../dom.js";

import { iconButton } from "../iconButton/iconButton.js";
import { icons } from "./icons.js";

export const styles = /* css */ `
  .mb-root {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }
  .mb-root:has(+ .ip-root) {
    right: var(--panel-width);
  }

  .mb-root:hover > .mb-menubar[data-autohide],
  .mb-root:focus-within > .mb-menubar[data-autohide] {
    transition-delay: 0s;
    transform: translateY(0px);
  }

  .mb-menubar {
    padding: var(--spacing_-3);
    display: flex;

    background-color: var(--bg);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    color: var(--fg);
    z-index: 1;
  }
  .mb-menubar[data-autohide] {
    transition: transform 0.15s 0.5s ease-out;
    transform: translateY(-100%);
  }

  .mb-menubar .sl-select {
    --action-border: transparent;
  }

  .mb-slots {
    flex: 1;
  }

  .mb-actions {
    flex-grow: 0;
    flex-shrink: 0;
    display: flex;
    gap: var(--spacing_-2);
  }
`;

interface MenuBarProps {
  slot?: Parameters<typeof el>[2];

  onOpenInfo(): void;
  onOpenPreferences(): void;
}

export function menuBar({
  slot,
  onOpenInfo,
  onOpenPreferences,
}: MenuBarProps): HTMLElement {
  return el(
    "div",
    [className("mb-root")],
    [
      el(
        "div",
        [className("mb-menubar"), attr("data-autohide", false)],
        [
          el("div", [className("mb-slots")], slot),
          el(
            "div",
            [className("mb-actions")],
            [
              iconButton({
                title: "File info",
                icon: icons.info(),
                onClick: () => {
                  onOpenInfo();
                },
              }),
              iconButton({
                title: "Preferences",
                icon: icons.preferences(),
                onClick: () => {
                  onOpenPreferences();
                },
              }),
            ],
          ),
        ],
      ),
    ],
  );
}
