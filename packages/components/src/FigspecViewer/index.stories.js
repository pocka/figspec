import { html } from "lit-html";

import demoJson from "../__storybook__/demo-data/Klm6pxIZSaJFiOMX5FpTul9F/64:1.json";
import demoImage from "../__storybook__/demo-data/Klm6pxIZSaJFiOMX5FpTul9F/64:1.svg";

export default {
  title: "Components/figspec-viewer",
  component: "figspec-viewer",
};

const Template = (args) => html`
  <figspec-viewer
    style="
      min-width: 100%;
      min-height: 400px;
      font-family: sans-serif;
    "
    .nodes=${args.nodes}
    rendered-image=${args.renderedImage || ""}
    .panSpeed=${args.panSpeed || 500}
    .zoomSpeed=${args.zoomSpeed || 500}
  ></figspec-viewer>
`;

export const Defaults = Template.bind({});

Defaults.args = {
  nodes: demoJson,
  renderedImage: demoImage,
};

export const Slow = Template.bind({});

Slow.storyName = "Pan Speed = 100, Zoom Speed = 100";

Slow.args = {
  nodes: demoJson,
  renderedImage: demoImage,
  panSpeed: 100,
  zoomSpeed: 100,
};

export const WithoutRequiredValues = Template.bind({});

WithoutRequiredValues.args = {};
