import { FigspecFrameViewer } from "../../src";

import * as demoFrame from "./demo-data/Klm6pxIZSaJFiOMX5FpTul9F/64:1.json";

const el = document.getElementById("demo");

if (el && el instanceof FigspecFrameViewer) {
  el.apiResponse = demoFrame;
}
