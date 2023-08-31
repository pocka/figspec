import { describe, expect, it } from "vitest";

import { BoundingBoxMeasurement } from "./BoundingBoxMeasurement";

describe("BoundingBoxMeasurement", () => {
  it("Should measure bounding box for nodes", () => {
    const bbox = new BoundingBoxMeasurement();

    bbox.addNode({
      type: "DUMMY",
      id: "DUMMY",
      name: "DUMMY",
      absoluteBoundingBox: {
        x: -50,
        y: -50,
        width: 1,
        height: 1,
      },
    });

    bbox.addNode({
      type: "DUMMY",
      id: "DUMMY",
      name: "DUMMY",
      absoluteBoundingBox: {
        x: 40,
        y: 40,
        width: 10,
        height: 10,
      },
    });

    expect(bbox.measure()).toMatchObject({
      x: -50,
      y: -50,
      width: 100,
      height: 100,
    });
  });

  it("Should use NaN if no nodes were added", () => {
    const bbox = new BoundingBoxMeasurement();

    expect(bbox.measure()).toMatchObject({
      x: NaN,
      y: NaN,
      width: NaN,
      height: NaN,
    });
  });
});
