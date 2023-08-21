// This module defines data types used in Figma API.
// The purpose of these type definition is for our rendering and inspector
// panel only. Properties not used in those feature would be omitted.

/**
 * https://www.figma.com/developers/api#color-type
 */
export interface Color {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
}

function isColor(x: unknown): x is Color {
  return (
    !!x &&
    typeof x === "object" &&
    "r" in x &&
    Number.isFinite(x.r) &&
    "g" in x &&
    Number.isFinite(x.g) &&
    "b" in x &&
    Number.isFinite(x.b) &&
    "a" in x &&
    Number.isFinite(x.a)
  );
}

/**
 * https://www.figma.com/developers/api#blendmode-type
 */
export type BlendMode =
  | "PASS_THROUGH"
  | "NORMAL"
  | "DARKEN"
  | "MULTIPLY"
  | "LINEAR_BURN"
  | "COLOR_BURN"
  | "LIGHTEN"
  | "SCREEN"
  | "LINEAR_DODGE"
  | "COLOR_DODGE"
  | "OVERLAY"
  | "SOFT_LIGHT"
  | "HARD_LIGHT"
  | "DIFFERENCE"
  | "EXCLUSION"
  | "HUE"
  | "SATURATION"
  | "COLOR"
  | "LUMINOSITY";

function isBlendMode(x: unknown): x is BlendMode {
  switch (x) {
    case "PASS_THROUGH":
    case "NORMAL":
    case "DARKEN":
    case "MULTIPLY":
    case "LINEAR_BURN":
    case "COLOR_BURN":
    case "LIGHTEN":
    case "SCREEN":
    case "LINEAR_DODGE":
    case "COLOR_DODGE":
    case "OVERLAY":
    case "SOFT_LIGHT":
    case "HARD_LIGHT":
    case "DIFFERENCE":
    case "EXCLUSION":
    case "HUE":
    case "SATURATION":
    case "COLOR":
    case "LUMINOSITY":
      return true;
    default:
      return false;
  }
}

/**
 * https://www.figma.com/developers/api#vector-type
 */
export interface Vector {
  readonly x: number;
  readonly y: number;
}

function isVector(x: unknown): x is Vector {
  return (
    !!x &&
    typeof x === "object" &&
    "x" in x &&
    Number.isFinite(x.x) &&
    "y" in x &&
    Number.isFinite(x.y)
  );
}

export interface Effect {
  readonly type: "LAYER_BLUR" | "BACKGROUND_BLUR" | string;
  readonly visible: boolean;
  readonly radius: number;
}

function isEffect(x: unknown): x is Effect {
  return (
    !!x &&
    typeof x === "object" &&
    "type" in x &&
    typeof x.type === "string" &&
    "visible" in x &&
    typeof x.visible === "boolean" &&
    "radius" in x &&
    typeof x.radius === "number"
  );
}

export interface ShadowEffect {
  readonly type: "INNER_SHADOW" | "DROP_SHADOW";
  readonly visible: boolean;
  readonly radius: number;
  readonly color: Color;
  readonly blendMode: BlendMode;
  readonly offset: Vector;
  readonly spread?: number;
  readonly showShadowBehindNode?: boolean;
}

export function isShadowEffect(x: Effect): x is ShadowEffect {
  if (x.type !== "INNER_SHADOW" && x.type !== "DROP_SHADOW") {
    return false;
  }

  return (
    "color" in x &&
    isColor(x.color) &&
    "blendMode" in x &&
    isBlendMode(x.blendMode) &&
    "offset" in x &&
    isVector(x.offset) &&
    (!("spread" in x) || Number.isFinite(x.spread)) &&
    (!("showShadowBehindNode" in x) ||
      typeof x.showShadowBehindNode === "boolean")
  );
}

/**
 * https://www.figma.com/developers/api#rectangle-type
 */
export interface Rectangle {
  readonly x: number;

  readonly y: number;

  readonly width: number;

  readonly height: number;
}

