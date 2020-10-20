# figspec

**WIP. Use at your own risk.**

An unofficial Figma spec viewer. [Figma Live Embed Kit](https://www.figma.com/developers/embed) - Live update + Guidelines + Inspector.

- [x] WebComponents (`<figspec-*>`)
- [ ] Node.js server
- [ ] CLI
- [ ] Deploy buttons
  - [ ] Netlify
  - [ ] Vercel
  - [ ] Heroku

## Packages

| Directory Name                                 | Package Name          | Language   | Description                                 |
| ---------------------------------------------- | --------------------- | ---------- | ------------------------------------------- |
| [`packages/components`](./packages/components) | `@figspec/components` | TypeScript | CustomElements having actual preview logic. |
| [`packages/react`](./packages/react)           | `@figspec/react`      | TypeScript | React bindings for `                        |

## Usage

Currently, we only have front-end components to preview. You need to implement a logic to call Figma API and feed them to the components.
For more detail, see each package's README.
