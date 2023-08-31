import { FigspecFrameViewer } from "../../src";

import * as demoFrame from "./demo-data/BXLAHpnTWaZL7Xcnp3aq3g/7-29212.json";
import demoImage from "./demo-data/BXLAHpnTWaZL7Xcnp3aq3g/7-29212.svg";

const el = document.getElementById("demo");

if (el && el instanceof FigspecFrameViewer) {
  // @ts-ignore: TS can't handle large file
  el.apiResponse = demoFrame;
  el.renderedImage = demoImage;
}
