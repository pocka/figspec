import { FigspecFrameViewer } from "../../src";

import * as demoFrame from "./demo-data/BXLAHpnTWaZL7Xcnp3aq3g/7-29212.json";
import demoImage from "./demo-data/BXLAHpnTWaZL7Xcnp3aq3g/7-29212.svg";

const el = document.getElementById("demo");

if (el && el instanceof FigspecFrameViewer) {
  // @ts-ignore
  el.nodes = demoFrame;
  el.renderedImage = demoImage;
}
