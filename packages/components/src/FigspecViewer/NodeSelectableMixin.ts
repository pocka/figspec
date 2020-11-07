import type * as Figma from "figma-js";
import { LitElement, property } from "lit-element";

import type { Constructor, SizedNode } from "./utils";

export interface INodeSelectable {
  selectedNode: SizedNode | null;
}

export const NodeSelectableMixin = <T extends Constructor<LitElement>>(
  superClass: T
): T & Constructor<INodeSelectable> => {
  class NodeSelectable extends superClass {
    @property({
      attribute: false,
    })
    selectedNode: SizedNode | null = null;

    constructor(...args: any[]) {
      super(...args);
    }

    updated(changedProperties: Parameters<LitElement["updated"]>[0]) {
      super.updated(changedProperties);

      if (changedProperties.has("selectedNode")) {
        this.dispatchEvent(
          new CustomEvent<{ selectedNode: Figma.Node | null }>("nodeselect", {
            detail: {
              selectedNode: this.selectedNode,
            },
          })
        );
      }
    }
  }

  return NodeSelectable;
};
