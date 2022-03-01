import {
  FigspecFrameViewer as FigspecFrameViewerElement,
  FigspecFileViewer as FigspecFileViewerElement,
} from "@figspec/components";
import { createComponent } from "@lit-labs/react";

import * as React from "react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

// Frame viewer

type FigspecFrameViewerElementProps =
  // Required props
  Pick<
    FigspecFrameViewerElement,
    // Element props
    "nodes" | "renderedImage"
  > &
    // Optional props
    Partial<
      Pick<
        FigspecFrameViewerElement,
        // HTML attributes
        | "id"
        | "className"
        | "style"
        // Element attributes (will be converted to kebab-case)
        | "zoomSpeed"
        | "panSpeed"
        | "zoomMargin"
        | "link"
      >
    >;

interface FigspecFrameViewerEvents {
  onScaleChange?(ev: CustomEvent<{ scale: number }>): void;
  onPositionChange?(ev: CustomEvent<{ x: number; y: number }>): void;
  onNodeSelect?(ev: CustomEvent<{ selectedNode: unknown | null }>): void;
}

export type FigspecFrameViewerProps = FigspecFrameViewerElementProps &
  FigspecFrameViewerEvents;

// NOTE: These exported components are casted with `as unknown as ...` in order not to break
//       typings accidentally. `as unknown` is required because a component created by
//       `createComponent` has `RefAttributes<unknown>`, which is incompatible with existing
//       type signature (and breaks ref typings). Also the explicit props definition prevents
//       every properties turns into optional.
export const FigspecFrameViewer = (createComponent<
  FigspecFrameViewerElement,
  FigspecFrameViewerEvents
>(React, "figspec-frame-viewer", FigspecFrameViewerElement, {
  onNodeSelect: "nodeselect",
  onPositionChange: "positionchange",
  onScaleChange: "scalechange",
}) as unknown) as ForwardRefExoticComponent<
  FigspecFrameViewerProps & RefAttributes<FigspecFrameViewerElement>
>;

// File viewer

type FigspecFileViewerElementProps =
  // Required props
  Pick<
    FigspecFileViewerElement,
    // Element props
    "documentNode" | "renderedImages"
  > &
    // Optional props
    Partial<
      Pick<
        FigspecFileViewerElement,
        // HTML attributes
        | "id"
        | "className"
        | "style"
        // Element attributes (will be converted to kebab-case)
        | "zoomSpeed"
        | "panSpeed"
        | "zoomMargin"
        | "link"
      >
    >;

interface FigspecFileViewerEvents {
  onScaleChange?(ev: CustomEvent<{ scale: number }>): void;
  onPositionChange?(ev: CustomEvent<{ x: number; y: number }>): void;
  onNodeSelect?(ev: CustomEvent<{ selectedNode: unknown | null }>): void;
}

export type FigspecFileViewerProps = FigspecFileViewerElementProps &
  FigspecFileViewerEvents;

export const FigspecFileViewer = (createComponent<
  FigspecFileViewerElement,
  FigspecFileViewerEvents
>(React, "figspec-file-viewer", FigspecFileViewerElement, {
  onNodeSelect: "nodeselect",
  onPositionChange: "positionchange",
  onScaleChange: "scalechange",
}) as unknown) as ForwardRefExoticComponent<
  FigspecFileViewerProps & RefAttributes<FigspecFileViewerElement>
>;
