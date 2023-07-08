import { FigspecFrameViewer } from "../../src";

import * as demoFrame from "./demo-data/Klm6pxIZSaJFiOMX5FpTul9F/64:1.json";
import demoImage from "./demo-data/Klm6pxIZSaJFiOMX5FpTul9F/64:1.svg";

const el = document.getElementById("demo");

if (el && el instanceof FigspecFrameViewer) {
  // @ts-ignore
  el.nodes = demoFrame;
  el.renderedImage = demoImage;
}
