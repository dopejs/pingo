import { createElement, memo, useSignal, type PingoNode } from "@dopejs/pingo";

/**
 * Fixed-width wrapper that lets its child fill it.
 *
 * A container written with direct props and no `style` prop takes the legacy
 * direct-prop path, where `align-items` is `flex-start` rather than the CSS
 * initial `stretch`. Every story that gave a component a definite width that
 * way got the opposite of what it meant: the component shrank to its own
 * content instead of filling the frame. A Progress track collapsed onto its
 * own indicator, an Accordion's rules ran only as wide as the longest title,
 * and a Table column written as `flex: 1 1 0` resolved to zero and drew its
 * header on top of the next one.
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
