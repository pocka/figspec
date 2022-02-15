import "@figspec/components";
// This line is treated as type-only import even without the `type` keyword.
// The keyword is here to indicate the line does not triggers any side-effects.
import type {
  FigspecFrameViewer as FigspecFrameViewerElement,
  FigspecFileViewer as FigspecFileViewerElement,
} from "@figspec/components";
import {
  createElement,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

const bindEvent = (
  element: HTMLElement,
  event: string,
  cb: (ev: CustomEvent) => void
) => {
  const listener = ((ev: CustomEvent) => {
    cb(ev);
  }) as EventListener;

  element.addEventListener(event, listener);

  return () => element.removeEventListener(event, listener);
};

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

export interface FigspecFrameViewerProps
  extends FigspecFrameViewerElementProps {
  onScaleChange?(ev: CustomEvent<{ scale: number }>): void;
  onPositionChange?(ev: CustomEvent<{ x: number; y: number }>): void;
  onNodeSelect?(ev: CustomEvent<{ selectedNode: unknown | null }>): void;
}

type FigspecFrameViewerRef = FigspecFrameViewerElement | null | undefined;

export const FigspecFrameViewer = forwardRef<
  FigspecFrameViewerElement,
  FigspecFrameViewerProps
>(
  (
    {
      nodes,
      renderedImage,
      className,
      panSpeed,
      zoomMargin,
      zoomSpeed,
      onNodeSelect,
      onPositionChange,
      onScaleChange,
      ...rest
    },
    ref
  ) => {
    const [refNode, setNode] =
      useState<(FigspecFrameViewerElement & HTMLElement) | null>(null);

    useImperativeHandle<FigspecFrameViewerRef, FigspecFrameViewerRef>(
      ref,
      () => refNode,
      [refNode]
    );

    const refCb = useCallback(
      (node: (FigspecFrameViewerElement & HTMLElement) | null) => {
        if (node) {
          setNode(node);

          node.nodes = nodes;
          node.renderedImage = renderedImage;
        }
      },
      []
    );

    useEffect(() => {
      if (!refNode) return;

      refNode.nodes = nodes;
      refNode.renderedImage = renderedImage;
    }, [refNode, nodes, renderedImage]);

    useEffect(() => {
      if (!refNode || !onNodeSelect) return;

      return bindEvent(refNode, "nodeselect", onNodeSelect);
    }, [refNode, onNodeSelect]);

    useEffect(() => {
      if (!refNode || !onPositionChange) return;

      return bindEvent(refNode, "positionchange", onPositionChange);
    }, [refNode, onPositionChange]);

    useEffect(() => {
      if (!refNode || !onScaleChange) return;

      return bindEvent(refNode, "scalechange", onScaleChange);
    }, [refNode, onScaleChange]);

    return (
      <figspec-frame-viewer
        ref={refCb}
        class={className}
        pan-speed={panSpeed}
        zoom-margin={zoomMargin}
        zoom-speed={zoomSpeed}
        {...rest}
      />
    );
  }
);

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

export interface FigspecFileViewerProps extends FigspecFileViewerElementProps {
  onScaleChange?(ev: CustomEvent<{ scale: number }>): void;
  onPositionChange?(ev: CustomEvent<{ x: number; y: number }>): void;
  onNodeSelect?(ev: CustomEvent<{ selectedNode: unknown | null }>): void;
}

type FigspecFileViewerRef = FigspecFileViewerElement | null | undefined;

export const FigspecFileViewer = forwardRef<
  FigspecFileViewerElement,
  FigspecFileViewerProps
>(
  (
    {
      documentNode,
      renderedImages,
      className,
      panSpeed,
      zoomMargin,
      zoomSpeed,
      onNodeSelect,
      onPositionChange,
      onScaleChange,
      ...rest
    },
    ref
  ) => {
    const [refNode, setNode] =
      useState<(FigspecFileViewerElement & HTMLElement) | null>(null);

    useImperativeHandle<FigspecFileViewerRef, FigspecFileViewerRef>(
      ref,
      () => refNode,
      [refNode]
    );

    const refCb = useCallback(
      (node: (FigspecFileViewerElement & HTMLElement) | null) => {
        if (node) {
          setNode(node);

          node.documentNode = documentNode;
          node.renderedImages = renderedImages;
        }
      },
      []
    );

    useEffect(() => {
      if (!refNode) return;

      refNode.documentNode = documentNode;
      refNode.renderedImages = renderedImages;
    }, [refNode, documentNode, renderedImages]);

    useEffect(() => {
      if (!refNode || !onNodeSelect) return;

      return bindEvent(refNode, "nodeselect", onNodeSelect);
    }, [refNode, onNodeSelect]);

    useEffect(() => {
      if (!refNode || !onPositionChange) return;

      return bindEvent(refNode, "positionchange", onPositionChange);
    }, [refNode, onPositionChange]);

    useEffect(() => {
      if (!refNode || !onScaleChange) return;

      return bindEvent(refNode, "scalechange", onScaleChange);
    }, [refNode, onScaleChange]);

    return (
      <figspec-file-viewer
        ref={refCb}
        class={className}
        pan-speed={panSpeed}
        zoom-margin={zoomMargin}
        zoom-speed={zoomSpeed}
        {...rest}
      />
    );
  }
);
