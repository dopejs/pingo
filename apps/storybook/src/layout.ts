import { createElement, memo, useSignal, type PingoNode } from "@dopejs/pingo";

/**
 * Fixed-width wrapper that lets its child fill it.
 *
 * The `style` prop is what makes the child fill the frame, and it does it
 * twice over: it opts this container into the CSS subset, where `align-items`
 * is `stretch` rather than the direct-prop path's `flex-start`, and it names
 * `column` so the child is stretched across the width rather than sized along
 * it. Every story that gave a component a definite width without saying this
 * got the opposite of what it meant -- a Progress track collapsed onto its own
 * indicator, an Accordion's rules ran only as wide as the longest title, and a
 * Table's header shrank away from its rows.
 */
export function frame(width: number, children: PingoNode): PingoNode {
  return createElement("container", {
    width,
    style: { flexDirection: "column" },
    children,
  });
}

/** `frame` with a definite height as well, for components that fill one. */
export function frameBox(width: number, height: number, children: PingoNode): PingoNode {
  return createElement("container", {
    width,
    height,
    style: { flexDirection: "column" },
    children,
  });
}

/**
 * Story-local state for a controlled component.
 *
 * Most of these components are controlled: they report a change and render
 * what the caller hands back. The stories bound the controlled prop straight
 * to a Storybook arg and passed an empty handler, so the component reported
 * every press into a void and re-rendered the same value — a checkbox that
 * never ticked, an accordion that never opened, a slider that never moved.
 * Nothing was wrong with the components; nobody was holding their state.
 *
 * `initial` is read once, when the story mounts. Changing an arg remounts the
 * story, so the controls still work as the initial value.
 */
export function stateful<T>(
  initial: T,
  render: (value: T, set: (next: T) => void) => PingoNode,
): PingoNode {
  return createElement(StatefulHost, {
    initial,
    render: render as (value: unknown, set: (next: unknown) => void) => PingoNode,
  });
}

type StatefulHostProps = {
  readonly initial: unknown;
  readonly render: (value: unknown, set: (next: unknown) => void) => PingoNode;
};

const StatefulHost = memo(function StatefulHostImpl(props: StatefulHostProps): PingoNode {
  const value = useSignal(props.initial);
  // .get() (not .peek()): a change has to re-render this host.
  return props.render(value.get(), (next) => {
    value.set(next);
  });
});