function isRectangle(x: unknown): x is Rectangle {
  return (
    !!x &&
    typeof x === "object" &&
    "x" in x &&
    typeof x.x === "number" &&
    "y" in x &&
    typeof x.y === "number" &&
    "width" in x &&
    typeof x.width === "number" &&
    "height" in x &&
    typeof x.height === "number"
  );
}

/**
 * https://www.figma.com/developers/api#colorstop-type
 */
export interface ColorStop {
  readonly position: number;

  readonly color: Color;
}

function isColorStop(x: unknown): x is ColorStop {
  return (
    !!x &&
    typeof x === "object" &&
    "position" in x &&
    typeof x.position === "number" &&
    "color" in x &&
    isColor(x.color)
  );
}

export interface PaintGlobalProperties {
  readonly type: string;

  /**
   * @default true
   */
  readonly visible?: boolean;

  /**
   * @default 1
   */
  readonly opacity?: number;

  readonly blendMode: BlendMode;
}

function isPaintGlobalProperties(x: unknown): x is PaintGlobalProperties {
  return (
    !!x &&
    typeof x === "object" &&
    "type" in x &&
    typeof x.type === "string" &&
    (!("visible" in x) || typeof x.visible === "boolean") &&
    (!("opacity" in x) || typeof x.opacity === "number") &&
    "blendMode" in x &&
    isBlendMode(x.blendMode)
  );
}

export interface SolidPaint extends PaintGlobalProperties {
  readonly type: "SOLID";

  readonly color: Color;
}

function isSolidPaint(x: PaintGlobalProperties): x is SolidPaint {
  return x.type === "SOLID" && "color" in x && isColor(x.color);
}

export interface GradientPaint extends PaintGlobalProperties {
  readonly type:
    | "GRADIENT_LINEAR"
    | "GRADIENT_RADIAL"
    | "GRADIENT_ANGULAR"
    | "GRADIENT_DIAMOND";

  readonly gradientHandlePositions: readonly [Vector, Vector, Vector];

  readonly gradientStops: readonly ColorStop[];
}

const GRADIENT_TYPE_PATTERN = /^GRADIENT_(LINEAR|RADIAL|ANGULAR|DIAMOND)$/;

function isGradientPaint(x: PaintGlobalProperties): x is GradientPaint {
  return (
    GRADIENT_TYPE_PATTERN.test(x.type) &&
    "gradientHandlePositions" in x &&
    Array.isArray(x.gradientHandlePositions) &&
    x.gradientHandlePositions.every(isVector) &&
    "gradientStops" in x &&
    Array.isArray(x.gradientStops) &&
    x.gradientStops.every(isColorStop)
  );
}

export interface ImagePaint extends PaintGlobalProperties {
  readonly type: "IMAGE";

  readonly scaleMode: "FILL" | "FIT" | "TILE" | "STRETCH";
}

function isImagePaint(x: PaintGlobalProperties): x is ImagePaint {
  if (!("scaleMode" in x)) {
    return false;
  }

  switch (x.scaleMode) {
    case "FILL":
    case "FIT":
    case "TILE":
    case "STRETCH":
      return true;
    default:
      return false;
  }
}

export interface OtherPaint extends PaintGlobalProperties {
  readonly type: "VIDEO" | "EMOJI";
}

function isOtherPaint(x: PaintGlobalProperties): x is OtherPaint {
  switch (x.type) {
    case "VIDEO":
    case "EMOJI":
      return true;
    default:
      return false;
  }
}

/**
 * https://www.figma.com/developers/api#paint-type
 */
export type Paint = SolidPaint | GradientPaint | ImagePaint | OtherPaint;

function isPaint(x: unknown): x is Paint {
  if (!isPaintGlobalProperties(x)) {
    return false;
  }

  return (
    isSolidPaint(x) || isGradientPaint(x) || isImagePaint(x) || isOtherPaint(x)
  );
}

interface HasBackgroundColor {
  /**
   * Background color of the canvas.
   */
  backgroundColor: Color;
}

export function hasBackgroundColor(
  node: Node,
): node is Node & HasBackgroundColor {
  return "backgroundColor" in node && isColor(node.backgroundColor);
}

interface HasFills {
  /**
   * @default []
   */
  readonly fills: Paint[];
}

