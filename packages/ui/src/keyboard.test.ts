import { createElement } from "@dopejs/pingo-jsx";
import { describe, expect, it } from "vitest";

import { labelledValues, orderedValues, step } from "./keyboard";

const Item = (props: { readonly value: string }): string => props.value;
const Labelled = (props: { readonly value: string; readonly children: string }): string =>
  props.children;
const Group = (props: { readonly children: unknown }): unknown => props.children;

describe("orderedValues", () => {
  it("reads declared values from children in document order", () => {
    expect(
      orderedValues([
        createElement(Item, { value: "a" }),
        createElement(Item, { value: "b" }),
        createElement(Item, { value: "c" }),
      ]),
    ).toEqual(["a", "b", "c"]);
  });

  it("flattens nested arrays and skips anything without a string value", () => {
    expect(
      orderedValues([
        "text",
        null,
        [createElement(Item, { value: "a" }), createElement(Item, { value: "b" })],
        createElement(Item, { value: 7 as unknown as string }),
      ]),
    ).toEqual(["a", "b"]);
  });
});

describe("step", () => {
  const values = ["a", "b", "c"];

  it("wraps in both directions", () => {
    expect(step(values, "c", "ArrowRight", "horizontal")).toBe("a");
    expect(step(values, "a", "ArrowLeft", "horizontal")).toBe("c");
    expect(step(values, "c", "ArrowDown", "vertical")).toBe("a");
    expect(step(values, "a", "ArrowUp", "vertical")).toBe("c");
  });

  it("honours the axis so an unrelated arrow is left alone", () => {
    expect(step(values, "a", "ArrowDown", "horizontal")).toBeUndefined();
    expect(step(values, "a", "ArrowRight", "vertical")).toBeUndefined();
    expect(step(values, "a", "ArrowRight", "both")).toBe("b");
    expect(step(values, "a", "ArrowDown", "both")).toBe("b");
  });

  it("jumps to the ends", () => {
    expect(step(values, "b", "Home", "horizontal")).toBe("a");
    expect(step(values, "b", "End", "horizontal")).toBe("c");
  });

  it("starts from the end the press implies when nothing is selected", () => {
    expect(step(values, undefined, "ArrowRight", "horizontal")).toBe("a");
    expect(step(values, undefined, "ArrowLeft", "horizontal")).toBe("c");
    expect(step(values, "missing", "ArrowRight", "horizontal")).toBe("a");
  });

  it("returns nothing for an empty group or a key that is not navigation", () => {
    expect(step([], "a", "ArrowRight", "both")).toBeUndefined();
    expect(step(values, "a", "Enter", "both")).toBeUndefined();
    expect(step(values, "a", "x", "both")).toBeUndefined();
  });
});

describe("labelledValues", () => {
  it("finds an item's own text through the element that wraps it", () => {
    // The items are inside the content element, not handed to the root, so a
    // non-recursive walk found nothing and a Select's trigger showed the raw
    // value: `pingo-ui` where the option said `@dopejs/pingo-ui`.
    const labels = labelledValues([
      createElement(Group, {
        children: [
          createElement(Labelled, { value: "pingo", children: "@dopejs/pingo" }),
          createElement(Labelled, { value: "pingo-ui", children: "@dopejs/pingo-ui" }),
        ],
      }),
    ]);
    expect(labels.get("pingo-ui")).toBe("@dopejs/pingo-ui");
    expect(labels.size).toBe(2);
  });

  it("ignores an item whose children are not a plain label", () => {
    const labels = labelledValues([
      createElement(Group, {
        children: createElement(Group, {
          value: "composite",
          children: [createElement(Labelled, { value: "inner", children: "内层" })],
        }),
      }),
    ]);
    expect(labels.get("composite")).toBeUndefined();
    expect(labels.get("inner")).toBe("内层");
  });
});
