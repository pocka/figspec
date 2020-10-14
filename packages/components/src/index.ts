import { FigspecViewer } from "./FigspecViewer";
import { FigmaViewerGuide } from "./FigmaViewerGuide";

if (!customElements.get("figspec-viewer")) {
  customElements.define("figspec-viewer", FigspecViewer);
}

if (!customElements.get("figma-viewer-guide")) {
  customElements.define("figma-viewer-guide", FigmaViewerGuide);
}

export { FigspecViewer } from "./FigspecViewer";
