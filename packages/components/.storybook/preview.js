import { setCustomElements } from "@storybook/web-components";

import "../src";

import FigmaViewer from "../src/FigmaViewer?spec";

// A list of components to parse using web-component-analyzer.
// Only components here appear at Docs table.
const components = [FigmaViewer];

const spec = components.reduce(
  (a, b) => ({ ...a, ...b, tags: [...a.tags, ...b.tags] }),
  { tags: [] }
);

setCustomElements(spec);

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};
