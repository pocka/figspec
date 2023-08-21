import { describe, expect, it } from "vitest";

import { defaultPreferenecs } from "../../../preferences";

import { CSSStyleValueTypes } from "./CSSStyle";
import { serializeStyle, serializeValue } from "./serialize";

describe("serializeValue", () => {
  it("Should output literals/unknowns as-is", () => {
    expect(
      serializeValue(
        {
          type: CSSStyleValueTypes.Unknown,
          text: "unknown-value",
        },
        defaultPreferenecs,
      ),
    ).toBe("unknown-value");

    expect(
      serializeValue(
        {
          type: CSSStyleValueTypes.Literal,
          text: "literal-value",
        },
        defaultPreferenecs,
      ),
    ).toBe("literal-value");
  });

  it("Should quote string", () => {
    expect(
      serializeValue(
        {
          type: CSSStyleValueTypes.String,
          value: "Foo Bar",
        },
        defaultPreferenecs,
      ),
    ).toBe(`"Foo Bar"`);
  });

  it("Should escape double-quotes in string", () => {
    expect(
      serializeValue(
        {
          type: CSSStyleValueTypes.String,
          value: `"Foo Bar"`,
        },
        defaultPreferenecs,
      ),
    ).toBe(`"\\"Foo Bar\\""`);
  });

  it("Should output comment", () => {
    expect(
      serializeValue(
        {
          type: CSSStyleValueTypes.Comment,
          text: "Comment String",
        },
        defaultPreferenecs,
      ),
    ).toBe("/* Comment String */");
  });

  it("Should ignore color wrapper and uses its contents only", () => {
    expect(
      serializeValue(
        {
          type: CSSStyleValueTypes.Color,
          color: "????",
          value: {
            type: CSSStyleValueTypes.Literal,
            text: "--bar",
          },
        },
        defaultPreferenecs,
      ),
    ).toBe("--bar");
  });

  it("Should join list items with the separator", () => {
    expect(
      serializeValue(
        {
          type: CSSStyleValueTypes.List,
          separator: " / ",
          head: {
            type: CSSStyleValueTypes.List,
            separator: ", ",
            head: { type: CSSStyleValueTypes.Number, value: 1 },
            tail: [{ type: CSSStyleValueTypes.Literal, text: "foo" }],
          },
          tail: [
            {
              type: CSSStyleValueTypes.List,
              separator: " |> ",
              head: {
                type: CSSStyleValueTypes.Literal,
                text: "bar",
              },
              tail: [{ type: CSSStyleValueTypes.Literal, text: "baz" }],
            },
          ],
        },
        defaultPreferenecs,
      ),
    ).toBe("1, foo / bar |> baz");
  });

  it("Should construct function call", () => {
    expect(
      serializeValue(
        {
          type: CSSStyleValueTypes.FunctionCall,
          functionName: "var",
          args: {
            type: CSSStyleValueTypes.Literal,
            text: "--_foo",
          },
        },
        defaultPreferenecs,
      ),
    ).toBe("var(--_foo)");
  });
});

describe("serializeStyle", () => {
  it("Should serialize a style object into valid CSS rule", () => {
    const str = serializeStyle(
      {
        propertyName: "foo",
        value: {
          type: CSSStyleValueTypes.Literal,
          text: "#fff",
        },
      },
      defaultPreferenecs,
    );

    expect(str).toBe("foo: #fff;");
  });
});
