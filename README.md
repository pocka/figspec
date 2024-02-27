# @figspec/components

[![npm version](https://img.shields.io/npm/v/%40figspec/components)](https://www.npmjs.com/package/@figspec/components)
[![docs HTML (with demo)](<https://img.shields.io/badge/docs-HTML%20(with%20demo)-e67700>)
](https://pocka.github.io/figspec/)

`@figspec/components` is a set of CustomElements that renders Figma file/frame and displays Figma's editor-like inspector for a selected node.

The components are designed to work on Figma REST API result.
This library does not provided a functionality to invoke Figma REST API endpoints.

## Installation

```sh
$ npm i @figspec/components
```

This library does not provide bundled script. Please use CDN or bundle on your own.

## Usage

Import the entry script (`import '@figspec/components'`) and it'll register our custom elements.
Then you can now use these on your page.

```html
<body>
  <figspec-frame-viewer id="figma_frame"></figspec-frame-viewer>
</body>
```

```js
// your script.js
import "@figspec/components";

const figmaFrame = document.getElementById("figma_frame")

figmaFrame.apiResponse = /* ... */;
figmaFrame.renderedImage = /* ... */;
```

To display an entire Figma File, use `<figspec-file-viewer>` instead.

```html
<body>
  <figspec-file-viewer id="figma_file"></figspec-file-viewer>
</body>
```

```js
// your script.js
import "@figspec/components";

const figmaFile = document.getElementById("figma_file")

figmaFrame.apiResponse = /* ... */;
figmaFrame.renderedImages = /* ... */;
```

To see working examples and API docs, please check out [the docs site](https://pocka.github.io/figspec/).

## Browser supports

This library works on browser implementing WebComponents v1 spec and ES2019.
The bundled files are at `esm/es2019`.

## Related packages

- [`@figspec/react`](https://github.com/pocka/figspec-react) ... React bindings for this package.
