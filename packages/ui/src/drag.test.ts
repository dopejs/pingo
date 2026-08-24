import { describe, expect, it, vi } from "vitest";

import { ComponentScope } from "@dopejs/pingo-runtime/internal";

import { createDrag, positionToValue, useDrag, type DragHandlers } from "./drag";

function target() {
  return {
    setPointerCapture: vi.fn(),
    releasePointerCapture: vi.fn(),
    focus: vi.fn(),
  };
}

function event(x: number, y: number, pointerId = 1, currentTarget = target()) {
  return { x, y, pointerId, currentTarget } as never;
}

describe("createDrag", () => {
  it("captures on press and releases on end", () => {
    // Without capture a drag stops the moment the pointer leaves the node, and
    // every draggable control would grow that bug separately.
    const handle = target();
    const drag = createDrag({ onMove: vi.fn() });
    drag.onPointerDown(event(0, 0, 1, handle));
    expect(handle.setPointerCapture).toHaveBeenCalledWith(1);
    drag.onPointerUp(event(0, 0, 1, handle));
    expect(handle.releasePointerCapture).toHaveBeenCalledWith(1);
  });

  it("reports movement relative to where the drag began", () => {
    const onMove = vi.fn();
    const drag = createDrag({ onMove });
    drag.onPointerDown(event(10, 20));
    drag.onPointerMove(event(13, 24));
    expect(onMove).toHaveBeenCalledWith([3, 4], [13, 24]);
  });

  it("ignores movement before a press and after a release", () => {
    const onMove = vi.fn();
    const drag = createDrag({ onMove });
    drag.onPointerMove(event(5, 5));
    expect(onMove).not.toHaveBeenCalled();
    drag.onPointerDown(event(0, 0));
    drag.onPointerUp(event(1, 1));
    drag.onPointerMove(event(9, 9));
    expect(onMove).not.toHaveBeenCalled();
  });

  it("lets only the pointer that started the drag move or end it", () => {
    // A stray second touch releasing the capture mid-gesture is the failure
    // this guards; it looks like the control sticking to the cursor.
    const onMove = vi.fn();
    const onEnd = vi.fn();
    const handle = target();
    const drag = createDrag({ onMove, onEnd });
    drag.onPointerDown(event(0, 0, 1, handle));
    drag.onPointerMove(event(5, 5, 2, handle));
    expect(onMove).not.toHaveBeenCalled();
    drag.onPointerUp(event(0, 0, 2, handle));
    expect(handle.releasePointerCapture).not.toHaveBeenCalled();
    expect(onEnd).not.toHaveBeenCalled();
  });

  it("ignores a second press while a drag is already running", () => {
    const onStart = vi.fn();
    const drag = createDrag({ onMove: vi.fn(), onStart });
    drag.onPointerDown(event(0, 0, 1));
    drag.onPointerDown(event(5, 5, 2));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it("still starts the drag when the platform refuses the capture", () => {
    // `setPointerCapture` throws `NotFoundError` when there is no active
    // pointer with that id -- a cancelled touch, a pointer released between
    // the event and the call. The throw used to take the rest of the press
    // handler with it, so `onStart` never ran: the press committed nothing and
    // the gesture appeared to begin at the first move instead.
    const onStart = vi.fn();
    const onMove = vi.fn();
    const onEnd = vi.fn();
    const drag = createDrag({ onStart, onMove, onEnd });
    const refusing = {
      setPointerCapture: vi.fn(() => {
        throw new DOMException("no pointer", "NotFoundError");
      }),
      releasePointerCapture: vi.fn(() => {
        throw new DOMException("no pointer", "NotFoundError");
      }),
      focus: vi.fn(),
    };
    drag.onPointerDown(event(10, 10, 1, refusing));
    expect(onStart).toHaveBeenCalledWith([10, 10]);
    expect(refusing.focus).toHaveBeenCalled();

    // And the drag runs to its end, which is the point of surviving at all.
    drag.onPointerMove(event(30, 10, 1, refusing));
    expect(onMove).toHaveBeenCalledWith([20, 0], [30, 10]);
    drag.onPointerUp(event(30, 10, 1, refusing));
    expect(onEnd).toHaveBeenCalledWith(false);

    // A second gesture starts cleanly: the failed release still cleared state.
    drag.onPointerDown(event(50, 10, 1, refusing));
    expect(onStart).toHaveBeenCalledWith([50, 10]);
  });

  it("distinguishes a cancel from a release", () => {
    const onEnd = vi.fn();
    const drag = createDrag({ onMove: vi.fn(), onEnd });
    drag.onPointerDown(event(0, 0));
    drag.onPointerCancel(event(0, 0));
    expect(onEnd).toHaveBeenCalledWith(true);

    drag.onPointerDown(event(0, 0));
    drag.onPointerUp(event(0, 0));
    expect(onEnd).toHaveBeenLastCalledWith(false);
  });
});

describe("useDrag", () => {
  it("survives the re-render that the press itself causes", () => {
    // The recorded failure. `createDrag` keeps the press position in its
    // closure, and Slider and Resizable each built a fresh one every render.
    // The press committed a value, that re-rendered the component, and the
    // node was handed handlers that had never seen a press -- so every move
    // after it fell through the `origin === undefined` guard. The thumb jumped
    // to where the pointer went down and then stopped following it.
    const onMove = vi.fn();
    const scope = new ComponentScope(() => undefined);
    let renders = 0;
    const render = (): DragHandlers =>
      scope.render((): DragHandlers => {
        renders += 1;
        // A fresh callbacks object each render, as a real component has.
        return useDrag({
          onMove: (delta, position) => {
            onMove(delta, position, renders);
          },
        });
      });

    const first = render();
    first.onPointerDown(event(10, 10));
    // The commit re-renders; the node keeps the handlers it was given.
    const second = render();
    expect(second).toBe(first);
    second.onPointerMove(event(40, 10));
    // Relative to the press, not to nothing -- and through the latest closure.
    expect(onMove).toHaveBeenCalledWith([30, 0], [40, 10], 2);
  });
});

describe("positionToValue", () => {
  const track = { start: 100, length: 200 };

  it("maps the ends and the middle", () => {
    expect(positionToValue(100, track, { min: 0, max: 10 })).toBe(0);
    expect(positionToValue(300, track, { min: 0, max: 10 })).toBe(10);
    expect(positionToValue(200, track, { min: 0, max: 10 })).toBe(5);
  });

  it("clamps outside the track instead of extrapolating", () => {
    expect(positionToValue(0, track, { min: 0, max: 10 })).toBe(0);
    expect(positionToValue(9999, track, { min: 0, max: 10 })).toBe(10);
  });

  it("snaps to the nearest step measured from min", () => {
    expect(positionToValue(210, track, { min: 0, max: 10, step: 2 })).toBe(6);
    expect(positionToValue(150, track, { min: 1, max: 11, step: 5 })).toBe(6);
  });

  it("stays on the step grid at the top end rather than clamping off it", () => {
    // 0..10 by 3 has no grid point at 10. Returning 10 would hand the caller a
    // value its own step rule says cannot exist, so the top steps back to 9.
    expect(positionToValue(300, track, { min: 0, max: 10, step: 3 })).toBe(9);
    expect(positionToValue(300, track, { min: 0, max: 10, step: 4 })).toBe(8);
    // A span that divides evenly still reaches max.
    expect(positionToValue(300, track, { min: 0, max: 10, step: 5 })).toBe(10);
  });

  it("returns min for a zero-length track rather than dividing by zero", () => {
    expect(positionToValue(50, { start: 0, length: 0 }, { min: 2, max: 8 })).toBe(2);
  });
});
