import { FigspecViewer } from "./FigspecViewer";

if (!customElements.get("figspec-viewer")) {
  customElements.define("figspec-viewer", FigspecViewer);
}

export { FigspecViewer } from "./FigspecViewer";
