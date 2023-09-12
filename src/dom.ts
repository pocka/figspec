import { effect, Signal } from "./signal.js";

export type ElementFn<T extends HTMLElement | SVGElement> = (el: T) => void;

// TypeScript somehow rejects Signal<HTMLElement | SVGELement> (maybe due to their web typings?)
// A | B | C -> Signal<A> | Signal<B> | Signal<C>
type ToSignal<T> = T extends any ? Signal<T> : never;

type AttrValue = string | boolean;

/**
 * Set or remove an attribute.
 *
 * @param name - An attribute name.
 * @param value - `string` is set as-is. `boolean` follows HTML's boolean attribute semantics:
 *                `true` sets an empty string and `false` removes the attribute itself.
 */
export function attr<T extends HTMLElement | SVGElement>(
  name: string,
  value: AttrValue | ToSignal<AttrValue> | Signal<AttrValue>,
): ElementFn<T> {
  return (el) => {
    if (value instanceof Signal) {
      effect(() => {
        const v = value.get();

        if (typeof v === "string") {
          el.setAttribute(name, v);
        } else if (v === true) {
          el.setAttribute(name, "");
        } else {
          el.removeAttribute(name);
        }
      });
    } else if (typeof value === "string") {
      el.setAttribute(name, value);
    } else if (value === true) {
      el.setAttribute(name, "");
    }
  };
}

/**
 * Assign a value to the property.
 */
export function prop<T extends HTMLElement | SVGElement, K extends keyof T>(
  key: K,
  value: T[K] | Signal<T[K]>,
): ElementFn<T> {
  return (el) => {
    if (value instanceof Signal) {
      effect(() => {
        el[key] = value.get();
      });
    } else {
      el[key] = value;
    }
  };
}

/**
 * Invoke the given callback after `requestAnimationFrame`.
 *
 * Provided as an escape-hatch for DOM quirks.
 *
 * @example
 * el("select", [
 *   raf(compute(() => (el) => {
 *     el.value = value.get();
 *   }))
 * ])
 */
export function raf<T extends HTMLElement | SVGElement>(
  f: ((el: T) => void) | Signal<(el: T) => void>,
): ElementFn<T> {
  return (el) => {
    requestAnimationFrame(() => {
      if (f instanceof Signal) {
        effect(() => {
          f.get()(el);
        });
      } else {
        f(el);
      }
    });
  };
}

/**
 * Set element's inline style.
 *
 * This is not same as `HTMLElement.style.foo`: under the hood, `CSSStyleDeclaration.setProperty` is used.
 * Hence, property name must be hyphen-cased.
 * Property value can be one of `string`, `null`, or `undefined`.
 *
 * - `string`    ... Sets the value to the property.
 * - `null`      ... Removes the property from stylesheet.
 * - `undefined` ... Does nothing.
 *
 * When used with Signal, use of `undefined` would lead to confusing behavor.
 *
 * ```ts
 * const border = signal<string | undefined>("1px solid #000");
 * style({ border });
 * border.set(undefined)
 * ```
 *
 * In the above code, setting `undefined` does nothing: the actual border property's value
 * is still `1px solid #000`. In order to avoid these kind of surprising situation, use of
 * `string` is always recommended.
 *
 * ```ts
 * const border = signal("1px solid #000");
 * style({ border });
 * border.set("none")
 * ```
 */
export function style<T extends HTMLElement | SVGElement>(
  style: Record<
    string,
    string | null | undefined | Signal<string | null | undefined>
  >,
): ElementFn<T> {
  return (el) => {
    for (const key in style) {
      const value = style[key];
      if (typeof value === "string") {
        el.style.setProperty(key, value);
      } else if (value instanceof Signal) {
        effect(() => {
          const v = value.get();

          if (typeof v === "string") {
            el.style.setProperty(key, v);
          } else if (v === null) {
            el.style.removeProperty(key);
          }
        });
      } else if (value === null) {
        el.style.removeProperty(key);
      }
    }
  };
}

