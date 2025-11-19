import { attr, className, el } from "../../dom.js";

import { iconButton } from "../iconButton/iconButton.js";
import { icons } from "./icons.js";

export const styles = /* css */ `
  .mb-root {
    position: absolute;
    top: 0;
    width: 100%;
  }

  .mb-root:hover > .mb-menubar[data-autohide],
  .mb-root:focus-within > .mb-menubar[data-autohide] {
    transition-delay: 0s;
    transform: translateY(0px);
  }

  .mb-root:has(> .mb-menubar[data-autohide]) {
    z-index: 2;
  }

  .mb-root:has(> .mb-menubar[data-autohide]) + .ip-root {
    top: 0;
    height: 100%;
    padding-top: var(--menu-bar-height);
    z-index: 1;
  }

  .mb-menubar {
    position: relative;
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
  const menuBar = el(
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
  );

  const renderIntersectionObserver = new IntersectionObserver(() => {
    const rootNode = menuBar.getRootNode();
    if (rootNode instanceof ShadowRoot) {
      const styleString = `:host { --menu-bar-height: ${menuBar.clientHeight}px; }`;
      const style = el("style", [], [styleString]);
      rootNode.appendChild(style);
    }

    renderIntersectionObserver.disconnect();
  });

  renderIntersectionObserver.observe(menuBar);

  return el("div", [className("mb-root")], [menuBar]);
}
