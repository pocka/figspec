import { FigmaViewer } from "./FigmaViewer";
import { FigmaViewerGuide } from "./FigmaViewerGuide";

if (!customElements.get("figma-viewer")) {
  customElements.define("figma-viewer", FigmaViewer);
}

if (!customElements.get("figma-viewer-guide")) {
  customElements.define("figma-viewer-guide", FigmaViewerGuide);
}

export { FigmaViewer } from "./FigmaViewer";
