import { FigspecFrameViewer } from "./FigspecFrameViewer";
import { FigspecFileViewer } from "./FigspecFileViewer";

if (!customElements.get("figspec-file-viewer")) {
  customElements.define("figspec-file-viewer", FigspecFileViewer);
}

if (!customElements.get("figspec-frame-viewer")) {
  customElements.define("figspec-frame-viewer", FigspecFrameViewer);
}

export { FigspecFrameViewer };
export { FigspecFileViewer };
