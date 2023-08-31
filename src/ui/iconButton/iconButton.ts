import { attr, className, el, on } from "../../dom";

export const styles = /* css */ `
  .ib-button {
    appearance: none;
    display: inline-flex;
    border: none;
    padding: var(--action-vertical-padding) var(--action-horizontal-padding);
    margin: 0;
    font-size: calc(var(--font-size) * 0.9);

    background: transparent;
    border-radius: var(--action-radius);
    color: inherit;
    cursor: pointer;
    outline: none;
  }
  .ib-button:hover {
    background: var(--action-overlay);
  }
  .ib-button:focus {
    outline: none;
  }
  .ib-button:focus-visible {
    outline: 2px solid SelectedItem;
  }

  .ib-button > svg {
    width: auto;
    height: 1em;
  }
`;

interface IconButtonProps {
  title: string;

  icon: SVGElement;

  onClick(): void;
}

export function iconButton({
  title,
  icon,
  onClick,
}: IconButtonProps): HTMLElement {
  return el(
    "button",
    [className("ib-button"), attr("title", title), on("click", onClick)],
    [icon],
  );
}
