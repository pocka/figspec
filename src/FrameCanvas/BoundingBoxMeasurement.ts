import type * as figma from "../figma";

/**
 * Measure bounding box for nodes.
 */
export class BoundingBoxMeasurement {
  #minX = Infinity;
  #maxX = -Infinity;
  #minY = Infinity;
  #maxY = -Infinity;

  /**
   * Add a node to the measurement.
   */
  addNode(node: figma.Node & figma.HasBoundingBox): void {
    if (node.visible === false) {
      return;
    }

    const box = node.absoluteRenderBounds || node.absoluteBoundingBox;

    this.#minX = Math.min(this.#minX, box.x);
    this.#maxX = Math.max(this.#maxX, box.x + box.width);
    this.#minY = Math.min(this.#minY, box.y);
    this.#maxY = Math.max(this.#maxY, box.y + box.height);
  }

  /**
   * Returns a bounding box for added nodes.
   */
  measure(): figma.Rectangle {
    return {
      x: Number.isFinite(this.#minX) ? this.#minX : NaN,
      y: Number.isFinite(this.#minY) ? this.#minY : NaN,
      width:
        Number.isFinite(this.#maxX) && Number.isFinite(this.#minX)
          ? this.#maxX - this.#minX
          : NaN,
      height:
        Number.isFinite(this.#maxY) && Number.isFinite(this.#minY)
          ? this.#maxY - this.#minY
          : NaN,
    };
  }
}
