import { describe, expect, it } from "vitest";

import { createContext, isContextProvider } from "./context";
import { ComponentScope, useContext } from "./hooks";
import { signal } from "./signal";

describe("createContext", () => {
  it("has a callable Provider, so TypeScript can use it as a JSX tag", () => {
    // Same reason as `memo`: without a call signature `<ctx.Provider>` was a
    // type error, which left TSX with no way to express context at all. The
    // reconciler renders a provider as its children, so a direct call must too.
    const context = createContext("light");
    expect(typeof context.Provider).toBe("function");
    expect(context.Provider({ value: "dark", children: "child" })).toBe("child");
    expect(context.Provider({ value: "dark" })).toBe(null);
  });

  it("creates a branded context with a singleton Provider", () => {
    const context = createContext("fallback");
    expect(context.defaultValue).toBe("fallback");
    expect(isContextProvider(context.Provider)).toBe(true);
    expect(context.Provider.context).toBe(context);
    expect(isContextProvider({})).toBe(false);
    expect(isContextProvider(() => undefined)).toBe(false);
    expect(isContextProvider(null)).toBe(false);
  });
});

describe("useContext", () => {
  it("returns the default value when no provider is on the chain", () => {
    const context = createContext("fallback");
    const scope = new ComponentScope(
      () => undefined,
      () => undefined,
    );
    const value = scope.render(() => useContext(context));
    expect(value).toBe("fallback");
  });

  it("reads the nearest provider signal through the scope lookup bridge", () => {
    const context = createContext("fallback");
    const provided = signal("from-provider");
    const scope = new ComponentScope(
      () => undefined,
      (candidate) => (candidate === context ? provided : undefined),
    );
    expect(scope.render(() => useContext(context))).toBe("from-provider");
  });

  it("subscribes the rendering component to the provider signal", () => {
    const context = createContext("fallback");
    const provided = signal("a");
    let invalidations = 0;
    const scope = new ComponentScope(
      () => {
        invalidations += 1;
      },
      (candidate) => (candidate === context ? provided : undefined),
    );
    let observed = scope.render(() => useContext(context));
    expect(observed).toBe("a");
    provided.set("b");
    expect(invalidations).toBe(1);
    observed = scope.render(() => useContext(context));
    expect(observed).toBe("b");
  });

  it("throws outside a component render like every other hook", () => {
    const context = createContext("fallback");
    expect(() => useContext(context)).toThrowError(/function component/u);
  });
});
