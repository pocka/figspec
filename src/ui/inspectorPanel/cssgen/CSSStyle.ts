export enum CSSStyleValueTypes {
  Color,
  Number,
  String,
  List,
  Keyword,
  Comment,
  Literal,
  FunctionCall,
  Unknown,
}

interface CSSStyleColorValue {
  type: CSSStyleValueTypes.Color;

  color: string;

  value: CSSStyleValue;
}

interface CSSStyleNumberValue {
  type: CSSStyleValueTypes.Number;

  value: number;

  precision?: number;

  unit?: string;
}

interface CSSStyleStringValue {
  type: CSSStyleValueTypes.String;

  value: string;
}

interface CSSStyleKeywordValue {
  type: CSSStyleValueTypes.Keyword;

  ident: string;
}

interface CSSStyleUnknownValue {
  type: CSSStyleValueTypes.Unknown;

  text: string;
}

interface CSSStyleFunctionCallValue {
  type: CSSStyleValueTypes.FunctionCall;

  functionName: string;

  args: CSSStyleValue;
}

interface CSSStyleLiteralValue {
  type: CSSStyleValueTypes.Literal;

  text: string;
}

interface CSSStyleListValue {
  type: CSSStyleValueTypes.List;

  head: CSSStyleValue;
  tail: CSSStyleValue[];

  separator: string;
}

interface CSSStyleCommentInValue {
  type: CSSStyleValueTypes.Comment;

  text: string;
}

export type CSSStyleValue =
  | CSSStyleColorValue
  | CSSStyleNumberValue
  | CSSStyleStringValue
  | CSSStyleKeywordValue
  | CSSStyleUnknownValue
  | CSSStyleLiteralValue
  | CSSStyleFunctionCallValue
  | CSSStyleListValue
  | CSSStyleCommentInValue;

export interface CSSStyle {
  propertyName: string;

  value: CSSStyleValue;
}
