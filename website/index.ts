import { FigspecFrameViewer } from "../src";

import * as demoFrame from "./examples/demo-data/Klm6pxIZSaJFiOMX5FpTul9F/64:1.json";
import demoImage from "./examples/demo-data/Klm6pxIZSaJFiOMX5FpTul9F/64:1.svg";

const demo = document.getElementById("frame_demo");

if (demo && demo instanceof FigspecFrameViewer) {
  // @ts-ignore: It's machine-generated data and library types. Nothing I can do here.
  demo.nodes = demoFrame;
  demo.renderedImage = demoImage;
}
