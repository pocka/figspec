import { action } from "@storybook/addon-actions";

import { FigspecFrameViewer } from ".";

import demoJson from "./__storybook__/demo-data/Klm6pxIZSaJFiOMX5FpTul9F/64:1.json";
import demoImage from "./__storybook__/demo-data/Klm6pxIZSaJFiOMX5FpTul9F/64:1.svg";

export default {
  title: "FigspecFrameViewer",
  component: FigspecFrameViewer,
};

const Template = (args) => (
  <FigspecFrameViewer
    {...args}
    style={{
      width: 500,
      height: 500,
    }}
    onNodeSelect={action("onNodeSelect")}
    onPositionChange={action("onPositionChange")}
    onScaleChange={action("onScaleChange")}
  />
);

export const demo = Template.bind({});

demo.args = {
  nodes: demoJson,
  renderedImage: demoImage,
};
