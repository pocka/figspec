import { action } from "@storybook/addon-actions";

import { html } from "lit";

import demoJson from "../__storybook__/demo-data/Klm6pxIZSaJFiOMX5FpTul9F/64:1.json";
import demoImage from "../__storybook__/demo-data/Klm6pxIZSaJFiOMX5FpTul9F/64:1.svg";

export default {
  title: "Components/figspec-frame-viewer",
  component: "figspec-frame-viewer",
  parameters: {
    layout: "fullscreen",
    docs: {
      inlineStories: false,
      iframeHeight: 600,
    },
  },
};

const Template = (args) => html`
  <figspec-frame-viewer
    style="
      min-width: 100%;
      min-height: 100vh;
      font-family: sans-serif;
    "
    .nodes=${args.nodes}
    rendered-image=${args.renderedImage || ""}
    link=${args.link}
    .panSpeed=${args.panSpeed || 500}
    .zoomSpeed=${args.zoomSpeed || 500}
    zoom-margin=${args.zoomMargin || 50}
    .showZoomControls=${args.showZoomControls || false}
    .scalePercentage=${args.scalePercentage || 25}
  ></figspec-frame-viewer>
`;

export const Defaults = Template.bind({});

Defaults.args = {
  nodes: demoJson,
  renderedImage: demoImage,
  link: "https://figma.com",
};

export const Slow = Template.bind({});

Slow.storyName = "Pan Speed = 100, Zoom Speed = 100";

Slow.args = {
  nodes: demoJson,
  renderedImage: demoImage,
  panSpeed: 100,
  zoomSpeed: 100,
};

export const WithZoomControls = Template.bind({});

WithZoomControls.storyName = "With Zoom Controls";

WithZoomControls.args = {
  nodes: demoJson,
  renderedImage: demoImage,
  showZoomControls: true,
};

export const WithoutRequiredValues = Template.bind({});

WithoutRequiredValues.args = {};

export const Events = (args) => html`
  <figspec-frame-viewer
    style="
      min-width: 100%;
      min-height: 100vh;
      font-family: sans-serif;
    "
    .nodes=${args.nodes}
    rendered-image=${args.renderedImage || ""}
    .panSpeed=${args.panSpeed || 500}
    .zoomSpeed=${args.zoomSpeed || 500}
    zoom-margin=${args.zoomMargin || 50}
    .showZoomControls=${args.showZoomControls || false}
    .scalePercentage=${args.scalePercentage || 25}
    @scalechange=${action("scalechange")}
    @positionchange=${action("positionchange")}
    @nodeselect=${action("nodeselect")}
  ></figspec-frame-viewer>
`;
Events.args = {
  nodes: demoJson,
  renderedImage: demoImage,
};
