export function roundTo(x: number, to: number = 0) {
  if (to === 0) {
    return Math.round(x);
  }

  const p = Math.pow(10, to);

  return Math.round(x * p) / p;
}

export const MAX_ZOOM = 2 ** 8;
export const MIN_ZOOM = 2 ** -6;

export function nextPowerOfTwo(num: number): number {
  const nearest = nearestPowerOfTwo(num);
  return Math.min(MAX_ZOOM, nearest > num ? nearest : nearest * 2);
}

export function previousPowerOfTwo(num: number): number {
  const nearest = nearestPowerOfTwo(num);
  return Math.max(MIN_ZOOM, nearest < num ? nearest : nearest / 2);
}

function nearestPowerOfTwo(num: number): number {
  if (num < MIN_ZOOM) {
    return MIN_ZOOM;
  } else if (num > MAX_ZOOM) {
    return MAX_ZOOM;
  }

  if (num < 1) {
    return 1 / nearestPowerOfTwo(1 / num);
  }

  const power = Math.round(Math.log(num) / Math.log(2));
  return 2 ** power;
}
