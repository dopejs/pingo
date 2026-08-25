import { afterEach, describe, expect, it } from "vitest";

import { classes, getTheme, setTheme, skin, useTheme, type PingoUiTheme } from "./theme";

afterEach(() => {
  setTheme("light");
});

describe("theme", () => {
  it("defaults to light", () => {
    expect(getTheme()).toBe("light");
  });

  it("setTheme switches the value read by useTheme", () => {
    setTheme("dark");
    expect(useTheme()).toBe("dark");
    expect(getTheme()).toBe("dark");
  });

  it("accepts only the two theme values at the type level", () => {
    const values: readonly PingoUiTheme[] = ["light", "dark"];
    expect(values).toHaveLength(2);
  });
});

describe("classes", () => {
  it("drops empty parts and applies no theme", () => {
    setTheme("dark");
    expect(classes("a", undefined, "", "b")).toBe("a b");
  });
});

describe("skin", () => {
  it("marks the node in dark and leaves it alone in light", () => {
    expect(skin("pui-card")).toBe("pui-card");
    setTheme("dark");
    expect(skin("pui-card")).toBe("pui-card pui-dark");
  });

  it("keeps the caller's className after the marker", () => {
    setTheme("dark");
    expect(skin("pui-card", "mine")).toBe("pui-card pui-dark mine");
    setTheme("light");
    expect(skin("pui-card", "mine")).toBe("pui-card mine");
  });

  it("drops an empty caller className", () => {
    setTheme("dark");
    expect(skin("pui-card", undefined)).toBe("pui-card pui-dark");
    expect(skin("pui-card", "")).toBe("pui-card pui-dark");
  });
});
