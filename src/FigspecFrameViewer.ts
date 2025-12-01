import { attr, el } from "./dom.js";
import type * as figma from "./figma.js";
import { FrameCanvas } from "./FrameCanvas/FrameCanvas.js";
import {
  defaultPreferenecs,
  isEqual as isEqualPreferences,
  type Preferences,
} from "./preferences.js";
import { compute, effect, Signal } from "./signal.js";
import { styles } from "./styles.js";
import * as state from "./state.js";

import { ui } from "./ui/ui.js";
import { infoItems } from "./ui/infoItems/infoItems.js";

export class FigspecFrameViewer extends HTMLElement {
  #link = new Signal<string | null>(null);
  #resp = new Signal<figma.GetFileNodesResponse | null>(null);
  #image = new Signal<string | null>(null);

  #state: Signal<
    state.State<[figma.GetFileNodesResponse, figma.Node, string]>
  > = compute(() => {
    const resp = this.#resp.get();
    const image = this.#image.get();

    if (!resp && !image) {
      return state.idle;
    }

    if (!image) {
      return state.setupError(new Error("Image file URI is required"));
    }

    if (!resp) {
      return state.setupError(
        new Error("Returned result of Get File Nodes API is required"),
      );
    }

    const node = findMainNode(resp);
    if (!node) {
      return state.setupError(
        new Error("No renderable node is found in the data"),
      );
    }

    return state.loaded([resp, node, image]);
  });

  #givenPreferences: Readonly<Preferences> = { ...defaultPreferenecs };
  #preferences = new Signal<Preferences>({ ...this.#givenPreferences });

  set preferences(value: Readonly<Preferences>) {
    this.#givenPreferences = value;
    this.#preferences.set({ ...value });
  }

  get preferences(): Readonly<Preferences> {
    return this.#preferences.once();
  }

  #ui = ui({
    caller: "frame",
    state: this.#state,
    preferences: this.#preferences,
    infoContents: ([resp]) => {
      return infoItems([
        {
          label: "Filename",
          content: [resp.name],
        },
        {
          label: "Last modified",
          content: [new Date(resp.lastModified).toLocaleString()],
        },
        compute(() => {
          const link = this.#link.get();
          if (!link) {
            return null;
          }

          return {
            label: "Frame link",
            content: [
              el(
                "a",
                [
                  attr("href", link),
                  attr("target", "_blank"),
                  attr("rel", "noopener"),
                ],
                [link],
              ),
            ],
          };
        }),
      ]);
    },
    frameCanvas: ([, node, image], $selected, $loadedState, $snackbar) => {
      const frameCanvas = new FrameCanvas(
        this.#preferences,
        $selected,
        $snackbar,
      );

      frameCanvas.render([node], new Map([[node.id, image]]));

      let isFirstRun = true;
      effect(() => {
        const selected = $selected.get();
        if (isFirstRun) {
          isFirstRun = false;
          return;
        }

        this.dispatchEvent(
          new CustomEvent("nodeselect", {
            detail: {
              node: selected,
            },
          }),
        );
      });

      effect(() => {
        if (!state.isCanvas($loadedState.get())) {
          return;
        }

        frameCanvas.connectedCallback();

        return () => {
          frameCanvas.disconnectedCallback();
        };
      });

      effect(() => {
        return () => {
          frameCanvas.clear();
        };
      });

      return frameCanvas.container;
    },
  });

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const styleEl = document.createElement("style");

    styleEl.textContent += styles;
    styleEl.textContent += FrameCanvas.styles;

    shadow.appendChild(styleEl);

    effect(() => {
      const node = this.#ui.get();
      shadow.appendChild(node);

      return () => {
        shadow.removeChild(node);
      };
    });

    // Emit `preferencesupdate` event on preferences updates
    effect(() => {
      const preferences = this.#preferences.get();

      if (!isEqualPreferences(this.#givenPreferences, preferences)) {
        this.dispatchEvent(
          new CustomEvent("preferencesupdate", {
            detail: { preferences },
          }),
        );
      }
    });
  }

  get link(): string | null {
    return this.#link.once();
  }

  set link(link: string | null) {
    this.#link.set(link);
  }

  get renderedImage(): string | null {
    return this.#image.once();
  }

  set renderedImage(uri: string | undefined) {
    if (uri) {
      this.#image.set(uri);
    }
  }

  get apiResponse(): figma.GetFileNodesResponse | null {
    return this.#resp.once();
  }

  set apiResponse(resp: figma.GetFileNodesResponse | undefined) {
    if (!resp) {
      return;
    }

    this.#resp.set(resp);
  }

  static observedAttributes = ["link"] as const;

  public attributeChangedCallback(
    name: (typeof FigspecFrameViewer.observedAttributes)[number],
    oldValue: string | null,
    newValue: string | null,
  ): void {
    if (newValue === oldValue) {
      return;
    }

    switch (name) {
      case "link": {
        this.#link.set(newValue || null);
        return;
      }
    }
  }
}

function findMainNode(resp: figma.GetFileNodesResponse): figma.Node | null {
  for (const key in resp.nodes) {
    const node = resp.nodes[key];

    switch (node.document.type) {
      case "CANVAS":
      case "FRAME":
      case "GROUP":
      case "COMPONENT":
      case "COMPONENT_SET": {
        return node.document;
      }
    }
  }

  return null;
}
