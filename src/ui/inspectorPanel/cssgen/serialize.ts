import { roundTo } from "../../../math.js";
import { type Preferences } from "../../../preferences.js";

import { CSSStyle, CSSStyleValue, CSSStyleValueTypes } from "./CSSStyle.js";

export function serializeValue(
  value: CSSStyleValue,
  preferences: Readonly<Preferences>,
): string {
  switch (value.type) {
    case CSSStyleValueTypes.Color:
      return serializeValue(value.value, preferences);
    case CSSStyleValueTypes.Comment:
      return `/* ${value.text} */`;
    case CSSStyleValueTypes.FunctionCall:
      return (
        value.functionName + "(" + serializeValue(value.args, preferences) + ")"
      );
    case CSSStyleValueTypes.Keyword:
      return value.ident;
    case CSSStyleValueTypes.List:
      return [value.head, ...value.tail]
        .map((v) => serializeValue(v, preferences))
        .join(value.separator);
    case CSSStyleValueTypes.Literal:
      return value.text;
    case CSSStyleValueTypes.Number:
      return (
        roundTo(value.value, value.precision ?? preferences.decimalPlaces) +
        (value.unit || "")
      );
    case CSSStyleValueTypes.String:
      return `"${value.value.replace(/"/g, `\\"`)}"`;
    case CSSStyleValueTypes.Unknown:
      return value.text;
  }
}

export function serializeStyle(
  style: CSSStyle,
  preferences: Readonly<Preferences>,
): string {
  return (
    style.propertyName + ": " + serializeValue(style.value, preferences) + ";"
  );
}
