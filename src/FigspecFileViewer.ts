import { attr, el } from "./dom";
import * as figma from "./figma";
import { FrameCanvas } from "./FrameCanvas/FrameCanvas";
import {
  defaultPreferenecs,
  isEqual as isEqualPreferences,
  type Preferences,
} from "./preferences";
import { compute, effect, Signal } from "./signal";
import { styles } from "./styles";
import * as state from "./state";

import { ui } from "./ui/ui";
import { infoItems } from "./ui/infoItems/infoItems";
import { selectBox } from "./ui/selectBox/selectBox";

export class FigspecFileViewer extends HTMLElement {
  #link = new Signal<string | null>(null);
  #resp = new Signal<figma.GetFileResponse | null>(null);
  #images = new Signal<Map<string, string> | null>(null);

  #canvases = compute<Map<string, figma.Canvas>>(() => {
    const map = new Map<string, figma.Canvas>();

    const resp = this.#resp.get();
    if (!resp) {
      return map;
    }

    for (const canvas of figma.getCanvases(resp.document)) {
      map.set(canvas.id, canvas);
    }

    return map;
  });

  #selectedCanvasId = new Signal<string | null>(null);

  #state = compute<
    state.State<
      [figma.GetFileResponse, Map<string, string>, Map<string, figma.Canvas>]
    >
  >(() => {
    const resp = this.#resp.get();
    const images = this.#images.get();

    if (!resp && !images) {
      return state.idle;
    }

    if (!images) {
      return state.setupError(new Error("Rendered image set is required"));
    }

    if (!resp) {
      return state.setupError(
        new Error("Returned result of Get File API is required"),
      );
    }

    const canvases = this.#canvases.get();
    if (!canvases.size) {
      return state.setupError(new Error("No node has type=CANVAS."));
    }

    return state.loaded([resp, images, canvases]);
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
    caller: "file",
    state: this.#state,
    preferences: this.#preferences,
    infoContents: ([resp, , canvases]) => {
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
            label: "File link",
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
        {
          label: "Number of canvases",
          content: [canvases.size.toString(10)],
        },
      ]);
    },
    menuSlot: ([, , canvases]) => {
      return compute(() => {
        return selectBox({
          value: compute(() => this.#selectedCanvasId.get() ?? ""),
          options: Array.from(canvases).map(([, canvas]) =>
            el("option", [attr("value", canvas.id)], [canvas.name]),
          ),
          onChange: (value) => {
            if (canvases.has(value)) {
              this.#selectedCanvasId.set(value);
            }
          },
        });
      });
    },
    frameCanvas: ([, images, canvases], $selected, $loadedState) => {
      const frameCanvas = new FrameCanvas(this.#preferences, $selected);

      effect(() => {
        $selected.set(null);

        const currentId = this.#selectedCanvasId.get();
        if (typeof currentId !== "string") {
          return;
        }

        const node = canvases.get(currentId);
        if (!node) {
          return;
        }

        frameCanvas.render([node], images);

        return () => {
          frameCanvas.clear();
        };
      });

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

      return frameCanvas.container;
    },
  });

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");

    style.textContent += styles;
    style.textContent += FrameCanvas.styles;

    shadow.appendChild(style);

    effect(() => {
      for (const [id] of this.#canvases.get()) {
        this.#selectedCanvasId.set(id);

        return () => {
          this.#selectedCanvasId.set(null);
        };
      }
    });

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

  set link(link: string | null) {
    this.#link.set(link);
  }

  get link(): string | null {
    return this.#link.once();
  }

  get renderedImages(): Record<string, string> | null {
    const map = this.#images.once();
    if (!map) {
      return null;
    }

    return Object.fromEntries(map.entries());
  }

  set renderedImages(set: Record<string, string>) {
    const map = new Map<string, string>();

    for (const nodeId in set) {
      map.set(nodeId, set[nodeId]);
    }

    this.#images.set(map);
  }

  get apiResponse(): figma.GetFileResponse | null {
    return this.#resp.once();
  }

  set apiResponse(resp: figma.GetFileResponse | undefined) {
    if (!resp) {
      return;
    }

    this.#resp.set(resp);
  }

  static observedAttributes = ["link"] as const;

  public attributeChangedCallback(
    name: (typeof FigspecFileViewer.observedAttributes)[number],
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
