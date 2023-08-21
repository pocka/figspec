import { describe, expect, it } from "vitest";

import type * as figma from "../figma";

import { getRenderBoundingBox } from "./getRenderBoundingBox";

describe("getRenderBoundingBox", () => {
  it("Should accumulate blur effect radius", () => {
    const node: figma.Node & figma.HasEffects & figma.HasBoundingBox = {
      type: "DUMMY",
      id: "DUMMY",
      name: "DUMMY",
      absoluteBoundingBox: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
      effects: [
        {
          type: "LAYER_BLUR",
          radius: 5,
          visible: true,
        },
      ],
    };

    expect(getRenderBoundingBox(node)).toMatchObject({
      x: -5,
      y: -5,
      width: 110,
      height: 110,
    });
  });

  it("Should accumulate the size of drop shadow effect", () => {
    const node: figma.Node & figma.HasEffects & figma.HasBoundingBox = {
      type: "DUMMY",
      id: "DUMMY",
      name: "DUMMY",
      absoluteBoundingBox: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
      effects: [
        {
          type: "DROP_SHADOW",
          radius: 2,
          visible: true,
          offset: {
            x: 3,
            y: 3,
          },
          color: { r: 0, g: 0, b: 0, a: 0.3 },
          blendMode: "NORMAL",
        },
      ],
    };

    expect(getRenderBoundingBox(node)).toMatchObject({
      x: 0,
      y: 0,
      width: 105,
      height: 105,
    });
  });

  it("Should skip invisible effects", () => {
    const node: figma.Node & figma.HasEffects & figma.HasBoundingBox = {
      type: "DUMMY",
      id: "DUMMY",
      name: "DUMMY",
      absoluteBoundingBox: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
      effects: [
        {
          type: "LAYER_BLUR",
          radius: 5,
          visible: false,
        },
        {
          type: "DROP_SHADOW",
          radius: 2,
          visible: false,
          offset: {
            x: 5,
            y: 0,
          },
          color: { r: 0, g: 0, b: 0, a: 0.3 },
          blendMode: "NORMAL",
        },
      ],
    };

    expect(getRenderBoundingBox(node)).toMatchObject({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
  });

  it("Should include desendants' effects too", () => {
    const grandChild: figma.Node & figma.HasBoundingBox & figma.HasEffects = {
      type: "DUMMY",
      id: "DUMMY",
      name: "DUMMY",
      absoluteBoundingBox: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
      effects: [
        {
          type: "DROP_SHADOW",
          radius: 5,
          visible: true,
          offset: {
            x: 5,
            y: 5,
          },
          color: { r: 0, g: 0, b: 0, a: 0.3 },
          blendMode: "NORMAL",
        },
      ],
    };

    const child: figma.Node &
      figma.HasChildren &
      figma.HasBoundingBox &
      figma.HasEffects = {
      type: "DUMMY",
      id: "DUMMY",
      name: "DUMMY",
      effects: [
        {
          type: "LAYER_BLUR",
          radius: 3,
          visible: true,
        },
      ],
      absoluteBoundingBox: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
      children: [grandChild],
    };

    const parent: figma.Node & figma.HasChildren & figma.HasBoundingBox = {
      type: "DUMMY",
      id: "DUMMY",
      name: "DUMMY",
      absoluteBoundingBox: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
      children: [child],
    };

    expect(getRenderBoundingBox(parent)).toMatchObject({
      x: -3,
      y: -3,
      width: 113,
      height: 113,
    });
  });

  it("Should skip node without bounding box", () => {
    const child: figma.Node & figma.HasEffects = {
      type: "DUMMY",
      id: "DUMMY",
      name: "DUMMY",
      effects: [
        {
          type: "LAYER_BLUR",
          radius: 3,
          visible: true,
        },
      ],
    };

    const parent: figma.Node & figma.HasChildren & figma.HasBoundingBox = {
      type: "DUMMY",
      id: "DUMMY",
      name: "DUMMY",
      absoluteBoundingBox: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
      children: [child],
    };
    expect(getRenderBoundingBox(parent)).toMatchObject({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
  });
});