export function hasFills(node: Node): node is Node & HasFills {
  return (
    "fills" in node && Array.isArray(node.fills) && node.fills.every(isPaint)
  );
}

interface HasStroke {
  /**
   * @default []
   */
  readonly strokes: readonly Paint[];

  readonly strokeWeight: number;

  readonly strokeAlign: "INSIDE" | "OUTSIDE" | "CENTER";

  /**
   * @default []
   */
  readonly strokeDashes?: readonly number[];
}

export function hasStroke(node: Node): node is Node & HasStroke {
  if (!("strokeAlign" in node)) {
    return false;
  }

  switch (node.strokeAlign) {
    case "INSIDE":
    case "OUTSIDE":
    case "CENTER":
      break;
    default:
      return false;
  }

  return (
    "strokes" in node &&
    Array.isArray(node.strokes) &&
    node.strokes.every(isPaint) &&
    "strokeWeight" in node &&
    Number.isFinite(node.strokeWeight) &&
    (!("strokeDashes" in node) ||
      (Array.isArray(node.strokeDashes) &&
        node.strokeDashes.every(Number.isFinite)))
  );
}

export interface HasEffects {
  effects: readonly (Effect | ShadowEffect)[];
}

export function hasEffects(node: Node): node is Node & HasEffects {
  return (
    "effects" in node &&
    Array.isArray(node.effects) &&
    node.effects.every(isEffect)
  );
}

interface HasCharacters {
  readonly characters: string;
}

export function hasCharacters(node: Node): node is Node & HasCharacters {
  return "characters" in node && typeof node.characters === "string";
}

// https://www.figma.com/developers/api#typestyle-type
interface HasTypeStyle {
  readonly style: {
    readonly fontFamily: string;
    readonly fontPostScriptName?: string;
    readonly italic: boolean;
    readonly fontWeight: number;
    readonly fontSize: number;
    readonly textCase?:
      | "ORIGINAL"
      | "UPPER"
      | "LOWER"
      | "TITLE"
      | "SMALL_CAPS"
      | "SMALL_CAPS_FORCED";
    readonly textDecoration?: "NONE" | "STRIKETHROUGH" | "UNDERLINE";
    readonly textAlignHorizontal: "LEFT" | "RIGHT" | "CENTER" | "JUSTIFIED";
    readonly letterSpacing: number;
    readonly lineHeightPx: number;
    readonly lineHeightPercentFontSize?: number;
    readonly lineHeightUnit: "PIXELS" | "FONT_SIZE_%" | "INTRINSIC_%";
  };
}

export function hasTypeStyle(node: Node): node is Node & HasTypeStyle {
  return (
    "style" in node &&
    typeof node.style === "object" &&
    !!node.style &&
    "fontFamily" in node.style &&
    typeof node.style.fontFamily === "string"
  );
}

export interface HasBoundingBox {
  readonly absoluteBoundingBox: Rectangle;

  /**
   * Old data may not have this property.
   */
  readonly absoluteRenderBounds?: Rectangle;
}

export function hasBoundingBox(node: Node): node is Node & HasBoundingBox {
  return (
    "absoluteBoundingBox" in node &&
    isRectangle(node.absoluteBoundingBox) &&
    (!("absoluteRenderBounds" in node) ||
      isRectangle(node.absoluteRenderBounds))
  );
}

export interface HasPadding {
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
}

export function hasPadding(node: Node): node is Node & HasPadding {
  return (
    "paddingTop" in node &&
    Number.isFinite(node.paddingTop) &&
    "paddingRight" in node &&
    Number.isFinite(node.paddingRight) &&
    "paddingBottom" in node &&
    Number.isFinite(node.paddingBottom) &&
    "paddingLeft" in node &&
    Number.isFinite(node.paddingLeft)
  );
}

export interface HasLegacyPadding {
  horizontalPadding: number;

  verticalPadding: number;
}

export function hasLegacyPadding(node: Node): node is Node & HasLegacyPadding {
  return (
    "horizontalPadding" in node &&
    Number.isFinite(node.horizontalPadding) &&
    "verticalPadding" in node &&
    Number.isFinite(node.verticalPadding)
  );
}

