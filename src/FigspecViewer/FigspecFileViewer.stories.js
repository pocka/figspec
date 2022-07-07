import { action } from "@storybook/addon-actions";

import { html } from "lit";

import demoJson from "../__storybook__/demo-data/Klm6pxIZSaJFiOMX5FpTul9F/file.json";
import image2_5 from "../__storybook__/demo-data/Klm6pxIZSaJFiOMX5FpTul9F/2:5.svg";
import image2_9 from "../__storybook__/demo-data/Klm6pxIZSaJFiOMX5FpTul9F/2:9.svg";
import image2_13 from "../__storybook__/demo-data/Klm6pxIZSaJFiOMX5FpTul9F/2:13.svg";
import image64_1 from "../__storybook__/demo-data/Klm6pxIZSaJFiOMX5FpTul9F/64:1.svg";
import image93_14 from "../__storybook__/demo-data/Klm6pxIZSaJFiOMX5FpTul9F/93:14.svg";
import image93_32 from "../__storybook__/demo-data/Klm6pxIZSaJFiOMX5FpTul9F/93:32.svg";

export default {
  title: "Components/figspec-file-viewer",
  component: "figspec-file-viewer",
  parameters: {
    layout: "fullscreen",
    docs: {
      inlineStories: false,
      iframeHeight: 600,
    },
  },
};

const Template = (args) => html`
  <figspec-file-viewer
    style="
      min-width: 100%;
      min-height: 100vh;
      font-family: sans-serif;
    "
    .documentNode=${args.documentNode}
    .renderedImages=${args.renderedImages || {}}
    .panSpeed=${args.panSpeed || 500}
    .zoomSpeed=${args.zoomSpeed || 500}
    zoom-margin=${args.zoomMargin || 50}
    link=${args.link || "https://figma.com"}
    .showZoomControls=${args.showZoomControls || false}
    .scalePercentage=${args.scalePercentage || 25}
  ></figspec-file-viewer>
`;

export const Defaults = Template.bind({});
Defaults.args = {
  documentNode: demoJson,
  renderedImages: {
    "2:5": image2_5,
    "2:9": image2_9,
    "2:13": image2_13,
    "64:1": image64_1,
    "93:14": image93_14,
    "93:32": image93_32,
  },
};

export const WithZoomControls = Template.bind({});
WithZoomControls.args = {
  documentNode: demoJson,
  renderedImages: {
    "2:5": image2_5,
    "2:9": image2_9,
    "2:13": image2_13,
    "64:1": image64_1,
    "93:14": image93_14,
    "93:32": image93_32,
  },
  showZoomControls: true,
};
