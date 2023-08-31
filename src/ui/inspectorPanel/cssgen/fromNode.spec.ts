import { describe, expect, it } from "vitest";

import type * as figma from "../../../figma";
import { defaultPreferenecs, type Preferences } from "../../../preferences";

import { fromNode } from "./fromNode";
import { serializeStyle } from "./serialize";

describe("fromNode", () => {
  describe("padding", () => {
    it("Should have v/h padding rule for v/h paddings", () => {
      const input: figma.Node & figma.HasLegacyPadding = {
        id: "",
        name: "",
        type: "",
        horizontalPadding: 1,
        verticalPadding: 2,
      };

      expect(
        fromNode(input, defaultPreferenecs).map((s) =>
          serializeStyle(s, defaultPreferenecs),
        ),
      ).toContain("padding: 2px 1px;");
    });

    it("Should have single-value padding rule for v/h paddings are the same value", () => {
      const input: figma.Node & figma.HasLegacyPadding = {
        id: "",
        name: "",
        type: "",
        horizontalPadding: 5,
        verticalPadding: 5,
      };

      expect(
        fromNode(input, defaultPreferenecs).map((s) =>
          serializeStyle(s, defaultPreferenecs),
        ),
      ).toContain("padding: 5px;");
    });

    it("Should have four-value padding", () => {
      const input: figma.Node & figma.HasPadding = {
        id: "",
        name: "",
        type: "",
        paddingTop: 1,
        paddingRight: 2,
        paddingBottom: 3,
        paddingLeft: 4,
      };

      expect(
        fromNode(input, defaultPreferenecs).map((s) =>
          serializeStyle(s, defaultPreferenecs),
        ),
      ).toContain("padding: 1px 2px 3px 4px;");
    });
  });

  describe("effects", () => {
    it("Should convert inner shadow effect", () => {
      const input: figma.Node & figma.HasEffects = {
        id: "",
        name: "",
        type: "",
        effects: [
          {
            type: "INNER_SHADOW",
            radius: 5,
            spread: 1,
            visible: true,
            offset: { x: 3, y: 4 },
            color: { r: 1, g: 1, b: 1, a: 1 },
            blendMode: "NORMAL",
          } satisfies figma.ShadowEffect,
        ],
      };

      const preferences: Preferences = {
        ...defaultPreferenecs,
        cssColorNotation: "hex",
      };

      expect(
        fromNode(input, preferences).map((s) => serializeStyle(s, preferences)),
      ).toContain("box-shadow: 3px 4px 5px 1px #ffffff inset;");
    });

    it("Should skip invisible effects", () => {
      const input: figma.Node & figma.HasEffects = {
        id: "",
        name: "",
        type: "",
        effects: [
          {
            type: "INNER_SHADOW",
            radius: 5,
            spread: 1,
            visible: false,
            offset: { x: 3, y: 4 },
            color: { r: 1, g: 1, b: 1, a: 1 },
            blendMode: "NORMAL",
          } satisfies figma.ShadowEffect,
        ],
      };

      const preferences: Preferences = {
        ...defaultPreferenecs,
        cssColorNotation: "hex",
      };

      expect(
        fromNode(input, preferences).map((s) => serializeStyle(s, preferences)),
      ).not.toContain("box-shadow: 3px 4px 5px 1px #ffffff inset;");
    });
  });
});
