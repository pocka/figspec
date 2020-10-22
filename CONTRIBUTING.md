# Contribution guidelines

## Issues

### Reporting bugs

Please write a clear and concise description with short title.
Codes to reproduce such as a sample repository or a link for an online playground (e.g. CodeSandbox) would be helpful.

### Requesting features

Instead of simply describing the feature, I recommend you to write down a problem you facing and/or use-cases.
These things help us discussing/implementing the feature and make your feature request more appealing.

## Pull Requests

### Submitting a Pull Request

Please keep a Pull Request simple. Don't mix many things into one PR.
We'll request you to break down your PR into small ones if required.

## Development guide

This project uses Yarn Workspaces to organize packages.

### Requirements

- Node.js >= Maintenance LTS (If you have an NVM, just do `nvm install` or `nvm use` at the root of the repository)
- Yarn

### Bootstraping

```sh
$ yarn

# or "yarn install" if you prefer...
```

### Building packages

Every packages inside the `packages/` directory has `build` command.
But you won't use the command so often because our development is basically done on Storybook.

```sh
# to build a package (for example `@figspec/components`)
# these two below are equivalent
$ yarn workspace @figspec/components build
$ cd packages/components && yarn build

# to start Storybook (for example `@figspec/components`)
# you can run `yarn storybook` on each package's directory as well
$ yarn workspace @figspec/components storybook
```

### Helper scripts

Packages inside `scripts/` directory is only for our development, not meant to be published to a package registory.
See README on each package for more details.
