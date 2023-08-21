export function roundTo(x: number, to: number = 0) {
  if (to === 0) {
    return Math.round(x);
  }

  const p = Math.pow(10, to);

  return Math.round(x * p) / p;
}
