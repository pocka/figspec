import * as Figma from "figma-js";

export type SizedNode = Extract<Figma.Node, { absoluteBoundingBox: any }>;
