import { FigspecFrameViewer } from "../src";

import * as demoFrame from "./examples/demo-data/Klm6pxIZSaJFiOMX5FpTul9F/64:1.json";
import demoImage from "./examples/demo-data/Klm6pxIZSaJFiOMX5FpTul9F/64:1.svg";

const PREFERENCES_KEY = "figspec_preferences_v1";

const savedPreferences = localStorage.getItem(PREFERENCES_KEY);

const demo = document.getElementById("frame_demo");

if (demo && demo instanceof FigspecFrameViewer) {
  try {
    if (savedPreferences) {
      const value = JSON.parse(savedPreferences);

      demo.preferences = value;
    }
  } catch (error) {
    console.error("Failed to restore saved preferences");
  }

  demo.apiResponse = demoFrame;
  demo.renderedImage = demoImage;

  demo.addEventListener("preferencesupdate", (ev) => {
    const { preferences } = (ev as CustomEvent).detail;

    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  });
}
