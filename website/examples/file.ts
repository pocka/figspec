import { FigspecFileViewer } from "../../src";

import * as demoJson from "./demo-data/Klm6pxIZSaJFiOMX5FpTul9F/file.json";
import image2_5 from "./demo-data/Klm6pxIZSaJFiOMX5FpTul9F/2:5.svg";
import image2_9 from "./demo-data/Klm6pxIZSaJFiOMX5FpTul9F/2:9.svg";
import image2_13 from "./demo-data/Klm6pxIZSaJFiOMX5FpTul9F/2:13.svg";
import image64_1 from "./demo-data/Klm6pxIZSaJFiOMX5FpTul9F/64:1.svg";
import image93_14 from "./demo-data/Klm6pxIZSaJFiOMX5FpTul9F/93:14.svg";
import image93_32 from "./demo-data/Klm6pxIZSaJFiOMX5FpTul9F/93:32.svg";

const el = document.getElementById("demo");

if (el && el instanceof FigspecFileViewer) {
  el.apiResponse = demoJson;
  el.renderedImages = {
    "2:5": image2_5,
    "2:9": image2_9,
    "2:13": image2_13,
    "64:1": image64_1,
    "93:14": image93_14,
    "93:32": image93_32,
  };
}
