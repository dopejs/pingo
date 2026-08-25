import { resolveStyle } from "@dopejs/pingo-style";
import { describe, expect, it } from "vitest";

import { createPingoUiStyleSheet, pingoUiCssText } from "./generated/styles";

// Two defects hide in a hand-maintained dark skin, and only one of them is
// visible in the stylesheet source.
//
// The first is a rule that sets a colour for light and forgets the
// `.pui-dark` counterpart. That one a reader can spot.
//
// The second cannot be read at all: a rule that never sets `color`. In light
// the initial foreground is near-black, which happens to suit a white surface,
// so the omission looks like a decision. Switch to dark and the same near-black
// text lands on a near-black surface -- `.pui-table__cell` resolved
// `#000000ff` in both themes, against a `#09090b` page, until this test.
//
// Both become obvious once the cascade is resolved rather than read, which is
// what this does: no rendering, no pixels, no tolerance.
const styleSheets = [createPingoUiStyleSheet()];
const SURFACE = { light: "#ffffffff", dark: "#09090bff" } as const;

// WCAG AA for body text. The skin's own muted tokens sit just above it
// (#71717a on white is 4.27), so this is the floor the design already targets
// rather than one imposed on it.
const MINIMUM_CONTRAST = 4;

/** Classes applied to text nodes, which therefore owe their surface contrast. */
const TEXT_CLASSES = classesOn("text");

describe("dark skin contrast", () => {
  it("finds the text classes it is meant to guard", () => {
    expect(TEXT_CLASSES.length).toBeGreaterThan(10);
    expect(TEXT_CLASSES).toContain("pui-table__cell");
  });

  it.each(["light", "dark"] as const)("keeps %s text readable on its surface", (theme) => {
    const failures: string[] = [];
    for (const className of TEXT_CLASSES) {
      const style = resolve(className, theme);
      const colour = style.color;
      if (typeof colour !== "string") continue;
      // A class that paints its own surface is judged against that surface.
      const behind =
        typeof style.backgroundColor === "string" && !isTransparent(style.backgroundColor)
          ? style.backgroundColor
          : SURFACE[theme];
      const ratio = contrast(colour, behind);
      if (ratio < MINIMUM_CONTRAST) {
        failures.push(`${className}: ${colour} on ${behind} is ${ratio.toFixed(2)}:1`);
      }
    }
    expect(failures).toStrictEqual([]);
  });
});

function resolve(className: string, theme: "light" | "dark") {
  const withTheme = (name: string) => (theme === "dark" ? `${name} pui-dark` : name);
  // A text role inherits its colour from the block it sits in -- that is the
  // documented mechanism, since pingo has no descendant selectors and the skin
  // sets `color` on the surface rather than on every label inside it. Resolving
  // the element without its block would report every inherited colour as
  // missing.
  const block = className.split("__")[0] ?? className;
  // A label is rarely a direct child of its block: overlay titles sit inside
  // `__panel`, menu items inside `__content`. Those wrappers are the surfaces
  // that set the colour, so they are tried before the block itself.
  const chain = [`${block}__panel`, `${block}__content`, block].filter(
    (name) => name !== className,
  );
  const parentStyle = chain
    .map(
      (name) => resolveStyle({ nodeType: "view", className: withTheme(name), styleSheets }).style,
    )
    .find((style) => typeof style.color === "string" && style.color !== "#000000ff");
  // Diagnostics are not asserted here: a text role often shares a class with
  // layout declarations that do not apply to text, and reporting those is the
  // resolver doing its job, not a skin defect.
  return resolveStyle({
    nodeType: "text",
    className: withTheme(className),
    styleSheets,
    ...(parentStyle === undefined ? {} : { parentStyle }),
  }).style;
}

/** Every class the sheet declares, filtered to those a component puts on `nodeType`. */
function classesOn(nodeType: "text"): readonly string[] {
  const declared = new Set(
    [...pingoUiCssText.matchAll(/\.(pui-[a-z0-9_-]+)/gu)].map((match) => match[1] ?? ""),
  );
  // Name-based rather than source-scanning: the skin names its text roles, and
  // a role that renders a string is the one that owes contrast.
  const textRole =
    /__(cell|label|title|description|text|value|placeholder|hint|message|caption|head|item|link|name|count|delta)$/u;
  return [...declared].filter((name) => textRole.test(name) && nodeType === "text").sort();
}

function isTransparent(colour: string): boolean {
  return /^#[0-9a-f]{6}00$/iu.test(colour);
}

function contrast(a: string, b: string): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((high ?? 0) + 0.05) / ((low ?? 0) + 0.05);
}

function luminance(colour: string): number {
  const hex = colour.replace("#", "");
  const channel = (offset: number): number => {
    const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}
