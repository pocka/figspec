# @figspec/components

CustomElements renders given Figma API's result into a rich preview.

## Installation

```sh
$ yarn add @figspec/components

# or

$ npm i @figspec/components
```

## Usage

Import the entry script (`import '@figspec/components'`) and it'll register our custom elements.
Then you can now use these on your page.

```js
// your script.js
import "@figspec/components";

// ...
```

```html
<body>
  <figspec-frame-viewer nodes="..." rendered-image="..."></figspec-frame-viewer>
</body>
```

To display an entire Figma File, use `<figspec-file-viewer>` instead.

```html
<body>
  <figspec-file-viewer
    document-node="..."
    rendered-images="..."
  ></figspec-file-viewer>
</body>
```

To see examples and API docs, please check out [Storybook](https://figspec.netlify.app/?path=/docs/components-figspec-viewer--defaults).

NOTE: We don't provide bundled scripts yet. If you want to put the script in head tag, please build the files at your own.

## TypeScript support

This package ships with TypeScript definition file.

One of our "typing dependencies" is missing from `package.json#dependencies`, because it's not our "runtime dependency".
So, you need to install that package in order to get full types (otherwise some properties turns into `any`).

```sh
# By installing this package, FileNode related properties will get correct types.
yarn add -D figma-js
```

## Browser supports

Browsers supporting WebComponents v1 spec and ES2015 or later.
The bundled codes are emitted under `esm/es2015` and `cjs/es2016`.
