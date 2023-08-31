import { FigspecFrameViewer } from "../../src";

import * as demoFrame from "./demo-data/Klm6pxIZSaJFiOMX5FpTul9F/64:1.json";
import demoImage from "./demo-data/Klm6pxIZSaJFiOMX5FpTul9F/64:1.svg";

const el = document.getElementById("demo");

if (el && el instanceof FigspecFrameViewer) {
  el.apiResponse = demoFrame;
  el.renderedImage = demoImage;

  el.addEventListener("nodeselect", (ev) => {
    console.log(ev);
  });

  el.addEventListener("preferencesupdate", (ev) => {
    console.log(ev);
  });
}
