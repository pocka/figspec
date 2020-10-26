import "@figspec/components";
// This line is treated as type-only import even without the `type` keyword.
// The keyword is here to indicate the line does not triggers any side-effects.
import type { FigspecViewer as FigspecViewerElement } from "@figspec/components";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

type ElementProps = Pick<
  FigspecViewerElement,
  // HTML attributes
  | "id"
  | "className"
  | "style"
  // Element props
  | "nodes"
  | "renderedImage"
  // Element attributes (will be converted to kebab-case)
  | "zoomSpeed"
  | "panSpeed"
  | "zoomMargin"
>;

export interface FigspecViewerProps extends ElementProps {
  onScaleChange?(ev: CustomEvent<{ scale: number }>): void;
  onPositionChange?(ev: CustomEvent<{ x: number; y: number }>): void;
  onNodeSelect?(ev: CustomEvent<{ selectedNode: unknown | null }>): void;
}

type Ref = FigspecViewerElement | null | undefined;

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

export const FigspecViewer = forwardRef<
  FigspecViewerElement,
  FigspecViewerProps
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
    const [refNode, setNode] = useState<FigspecViewerElement | null>(null);

    useImperativeHandle<Ref, Ref>(ref, () => refNode, [refNode]);

    const refCb = useCallback((node: FigspecViewerElement | null) => {
      if (node) {
        setNode(node);

        node.nodes = nodes;
        node.renderedImage = renderedImage;
      }
    }, []);

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
      <figspec-viewer
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
