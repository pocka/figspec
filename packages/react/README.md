# @figspec/react

A React binding for `@figspec/components`.

## Installation

You need to install both this package and `@figspec/components`.

```sh
$ yarn add @figspec/react @figspec/components

# or

$ npm i @figspec/react @figspec/components
```

## Usage

See the docs at `@figspec/components`.

This bindings enables you to use the CustomElement's property via React's component props.
You don't need to use kebab-case attributes :camel::dash:

```jsx
import { FigspecViewer } from "@figspec/react";

const logSelectedNode = (ev) => {
  console.log(ev.detail.selectedNode);
};

<FigspecFrameViewer
  nodes={nodes}
  renderedImage={renderedImage}
  zoomMargin={200}
  onNodeSelect={logSelectedNode}
/>;
```