/**
 * Sets a class or a list of classes.
 *
 * This function does not accept Signal.
 * Use `data-*` attribute or property for dynamic values.
 */
export function className<T extends HTMLElement | SVGElement>(
  ...value: readonly string[]
): ElementFn<T> {
  return (el) => {
    el.classList.add(...value);
  };
}

/**
 * Attach an event listener.
 */
export function on<T extends HTMLElement, E extends keyof HTMLElementEventMap>(
  eventName: E,
  callback: (event: HTMLElementEventMap[E]) => void,
  options?: AddEventListenerOptions,
): ElementFn<HTMLElement>;
export function on<T extends SVGElement, E extends keyof SVGElementEventMap>(
  eventName: E,
  callback: (event: SVGElementEventMap[E]) => void,
  options?: AddEventListenerOptions,
): ElementFn<SVGElement>;
export function on<
  T extends HTMLElement | SVGElement,
  E extends keyof HTMLElementEventMap | keyof SVGElementEventMap,
>(
  eventName: E,
  callback: (event: (HTMLElementEventMap & SVGElementEventMap)[E]) => void,
  options?: AddEventListenerOptions,
): ElementFn<T> {
  return (el) => {
    // @ts-expect-error: This is a limit coming from TS being dirty hack illusion.
    el.addEventListener(eventName, callback, options);
  };
}

type ElementChild = HTMLElement | SVGElement | string | null | undefined;

function appendChild(parent: Element, child: ElementChild): void {
  if (child === null || typeof child === "undefined") {
    return;
  }

  if (typeof child === "string") {
    parent.appendChild(document.createTextNode(child));
  } else {
    parent.appendChild(child);
  }
}

// `el` is parameterized because a function to create an `Element` depends on Element types. (sub-types?)
function provision<T extends HTMLElement | SVGElement>(
  el: T,
  attrs: readonly ElementFn<T>[],
  children: readonly (
    | ElementChild
    | ToSignal<ElementChild>
    | Signal<ElementChild>
  )[],
): T {
  for (const attr of attrs) {
    attr(el);
  }

  for (const child of children) {
    if (child instanceof Signal) {
      const start = document.createTextNode("");
      const end = document.createTextNode("");

      el.appendChild(start);
      el.appendChild(end);

      effect(() => {
        const childNode = child.get();

        const prevNode =
          !start.nextSibling || start.nextSibling === end
            ? null
            : start.nextSibling;

        if (childNode === null || typeof childNode === "undefined") {
          if (prevNode) {
            prevNode.remove();
          }
          return;
        }

        const node =
          typeof childNode === "string"
            ? document.createTextNode(childNode)
            : childNode;
        if (prevNode) {
          prevNode.replaceWith(node);
        } else {
          el.insertBefore(node, end);
        }
      });
    } else {
      appendChild(el, child);
    }
  }

  return el;
}

/**
 * Create a HTML element.
 */
export function el<TagName extends keyof HTMLElementTagNameMap>(
  tagName: TagName,
  attrs: readonly ElementFn<HTMLElementTagNameMap[TagName]>[] = [],
  children: readonly (
    | ElementChild
    | ToSignal<ElementChild>
    | Signal<ElementChild>
  )[] = [],
): HTMLElementTagNameMap[TagName] {
  return provision(document.createElement(tagName), attrs, children);
}

/**
 * Create a SVG element.
 *
 * You don't need to set `xmlns` attribute for elements created by this function.
 */
export function svg<TagName extends keyof SVGElementTagNameMap>(
  tagName: TagName,
  attrs: readonly ElementFn<SVGElementTagNameMap[TagName]>[] = [],
  children: readonly (
    | ElementChild
    | ToSignal<ElementChild>
    | Signal<ElementChild>
  )[] = [],
): SVGElementTagNameMap[TagName] {
  return provision(
    document.createElementNS("http://www.w3.org/2000/svg", tagName),
    attrs,
    children,
  );
}
