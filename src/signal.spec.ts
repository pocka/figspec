import { describe, expect, it, vi } from "vitest";

import { compute, Signal, effect } from "./signal";

describe("Signal", () => {
  it("Should execute callback", () => {
    const a = new Signal(5);
    const b = new Signal(6);

    expect(compute(() => a.get() + b.get()).get()).toBe(11);
  });

  it("Should update callback", () => {
    const s = new Signal("foo");

    expect(s.get()).toBe("foo");

    s.set("bar");

    expect(s.get()).toBe("bar");
  });

  it("Should run effect", () => {
    const s = new Signal("foo");
    const fn = vi.fn();

    effect(() => {
      fn(s.get());
    });

    s.set("bar");
    s.set("baz");

    expect(fn).toHaveBeenNthCalledWith(1, "foo");
    expect(fn).toHaveBeenNthCalledWith(2, "bar");
    expect(fn).toHaveBeenNthCalledWith(3, "baz");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("Should discard child computation", () => {
    const s = new Signal("foo");
    const first = vi.fn();
    const second = vi.fn();
    const third = vi.fn();

    effect(() => {
      first();
      s.get();

      effect(() => {
        second();
        s.get();

        effect(() => {
          third();
        });
      });
    });

    s.set("bar");
    s.set("baz");

    expect(first).toHaveBeenCalledTimes(3);
    expect(second).toHaveBeenCalledTimes(3);
    expect(third).toHaveBeenCalledTimes(3);
  });

  it("Should run effect minimally", () => {
    const s1 = new Signal("foo");
    const s2 = new Signal(1);
    const first = vi.fn();
    const second = vi.fn();
    const third = vi.fn();
    const fourth = vi.fn();

    effect(() => {
      first();
      s1.get();

      effect(() => {
        second();

        const s3 = compute(() => {
          const v2 = s2.get();

          third(v2);

          return v2;
        });

        effect(() => {
          fourth(s3.get());
        });
      });
    });

    s2.set(2);
    s2.set(3);

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(third).toHaveBeenNthCalledWith(1, 1);
    expect(third).toHaveBeenNthCalledWith(2, 2);
    expect(third).toHaveBeenNthCalledWith(3, 3);
    expect(third).toHaveBeenCalledTimes(3);
    expect(fourth).toHaveBeenNthCalledWith(1, 1);
    expect(fourth).toHaveBeenNthCalledWith(2, 2);
    expect(fourth).toHaveBeenNthCalledWith(3, 3);
    expect(fourth).toHaveBeenCalledTimes(3);
  });

  it("Signal#once Should not update dependency graph", () => {
    const s = new Signal(1);
    const fn = vi.fn();

    effect(() => {
      fn(s.once());
    });

    s.set(2);

    expect(fn).toBeCalledWith(1);
    expect(fn).toBeCalledTimes(1);
  });

  it("Should skip re-calculation if the value is same", () => {
    const s = new Signal(1);
    const fn = vi.fn();

    effect(() => {
      fn(s.get());
    });

    s.set(1);
    s.set(1);

    expect(fn).toBeCalledWith(1);
    expect(fn).toBeCalledTimes(1);
  });

  it("Should run cleanup function", () => {
    const s1 = new Signal(1);
    const s2 = new Signal("foo");

    const f1 = vi.fn();
    const f2 = vi.fn();
    const f3 = vi.fn();

    effect(() => {
      s1.get();

      effect(() => {
        return () => {
          f2(s2.get());
        };
      });

      effect(() => {
        return () => {
          f3();
        };
      });

      return () => {
        f1(s1.get());
      };
    });

    s1.set(2);
    s2.set("bar");

    expect(f1).toHaveBeenCalledOnce();
    expect(f1).toHaveBeenCalledWith(1);
    expect(f2).toHaveBeenCalledTimes(1);
    expect(f3).toHaveBeenCalledTimes(1);
  });
});
