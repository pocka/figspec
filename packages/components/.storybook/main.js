module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
  webpackFinal(config) {
    return {
      ...config,
      module: {
        ...config.module,
        rules: [
          {
            oneOf: [
              {
                resourceQuery: /spec/,
                use: [
                  {
                    loader: "web-component-analyzer-loader",
                  },
                ],
              },
              // Use ts-loader instead of babel-loader (Storybook's default).
              // It's sooooo hard to configure babel plugins used by Storybook.
              {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                  {
                    loader: "ts-loader",
                    options: {
                      transpileOnly: true,
                    },
                  },
                ],
              },
              ...config.module.rules,
            ],
          },
        ],
      },
    };
  },
};
