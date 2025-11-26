export function roundTo(x: number, to: number = 0) {
  if (to === 0) {
    return Math.round(x);
  }

  const p = Math.pow(10, to);

  return Math.round(x * p) / p;
}

interface PowerOfTwoOptions {
  min: number;
  max: number;
}

export function nextPowerOfTwo(
  num: number,
  options: PowerOfTwoOptions,
): number {
  const nearest = nearestPowerOfTwo(num, options);
  return Math.min(options.max, nearest > num ? nearest : nearest * 2);
}

export function previousPowerOfTwo(
  num: number,
  options: PowerOfTwoOptions,
): number {
  const nearest = nearestPowerOfTwo(num, options);
  return Math.max(options.min, nearest < num ? nearest : nearest / 2);
}

function nearestPowerOfTwo(num: number, options: PowerOfTwoOptions): number {
  if (num < options.min) {
    return options.min;
  } else if (num > options.max) {
    return options.max;
  }

  if (num < 1) {
    return 1 / nearestPowerOfTwo(1 / num, options);
  }

  const power = Math.round(Math.log(num) / Math.log(2));
  return 2 ** power;
}
