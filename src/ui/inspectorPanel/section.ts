import { attr, className, el, on } from "../../dom";

import { iconButton } from "../iconButton/iconButton";

import * as icons from "./icons";

interface SectionProps {
  title: string;

  body: NonNullable<Parameters<typeof el>[2]>;

  icon?: "close" | "copy";

  onIconClick?(): void;
}

export function section({
  title,
  body,
  icon: iconType,
  onIconClick,
}: SectionProps): HTMLElement {
  const iconAttrs = [
    attr("role", "img"),
    className("ip-section-heading-button-icon"),
  ];

  const icon =
    iconType === "close"
      ? icons.close(iconAttrs)
      : iconType === "copy"
      ? icons.copy(iconAttrs)
      : null;

  return el(
    "div",
    [className("ip-section")],
    [
      el(
        "div",
        [className("ip-section-heading")],
        [
          el("h4", [className("ip-section-heading-title")], [title]),
          icon &&
            onIconClick &&
            iconButton({
              title: iconType === "close" ? "Close" : "Copy",
              icon,
              onClick: onIconClick,
            }),
        ],
      ),
      ...body,
    ],
  );
}
