const stack: Computation[] = [];

const DEPENDANTS = Symbol();

export class Signal<T> {
  [DEPENDANTS] = new Set<Computation>();

  constructor(private value: T) {}

  set(value: T) {
    if (value === this.value) {
      return;
    }

    for (const computation of this[DEPENDANTS]) {
      computation.runCleanup();
    }

    this.value = value;

    const dependantComputations = Array.from(this[DEPENDANTS]);
    this[DEPENDANTS].clear();

    for (const computation of dependantComputations) {
      if (computation.isDestroyed) {
        continue;
      }

      computation.run(true);
    }
  }

  /**
   * Get a current value of the signal.
   * This method updates dependency graph.
   */
  get(): T {
    if (stack.length > 0) {
      this[DEPENDANTS].add(stack[stack.length - 1]);
    }

    return this.value;
  }

  /**
   * Get a current value of the signal.
   * This method does not update dependency graph.
   */
  once(): T {
    return this.value;
  }
}

type ComputationFn = () => void | (() => void);

class Computation {
  isDestroyed: boolean = false;
  childComputations = new Set<Computation>();
  cleanup: ComputationFn | null = null;

  constructor(private fn: ComputationFn) {}

  run(isolated = false): void {
    this.runCleanup();

    this.destroyChildren();

    if (stack.length > 0 && !isolated) {
      stack[stack.length - 1].childComputations.add(this);
    }

    stack.push(this);

    try {
      this.cleanup = this.fn() ?? null;
    } finally {
      stack.pop();
    }
  }

  runCleanup(): void {
    for (const child of this.childComputations) {
      child.runCleanup();
    }

    if (!this.cleanup) {
      return;
    }

    this.cleanup();
    this.cleanup = null;
  }

  destroy() {
    this.runCleanup();

    this.isDestroyed = true;

    this.destroyChildren();
  }

  destroyChildren() {
    for (const child of this.childComputations) {
      child.destroy();
    }

    this.childComputations.clear();
  }
}

export function compute<T>(f: () => T): Signal<T> {
  const signal = new Signal(undefined as any);

  effect(() => {
    signal.set(f());
  });

  return signal;
}

export function effect(f: ComputationFn): void {
  new Computation(f).run();
}
