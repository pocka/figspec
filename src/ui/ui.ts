import { el } from "../dom.js";
import type * as figma from "../figma.js";
import { type Preferences } from "../preferences.js";
import { compute, Signal } from "../signal.js";
import {
  canvas,
  info,
  preferences,
  isIdle,
  isSetupError,
  isInfo,
  isPreferences,
  type LoadedState,
  type State,
} from "../state.js";

import { empty } from "./empty/empty.js";
import { fullscreenPanel } from "./fullscreenPanel/fullscreenPanel.js";
import { inspectorPanel } from "./inspectorPanel/inspectorPanel.js";
import { menuBar } from "./menuBar/menuBar.js";
import { preferencesPanel } from "./preferencesPanel/preferencesPanel.js";
import { snackbar, type SnackbarContent } from "./snackbar/snackbar.js";

const SNACKBAR_LIFETIME = 3000;

type ElementChild = NonNullable<Parameters<typeof el>[2]>[number];

interface UIProps<T> {
  state: Signal<State<T>>;
  preferences: Signal<Readonly<Preferences>>;

  infoContents: (data: T) => ElementChild;
  frameCanvas: (
    data: T,
    selected: Signal<figma.Node | null>,
    loadedState: Signal<LoadedState>,
    snackbar: Signal<SnackbarContent>,
  ) => ElementChild;
  menuSlot?: (data: T) => ElementChild;

  caller: "frame" | "file";
}

export function ui<T>({
  state: $state,
  preferences: $preferences,
  infoContents: createinfoContents,
  frameCanvas: createFrameCanvas,
  menuSlot: createMenuSlot,
  caller,
}: UIProps<T>): Signal<HTMLElement> {
  const $snackbar = new Signal<SnackbarContent>(null);

  return compute(() => {
    const s = $state.get();

    if (isIdle(s)) {
      if (caller === "file") {
        return empty({
          title: ["No Figma file"],
          body: [
            el(
              "p",
              [],
              [
                "Both Figma file data and rendered images are missing. ",
                "Please provide those in order to start Figspec File Viewer. ",
              ],
            ),
          ],
        });
      }

      return empty({
        title: ["No Figma frame"],
        body: [
          el(
            "p",
            [],
            [
              "Both frame data and rendered image are missing. ",
              "Please provide those in order to start Figspec Frame Viewer. ",
            ],
          ),
        ],
      });
    }

    if (isSetupError(s)) {
      return empty({
        title: ["Failed to render Figma ", caller],
        body: [
          el(
            "p",
            [],
            ["Couldn't render the Figma ", caller, " due to an error."],
          ),
          el("pre", [], [s.error.message, "\n\n", s.error.stack]),
        ],
      });
    }

    const $loadedState = new Signal<LoadedState>(canvas);
    const $selected = new Signal<figma.Node | null>(null);

    const frameCanvas = createFrameCanvas(
      s.data,
      $selected,
      $loadedState,
      $snackbar,
    );

    const perState = compute(() => {
      const loadedState = $loadedState.get();

      if (isInfo(loadedState)) {
        return fullscreenPanel({
          body: [createinfoContents(s.data)],
          onClose() {
            $loadedState.set(canvas);
          },
        });
      }

      if (isPreferences(loadedState)) {
        return fullscreenPanel({
          body: [preferencesPanel({ preferences: $preferences })],
          onClose() {
            $loadedState.set(canvas);
          },
        });
      }

      return el(
        "div",
        [],
        [
          menuBar({
            slot: [createMenuSlot?.(s.data)],
            onOpenInfo() {
              $loadedState.set(info);
            },
            onOpenPreferences() {
              $loadedState.set(preferences);
            },
          }),
          inspectorPanel({
            selected: $selected,
            preferences: $preferences,
            snackbar: $snackbar,
            onOpenPreferencesPanel() {
              $loadedState.set(preferences);
            },
          }),
        ],
      );
    });

    const layer = el(
      "div",
      [],
      [
        frameCanvas,
        perState,
        snackbar({ signal: $snackbar, lifetimeMs: SNACKBAR_LIFETIME }),
      ],
    );

    return layer;
  });
}
