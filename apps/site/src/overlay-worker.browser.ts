import { Combobox, createPingoUiStyleSheet } from "@dopejs/pingo-ui";
import { createElement, createHostedCanvasRoot, type FrameReport } from "@dopejs/pingo";
import { afterEach, describe, expect, it } from "vitest";

/**
 * An overlay on the transport the applications actually use.
 *
 * Every other overlay test pins `main-thread` so it stays deterministic, and
 * that is exactly how a whole class of breakage stayed invisible: on the Worker
 * transport the Mutation Stream and the Input Stream are separate channels, so
 * a `focus()` issued as the panel mounts can reach Core before the commit that
 * creates the panel. Core then clears focus outright, the anchor sees a
 * departure with nowhere to go, and the overlay closed itself on the press that
 * opened it -- a select that could not be opened, and a list that closed
 * without selecting.
 */
const pause = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

async function waitUntil(check: () => boolean, timeoutMs = 5000): Promise<boolean> {
  const end = performance.now() + timeoutMs;
  while (performance.now() < end) {
    if (check()) return true;
    await pause(16);
  }
  return check();
}

describe("anchored overlay on the worker transport", () => {
  const roots: Array<{ close: () => Promise<void> }> = [];

  afterEach(async () => {
    for (const root of roots.splice(0)) await root.close();
    document.body.replaceChildren();
  });

  it("opens from the trigger and runs the selection the press asked for", async () => {
    const width = 400;
    const height = 300;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.style.cssText = `display:block;width:${String(width)}px;height:${String(height)}px`;
    canvas.tabIndex = 0;
    document.body.append(canvas);
    const frames: FrameReport[] = [];
    const chosen: string[] = [];
    const semantics: Array<Record<string, unknown>> = [];
    // No transport preference: the same default a real application takes.
    const root = await createHostedCanvasRoot(canvas, {
      styleSheets: [createPingoUiStyleSheet()],
      onFrame: (report) => frames.push(report),
      onSemantics: (snapshot: unknown) => {
        semantics.length = 0;
        semantics.push(...(Array.isArray(snapshot) ? (snapshot as Record<string, unknown>[]) : []));
      },
    });
    roots.push(root);
    root.render(
      createElement("container", {
        width,
        height,
        style: { flexDirection: "column", paddingTop: "10px", alignItems: "center" },
        children: createElement("container", {
          width: 220,
          style: { flexDirection: "column" },
          children: createElement(Combobox, {
            items: [
              { value: "next", label: "Next.js" },
              { value: "remix", label: "Remix" },
              { value: "astro", label: "Astro" },
            ],
            defaultValue: "next",
            onValueChange: (value: string) => chosen.push(value),
          }),
        }),
      }),
    );
    expect(await waitUntil(() => frames.length > 0)).toBe(true);
    expect(await waitUntil(() => semantics.length > 0)).toBe(true);

    const rect = canvas.getBoundingClientRect();
    const click = async (x: number, y: number): Promise<void> => {
      canvas.dispatchEvent(
        new PointerEvent("pointermove", {
          bubbles: true,
          buttons: 0,
          clientX: rect.left + x,
          clientY: rect.top + y,
          pointerId: 3,
        }),
      );
      await pause(30);
      canvas.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          buttons: 1,
          clientX: rect.left + x,
          clientY: rect.top + y,
          pointerId: 3,
        }),
      );
      await pause(60);
      canvas.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          buttons: 0,
          clientX: rect.left + x,
          clientY: rect.top + y,
          pointerId: 3,
        }),
      );
      canvas.dispatchEvent(
        new MouseEvent("click", { bubbles: true, clientX: rect.left + x, clientY: rect.top + y }),
      );
      await pause(250);
    };
    const bounds = (node: Record<string, unknown> | undefined): Record<string, number> =>
      (node?.bounds ?? {}) as Record<string, number>;
    const options = (): Array<Record<string, unknown>> =>
      semantics.filter((node) => String(node.role) === "option");

    const trigger = bounds(semantics.find((node) => String(node.role) === "button"));
    await click((trigger.left ?? 0) + 20, (trigger.top ?? 0) + 10);
    // The press that opens it must not also close it.
    expect(options().length).toBeGreaterThan(0);

    const last = bounds(options()[options().length - 1]);
    await click((last.left ?? 0) + 20, (last.top ?? 0) + (last.height ?? 0) / 2);
    expect(chosen).toEqual(["astro"]);
    expect(options()).toHaveLength(0);
  }, 60_000);
});
