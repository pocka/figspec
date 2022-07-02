import { FigspecFrameViewer } from "./FigspecViewer/FigspecFrameViewer";
import { FigspecFileViewer } from "./FigspecViewer/FigspecFileViewer";

if (!customElements.get("figspec-file-viewer")) {
  customElements.define("figspec-file-viewer", FigspecFileViewer);
}

if (!customElements.get("figspec-frame-viewer")) {
  customElements.define("figspec-frame-viewer", FigspecFrameViewer);
}

export { FigspecFrameViewer };
export { FigspecFileViewer };
