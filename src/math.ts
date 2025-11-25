export function roundTo(x: number, to: number = 0) {
  if (to === 0) {
    return Math.round(x);
  }

  const p = Math.pow(10, to);

  return Math.round(x * p) / p;
}

export const MAX_SCALE = 2 ** 8;
export const MIN_SCALE = 2 ** -6;

export function nextPowerOfTwo(num: number): number {
  const nearest = nearestPowerOfTwo(num);
  return Math.min(MAX_SCALE, nearest > num ? nearest : nearest * 2);
}

export function previousPowerOfTwo(num: number): number {
  const nearest = nearestPowerOfTwo(num);
  return Math.max(MIN_SCALE, nearest < num ? nearest : nearest / 2);
}

function nearestPowerOfTwo(num: number): number {
  if (num < MIN_SCALE) {
    return MIN_SCALE;
  } else if (num > MAX_SCALE) {
    return MAX_SCALE;
  }

  if (num < 1) {
    return 1 / nearestPowerOfTwo(1 / num);
  }

  const power = Math.round(Math.log(num) / Math.log(2));
  return 2 ** power;
}
