import * as figma from "../figma";

// Intermediate value, context object.
interface MinMaxXY {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * Calculate the size and position of where to put an API rendered image.
 * Ealier API did not return `absoluteRenderBounds`, so in order to place an API rendered image
 * to correct position, client need to measure the effect radius of LAYER_BLUR and DROP_SHADOW.
 */
export function getRenderBoundingBox(
  node: figma.Node & figma.HasBoundingBox,
): figma.Rectangle {
  if (node.absoluteRenderBounds) {
    return node.absoluteRenderBounds;
  }

  let current: MinMaxXY | null = null;

  for (const target of figma.walk(node)) {
    if (target.visible === false || !figma.hasBoundingBox(target)) {
      continue;
    }

    const minmax = calculateRenderingBoundingBox(target);

    if (!current) {
      current = minmax;
      continue;
    }

    current.minX = Math.min(current.minX, minmax.minX);
    current.minY = Math.min(current.minY, minmax.minY);
    current.maxX = Math.max(current.maxX, minmax.maxX);
    current.maxY = Math.max(current.maxY, minmax.maxY);
  }

  return current
    ? {
        x: current.minX,
        y: current.minY,
        width: current.maxX - current.minX,
        height: current.maxY - current.minY,
      }
    : node.absoluteBoundingBox;
}

function calculateRenderingBoundingBox(
  node: figma.Node & figma.HasBoundingBox,
): MinMaxXY {
  if (!figma.hasEffects(node)) {
    return {
      minX: node.absoluteBoundingBox.x,
      maxX: node.absoluteBoundingBox.x + node.absoluteBoundingBox.width,
      minY: node.absoluteBoundingBox.y,
      maxY: node.absoluteBoundingBox.y + node.absoluteBoundingBox.height,
    };
  }

  // If the frame has effects, the size of rendered image is larger than frame's size
  // because of rendered effects.
  const margins = { top: 0, right: 0, bottom: 0, left: 0 };

  for (const effect of node.effects) {
    if (effect.visible === false) {
      continue;
    }

    if (figma.isShadowEffect(effect) && effect.type === "DROP_SHADOW") {
      margins.left = Math.max(margins.left, effect.radius - effect.offset.x);
      margins.top = Math.max(margins.top, effect.radius - effect.offset.y);
      margins.right = Math.max(margins.right, effect.radius + effect.offset.x);
      margins.bottom = Math.max(
        margins.bottom,
        effect.radius + effect.offset.y,
      );
      continue;
    }

    if (effect.type === "LAYER_BLUR") {
      margins.top = Math.max(margins.top, effect.radius);
      margins.right = Math.max(margins.right, effect.radius);
      margins.bottom = Math.max(margins.bottom, effect.radius);
      margins.left = Math.max(margins.left, effect.radius);
      continue;
    }

    // Other effects does not changes a size of rendered image
  }

  return {
    minX: node.absoluteBoundingBox.x - margins.left,
    maxX:
      node.absoluteBoundingBox.x +
      node.absoluteBoundingBox.width +
      margins.right,
    minY: node.absoluteBoundingBox.y - margins.top,
    maxY:
      node.absoluteBoundingBox.y +
      node.absoluteBoundingBox.height +
      margins.bottom,
  };
}