export interface HasChildren {
  readonly children: readonly Node[];
}

export function hasChildren(node: Node): node is Node & HasChildren {
  return (
    "children" in node &&
    Array.isArray(node.children) &&
    node.children.every(isNode)
  );
}

interface HasRadius {
  readonly cornerRadius: number;
}

export function hasRadius(node: Node): node is Node & HasRadius {
  return "cornerRadius" in node && typeof node.cornerRadius === "number";
}

interface HasRadii {
  readonly rectangleCornerRadii: readonly [number, number, number, number];
}

export function hasRadii(node: Node): node is Node & HasRadii {
  return (
    "rectangleCornerRadii" in node &&
    Array.isArray(node.rectangleCornerRadii) &&
    node.rectangleCornerRadii.length === 4
  );
}

export type KnownNodeType =
  | "DOCUMENT"
  | "CANVAS"
  | "FRAME"
  | "GROUP"
  | "SECTION"
  | "VECTOR"
  | "BOOLEAN_OPERATION"
  | "STAR"
  | "LINE"
  | "ELLIPSE"
  | "REGULAR_POLYGON"
  | "RECTANGLE"
  | "TABLE"
  | "TABLE_CELL"
  | "TEXT"
  | "SLICE"
  | "COMPONENT"
  | "COMPONENT_SET"
  | "INSTANCE"
  | "STICKY"
  | "SHAPE_WITH_TEXT"
  | "CONNECTOR"
  | "WASHI_TAPE";

/**
 * https://www.figma.com/developers/api#global-properties
 */
export interface Node<Type extends string = KnownNodeType | string> {
  readonly id: string;

  readonly name: string;

  /**
   * @default true
   */
  readonly visible?: boolean;

  readonly type: Type;
}

export function isNode(x: unknown): x is Node {
  return (
    typeof x === "object" &&
    !!x &&
    "id" in x &&
    typeof x.id === "string" &&
    "name" in x &&
    typeof x.name === "string" &&
    (!("visible" in x) || typeof x.visible === "boolean") &&
    "type" in x &&
    typeof x.type === "string"
  );
}

/**
 * Walk over the node and its descendants.
 * Iterator is superior to the common callback-style walk function:
 * - Ability to abort the traverse with standard language feature (return, break)
 * - No implicit call timing convention - TypeScript's poor inference engine completely
 *   ignores assignments even if the callback function will be called immediately.
 *   The inference system is built upon unrealistic illusion.
 *   https://github.com/microsoft/TypeScript/issues/9998
 * - (subjective) `for ~ of` over iterator is way more readable and easier to grasp than
 *   function invocation with unknown callback. When will the callback be invoked?
 *   What will happen when the callback function returned something?
 *
 * @param node - The root node to start traversing from. This function returns this parameter as a result at the very first.
 * @example
 * for (const node of walk(root)) {
 *   console.log(node.id)
 * }
 */
export function* walk(node: Node): Generator<Node, void, undefined> {
  yield node;

  if (hasChildren(node)) {
    for (const child of node.children) {
      for (const iter of walk(child)) {
        yield iter;
      }
    }
  }
}

export type Canvas = Node & HasChildren & HasBackgroundColor;

function isCanvas(node: Node): node is Canvas {
  return (
    node.type === "CANVAS" && hasChildren(node) && hasBackgroundColor(node)
  );
}

/**
 * Returns an iterator of CANVAS nodes.
 */
export function* getCanvases(node: Node): Generator<Canvas, void, undefined> {
  if (isCanvas(node)) {
    yield node;

    // CANVAS cannot be nested, so safe to quit lookup
    return;
  }

  if (!hasChildren(node)) {
    return;
  }

  for (const child of node.children) {
    for (const iter of getCanvases(child)) {
      yield iter;
    }
  }
}

export interface GetFileNodesResponse {
  readonly name: string;
  readonly lastModified: string;
  readonly nodes: Record<
    string,
    {
      readonly document: Node;
    }
  >;
}

export interface GetFileResponse {
  readonly name: string;
  readonly lastModified: string;
  readonly document: Node & HasChildren;
}
