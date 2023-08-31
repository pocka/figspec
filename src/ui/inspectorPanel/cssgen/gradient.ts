import type * as figma from "../../../figma";

/**
 * @returns Angle in degrees
 */
export function getLinearGradientAngle(
  start: figma.Vector,
  end: figma.Vector,
): number {
  return radToDeg(getAngle(start, end));
}

/**
 * Get angle of the vector in radian
 * @returns Angle in radian
 */
function getAngle(start: figma.Vector, end: figma.Vector): number {
  return Math.atan(((end.y - start.y) / (end.x - start.x)) * -1);
}

export function radToDeg(rad: number): number {
  const deg = ((180 * rad) / Math.PI) | 0;

  return deg < 0 ? 360 + deg : deg;
}
