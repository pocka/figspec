export default {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-viewport"],
  core: {
    disableTelemetry: true,
  },
  framework: {
    name: "@storybook/web-components-vite",
    options: {},
  },
};
