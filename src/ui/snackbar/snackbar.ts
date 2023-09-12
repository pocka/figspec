import { attr, className, el, type ElementFn } from "../../dom.js";
import { compute, effect, type Signal } from "../../signal.js";

export const styles = /* css */ `
  .sn-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    overflow: hidden;
    pointer-events: none;
  }

  @keyframes slidein {
    0% {
      opacity: 0;
      transform: translateY(30%);
    }

    70% {
      opacity: 1;
    }

    100% {
      transform: translateY(0px);
    }
  }

  @keyframes fadein {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  .sn-wrapper {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    padding: var(--snackbar-margin);
    min-width: 0;
    width: 100%;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  .sn-bar {
    margin: 0;
    min-width: 0;
    display: inline-block;
    padding: var(--snackbar-padding);
    font-family: var(--snackbar-font-family);
    font-size: var(--snackbar-font-size);
    border: var(--snackbar-border);
    box-sizing: border-box;

    background-color: var(--snackbar-bg);
    border-radius: var(--snackbar-radius);
    box-shadow: var(--snackbar-shadow);
    color: var(--snackbar-fg);
    pointer-events: all;
    z-index: calc(var(--z-index) + 11);

    animation: 0.15s ease-in 0s 1 forwards slidein;
  }

  @media (prefers-reduced-motion: reduce) {
    .sn-bar {
      animation-name: fadein;
    }
  }
`;

export type SnackbarContent = NonNullable<Parameters<typeof el>[2]> | null;

interface SnackbarProps {
  signal: Signal<SnackbarContent>;

  lifetimeMs: number;

  attrs?: readonly ElementFn<HTMLDivElement>[];
}

export function snackbar({
  signal,
  lifetimeMs,
  attrs = [],
}: SnackbarProps): HTMLDivElement {
  effect(() => {
    if (!signal.get()) {
      return;
    }

    const timerId = setTimeout(() => {
      signal.set(null);
    }, lifetimeMs);

    return () => {
      clearTimeout(timerId);
    };
  });

  return el(
    "div",
    [...attrs, className("sn-container"), attr("aria-live", "polite")],
    [
      compute(() => {
        const value = signal.get();
        if (!value) {
          return null;
        }

        return el(
          "div",
          [className("sn-wrapper")],
          [el("p", [className("sn-bar")], value)],
        );
      }),
    ],
  );
}
