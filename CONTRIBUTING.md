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

### Requirements

- Node.js >= Maintenance LTS (If you have an NVM, just do `nvm install` or `nvm use` at the root of the repository)
- Yarn

### Bootstraping

```sh
$ yarn

# or "yarn install" if you prefer...
```

### Building packages

You can compile TS files via `yarn build`.
But most of development and testings can be done in dev server for the docs site.

```sh
$ yarn build

# to start dev server for the docs site
$ yarn dev
```

### Helper scripts

Packages inside `scripts/` directory is only for our development, not meant to be published to a package registory.
See README on each directory for more details.

## Release workflow

1. Bump the version by using [`npm version`](https://docs.npmjs.com/cli/v8/commands/npm-version)
2. Push the automatically created git commit and git tag
3. CI build and push the version to npm, wait for it
