import type { PingoFont } from "./font";
import type { PingoImage } from "./image";
import type { PingoSvg } from "./svg";
import type { MemoComponent } from "./memo";
import type {
  DocumentSelectionReport,
  EditTransaction,
  StructureRequest,
  TextEditingController,
} from "@dopejs/pingo-editing";
import type { AnyContextProvider } from "@dopejs/pingo-runtime";
import type { PingoStyle } from "@dopejs/pingo-style";

/** Stable list identity used by localized reconciliation. */
export type Key = string | number;

/** Engine-native host element names. */
export type HostType =
  "container" | "editableText" | "image" | "path" | "scroll" | "text" | "video" | "virtualList";

/** Mounted host handle exposed through refs without leaking internal instances. */
export interface NodeHandle {
  /** Generation-bearing Core node identifier. */
  readonly nodeId: number;
  /** Requests explicit Core pointer capture for this mounted node. */
  setPointerCapture(pointerId: number): void;
  /** Releases explicit Core pointer capture when this node owns it. */
  releasePointerCapture(pointerId: number): void;
  /** Returns whether Core most recently reported this node as capture owner. */
  hasPointerCapture(pointerId: number): boolean;
  /** Requests Core focus without inferring keyboard focus visibility. */
  focus(): void;
  /** Clears Core focus when this node owns it. */
  blur(): void;
}

/** Mounted View handle for deterministic Core-owned scrolling. */
export interface ViewHandle extends NodeHandle {
  /** Immediately sets the logical content offset and cancels existing motion. */
  scrollTo(x: number, y: number): void;
  /** Immediately offsets the logical content position and cancels existing motion. */
  scrollBy(deltaX: number, deltaY: number): void;
  /** Starts constant-velocity Core scrolling; two zeros stop it. */
  setScrollVelocity(velocityX: number, velocityY: number): void;
}

/** Mounted Video handle. Commands are forwarded to the Host-owned media element. */
export interface VideoHandle extends NodeHandle {
  play(): void;
  pause(): void;
  seek(timeSeconds: number): void;
}

/** Object or callback ref. */
export type Ref<T> = { current: T | null } | ((value: T | null) => void);

/** DOM-style event phase after Core world-space hit testing. */
export type PingoEventPhase = 1 | 2 | 3;

/** Stable Shell event object; coordinates are canvas-local logical pixels. */
export interface PingoEvent {
  readonly type:
    | "blur"
    | "click"
    | "focus"
    | "focusin"
    | "focusout"
    | "gotpointercapture"
    | "contextmenu"
    | "keydown"
    | "keyup"
    | "lostpointercapture"
    | "pointercancel"
    | "pointerdown"
    | "pointerenter"
    | "pointerleave"
    | "pointermove"
    | "pointerout"
    | "pointerover"
    | "pointerup"
    | "wheel";
  readonly eventId: number;
  readonly target: NodeHandle;
  readonly currentTarget: NodeHandle;
  readonly relatedTarget: NodeHandle | null;
  readonly eventPhase: PingoEventPhase;
  readonly x: number;
  readonly y: number;
  readonly deltaX: number;
  readonly deltaY: number;
  readonly buttons: number;
  readonly pointerId: number;
  readonly pointerType: "mouse" | "none" | "pen" | "touch";
  readonly isPrimary: boolean;
  readonly pressure: number;
  readonly tiltX: number;
  readonly tiltY: number;
  readonly width: number;
  readonly height: number;
  readonly elapsedMicros: number;
  /**
   * `KeyboardEvent.key` on a key event, `""` otherwise.
   *
   * `preventDefault()` on a key event only stops Shell propagation. It never
   * suppresses editing: text insertion comes from the editing transaction path,
   * which does not read key events.
   */
  readonly key: string;
  /** `KeyboardEvent.code` on a key event, `""` otherwise or when unrecognized. */
  readonly code: string;
  /** Whether a key press is an auto-repeat. */
  readonly repeat: boolean;
  readonly shiftKey: boolean;
  readonly ctrlKey: boolean;
  readonly altKey: boolean;
  readonly metaKey: boolean;
  readonly defaultPrevented: boolean;
  preventDefault(): void;
  stopPropagation(): void;
  stopImmediatePropagation(): void;
}

/** Handler invoked during Core-resolved capture or bubble propagation. */
export type PingoEventHandler = (event: PingoEvent) => void;

/** RGBA color accepted by portable solid-paint encoding. */
export type Color =
  | `#${string}`
  | {
      readonly red: number;
      readonly green: number;
      readonly blue: number;
      readonly alpha?: number;
    };

/** Four logical-pixel edges in top/right/bottom/left order. */
export type EdgeInsets = number | readonly [number, number, number, number];

/** Timing functions supported by the Core animation timeline. */
export type AnimationEasing =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | { readonly cubicBezier: readonly [number, number, number, number] }
  | { readonly steps: number; readonly position?: "start" | "end" };

/** Compositor-friendly property supported by M7. */
export type AnimatedProperty = "opacity" | "transform";

/** Transition declaration; a new durable target retargets from presentation. */
export interface TransitionSpec {
  readonly property: AnimatedProperty;
  readonly durationMs: number;
  readonly delayMs?: number;
  readonly easing?: AnimationEasing;
}

/** One immutable keyframe with a property-compatible value. */
export interface AnimationKeyframe {
  readonly offset: number;
  readonly value: number | readonly [number, number, number, number, number, number];
}

/** Core-owned immutable keyframe animation. */
export interface KeyframeAnimationSpec {
  readonly property: AnimatedProperty;
  readonly keyframes: readonly AnimationKeyframe[];
  readonly durationMs: number;
  readonly delayMs?: number;
  readonly easing?: AnimationEasing;
  readonly iterations?: number;
  readonly direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
  readonly fill?: "none" | "forwards" | "backwards" | "both";
  readonly playState?: "running" | "paused";
}

/** Shared host properties mapped to generated Scene props. */
export interface CommonProps {
  readonly key?: Key;
  readonly ref?: Ref<NodeHandle>;
  readonly children?: PingoNode;
  /**
   * Identifies this node as the one drawing a document block.
   *
   * Set it on whatever node holds the block's text, wrapped in list chrome or
   * not: the projection names blocks by key, and the reconciler resolves the
   * Scene node from whichever descendant claims that key.
   */
  readonly blockKey?: number;
  /** Registered same-node class selectors, separated by ASCII whitespace. */
  readonly className?: string;
  /** Typed inline declarations resolved by the Shell before entering Core. */
  readonly style?: PingoStyle;
  readonly width?: number;
  readonly height?: number;
  readonly minWidth?: number;
  readonly minHeight?: number;
  readonly maxWidth?: number;
  readonly maxHeight?: number;
  readonly padding?: EdgeInsets;
  /**
   * Child flow axis. Defaults to `"column"`.
   *
   * Children are placed one after another along this axis and the container's
   * natural size is the run along it by the tallest/widest child across it.
   * There is no cross-axis alignment yet: children sit at the leading edge.
   */
  readonly direction?: "column" | "row";
  /** Space inserted between adjacent children, never before or after them. */
  readonly gap?: number;
  readonly backgroundColor?: Color;
  readonly opacity?: number;
  readonly transform?: readonly [number, number, number, number, number, number];
  readonly transition?: TransitionSpec | readonly TransitionSpec[];
  readonly animation?: KeyframeAnimationSpec | readonly KeyframeAnimationSpec[];
  readonly onTap?: () => void;
  readonly onPointerDownCapture?: PingoEventHandler;
  readonly onPointerDown?: PingoEventHandler;
  readonly onPointerUpCapture?: PingoEventHandler;
  readonly onPointerUp?: PingoEventHandler;
  readonly onPointerMoveCapture?: PingoEventHandler;
  readonly onPointerMove?: PingoEventHandler;
  readonly onPointerCancelCapture?: PingoEventHandler;
  readonly onPointerCancel?: PingoEventHandler;
  readonly onPointerOverCapture?: PingoEventHandler;
  readonly onPointerOver?: PingoEventHandler;
  readonly onPointerOutCapture?: PingoEventHandler;
  readonly onPointerOut?: PingoEventHandler;
  readonly onPointerEnterCapture?: PingoEventHandler;
  readonly onPointerEnter?: PingoEventHandler;
  readonly onPointerLeaveCapture?: PingoEventHandler;
  readonly onPointerLeave?: PingoEventHandler;
  readonly onGotPointerCaptureCapture?: PingoEventHandler;
  readonly onGotPointerCapture?: PingoEventHandler;
  readonly onLostPointerCaptureCapture?: PingoEventHandler;
  readonly onLostPointerCapture?: PingoEventHandler;
  readonly onFocusCapture?: PingoEventHandler;
  readonly onFocus?: PingoEventHandler;
  readonly onBlurCapture?: PingoEventHandler;
  readonly onBlur?: PingoEventHandler;
  readonly onFocusInCapture?: PingoEventHandler;
  readonly onFocusIn?: PingoEventHandler;
  readonly onFocusOutCapture?: PingoEventHandler;
  readonly onFocusOut?: PingoEventHandler;
  readonly onClickCapture?: PingoEventHandler;
  readonly onClick?: PingoEventHandler;
  readonly onWheelCapture?: PingoEventHandler;
  readonly onWheel?: PingoEventHandler;
  /**
   * Key press routed to the focused node.
   *
   * Core delivers key events only to whatever currently holds focus; a node
   * that is not focused never sees them.
   */
  readonly onKeyDownCapture?: PingoEventHandler;
  readonly onKeyDown?: PingoEventHandler;
  readonly onKeyUpCapture?: PingoEventHandler;
  readonly onKeyUp?: PingoEventHandler;
  /**
   * Context-menu request, routed by hit test to the node under the pointer.
   *
   * Unlike a pointer press it leaves hover and active state alone: what the
   * user is now interacting with is the menu, not the node beneath it. The Host
   * suppresses the platform menu, so a handler is the only way one appears.
   */
  readonly onContextMenuCapture?: PingoEventHandler;
  readonly onContextMenu?: PingoEventHandler;
  readonly semanticRole?: string;
  readonly semanticLabel?: string;
  readonly semanticValue?: string;
}

/** Generic grouping element. */
export type ContainerProps = CommonProps;

/**
 * Engine-drawn bitmap.
 *
 * With no explicit `width`/`height` the node takes the image's pixel
 * dimensions; with one, the image is scaled into that box.
 */
export interface ImageProps extends Omit<CommonProps, "children"> {
  readonly source: PingoImage;
}

/** Stable media event emitted by the Host-owned playback pipeline. */
export interface PingoMediaEvent {
  readonly type: "ended" | "loadedmetadata" | "pause" | "play" | "timeupdate";
  readonly currentTime: number;
  readonly duration: number;
}

/** Bounded, diagnosable media failure without exposing a browser media object. */
export interface PingoMediaError {
  readonly code: "aborted" | "decode" | "network" | "not-supported" | "security" | "unknown";
  readonly message: string;
}

/** Engine-drawn video whose browser loading and decoding remain Host-owned. */
export interface VideoProps extends Omit<CommonProps, "children" | "ref"> {
  readonly src: string;
  readonly poster?: PingoImage;
  readonly ref?: Ref<VideoHandle>;
  readonly autoPlay?: boolean;
  readonly loop?: boolean;
  readonly muted?: boolean;
  readonly crossOrigin?: "anonymous" | "use-credentials";
  readonly preload?: "auto" | "metadata" | "none";
  readonly onPlay?: (event: PingoMediaEvent) => void;
  readonly onPause?: (event: PingoMediaEvent) => void;
  readonly onEnded?: (event: PingoMediaEvent) => void;
  readonly onLoadedMetadata?: (event: PingoMediaEvent) => void;
  readonly onTimeUpdate?: (event: PingoMediaEvent) => void;
  readonly onError?: (error: PingoMediaError) => void;
}

/** Clipped Core-owned scrolling element. */
export interface ScrollProps extends CommonProps {
  readonly scrollX?: number;
  readonly scrollY?: number;
}

/** Engine-drawn vector outline, authored as SVG path data. */
export interface PathProps extends Omit<CommonProps, "children"> {
  /** SVG `d` attribute. Only the path grammar, not an SVG document. */
  readonly d: string;
  /** Author-space box the outline is drawn in; scaled into the node's box. */
  readonly viewBox?: readonly [number, number, number, number];
  /** Non-zero strokes the outline at this width instead of filling it. */
  readonly strokeWidth?: number;
  /**
   * Baked into the outline's points before encoding, from an SVG `transform`.
   *
   * Distinct from `transform`, which is a visual transform the engine applies
   * to the node and its children. This one belongs to the geometry: a group
   * transform in a document moves the artwork, not the box it sits in.
   */
  readonly geometryTransform?: readonly [number, number, number, number, number, number];
  readonly fillRule?: "nonzero" | "evenodd";
}

/** Engine-drawn SVG document, expanded to one outline per shape. */
export interface SvgProps extends Omit<CommonProps, "children"> {
  /** Parsed document; build one with `createSvg` or `loadSvg`. */
  readonly source: PingoSvg;
}

/** Core-planned virtual list whose Shell materializes only the requested preheat window. */
export interface VirtualListProps extends Omit<CommonProps, "children"> {
  readonly itemCount: number;
  readonly estimatedItemHeight: number;
  readonly renderItem: (index: number) => PingoNode;
  readonly baseOverscanViewports?: number;
  readonly velocityHorizonSeconds?: number;
  readonly maximumAheadViewports?: number;
  readonly scrollX?: number;
  readonly scrollY?: number;
}

/**
 * One block of a document projection.
 *
 * The Core does not know why blocks nest or what they mean; it maintains
 * positions, selection, composition and undo over this sequence. `key` is the
 * Shell's stable identity for the block -- splitting makes a new one, merging
 * keeps the first -- and the Core only ever compares keys.
 */
export interface DocumentBlockProps {
  /** Stable Shell-assigned identity; never zero. */
  readonly key: number;
  /** UTF-16 length of the block's text; zero for an atomic block. */
  readonly lenUtf16: number;
  /** Whether the caret may not enter the block. */
  readonly atomic?: boolean;
}

/**
 * A document projection attached to a View.
 *
 * Declared on every commit, the way the component tree is: the Shell owns the
 * document tree and states the ordered block sequence, and the Core owns the
 * flat position space over it. A block whose key no child claims is one the
 * Shell has not materialized -- declaring its length is what lets a virtualized
 * document keep one position space.
 */
/** Everything Core sends back about one document in a frame. */
export interface DocumentEditStream {
  readonly transactions: readonly EditTransaction[];
  readonly structure: readonly StructureRequest[];
  readonly selections: readonly DocumentSelectionReport[];
}

export interface DocumentProps {
  /**
   * The Shell's revision of the projection.
   *
   * Core echoes it on the transactions it sends back, so a stale
   * acknowledgement cannot overwrite newer input.
   */
  readonly revision: number | bigint;
  /** Blocks in document order. */
  readonly blocks: readonly DocumentBlockProps[];
  /**
   * Receives everything Core sends back about this document.
   *
   * On the projection rather than on the root, so a document is a component
   * someone can mount twice: the transactions for its blocks, the structure it
   * was asked to decide, and the selection it moved all arrive here.
   */
  readonly onEditStream?: (stream: DocumentEditStream) => void;
  /**
   * Where the selection is on screen, in canvas coordinates.
   *
   * The Core owns the text layout, so it is the only side that can say where a
   * range of characters ended up. A floating toolbar anchors to this.
   */
  readonly onSelectionGeometry?: (rect: DocumentSelectionRect) => void;
}

/** A document selection's box on the canvas, in device-independent pixels. */
export interface DocumentSelectionRect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

/** Explicit single-axis data window attached to a View. */
export interface VirtualViewProps {
  readonly axis?: "x" | "y";
  readonly itemCount: number;
  readonly estimatedItemSize: number;
  readonly getItemKey?: (index: number) => Key;
  readonly renderItem: (index: number) => PingoNode;
  readonly baseOverscanViewports?: number;
  readonly velocityHorizonSeconds?: number;
  readonly maximumAheadViewports?: number;
}

/** Minimal M1 text fallback properties. */
/**
 * One styled span of a text value, in UTF-16 offsets.
 *
 * Offsets are UTF-16 because that is what a JavaScript string index is; the
 * reconciler converts to the UTF-8 offsets the Core stores. A span may not
 * split a surrogate pair, and spans must be ascending and non-overlapping.
 * Anything a span leaves uncovered renders with the node's own style, so a
 * caller states only the differences.
 */
export interface TextRunProps {
  /** UTF-16 offset where the span starts. */
  readonly start: number;
  /** UTF-16 offset where the span ends, exclusive. */
  readonly end: number;
  readonly color?: Color;
  /**
   * Explicit font for this span, or the node's font when absent.
   *
   * A weight is a different face, not a number the shaper can interpolate, so
   * this is how a bold span gets drawn bold rather than merely labelled.
   */
  readonly font?: PingoFont;
  readonly fontFamily?: string;
  readonly fontSize?: number;
  readonly fontWeight?: number;
  readonly lineHeight?: number;
  /** Whether the caret steps over the span as one object. */
  readonly atomic?: boolean;
}

export interface TextProps extends Omit<CommonProps, "children"> {
  readonly value?: string;
  readonly children?: string | number;
  readonly color?: Color;
  readonly fontFamily?: string;
  /** Explicit immutable SFNT font; unsupported input falls back as a whole run. */
  readonly font?: PingoFont;
  readonly fontSize?: number;
  readonly fontWeight?: number;
  readonly lineHeight?: number;
  /**
   * Spans of the value that differ from the node's own style.
   *
   * Wrapping couples the spans, so the node is laid out once with the whole
   * table rather than per span. An empty value ignores the table: there is
   * nothing to style.
   *
   * Requires `font`. Without one the Core cannot shape the value and draws it
   * through the host's system-font fallback, which measures and paints the
   * whole node in one style and ignores the table entirely.
   */
  readonly runs?: readonly TextRunProps[];
}

/** Soft-keyboard hint forwarded to the host input surface. */
export type EditableInputMode =
  "decimal" | "email" | "none" | "numeric" | "search" | "tel" | "text" | "url";

/** Engine-native editable-text primitive; browser bridging is owned by the host. */
export interface EditableTextProps extends Omit<TextProps, "children"> {
  /** Stable local controller; mutually exclusive with value/revision. */
  readonly controller?: TextEditingController;
  readonly value?: string;
  /** Authoritative controlled-value revision; stale revisions never replace newer Core input. */
  readonly revision?: number | bigint;
  readonly multiline?: boolean;
  readonly readOnly?: boolean;
  /**
   * Refuses editing outright, the way a disabled control does.
   *
   * Stronger than `readOnly`, which is focusable and shows a caret so its value
   * can be selected and copied: a disabled field never opens an editing
   * session, so it takes no focus, shows no caret and reaches no input method.
   */
  readonly disabled?: boolean;
  readonly password?: boolean;
  readonly maxGraphemes?: number;
  /** Soft-keyboard layout hint; defaults to plain text. */
  readonly inputMode?: EditableInputMode;
  readonly onTransaction?: (transaction: EditTransaction) => void;
  readonly onSubmit?: () => void;
}

/** Function component evaluated inside a reconciler-owned hook scope. */
export type FunctionComponent<Props = Record<string, never>> = (props: Props) => PingoNode;

/** Fragment marker accepted as an element type. */
export const Fragment: unique symbol = Symbol.for("dopejs.pingo.fragment");

/** Host, component, memo component, context provider, or Fragment element type. */
export type ElementType<Props = Record<string, unknown>> =
  HostType | FunctionComponent<Props> | MemoComponent<Props> | AnyContextProvider | typeof Fragment;

/** Erased immutable descriptor used in heterogeneous child collections. */
export interface AnyPingoElement {
  readonly $$typeof: symbol;
  readonly type:
    | HostType
    | FunctionComponent<never>
    | MemoComponent<never>
    | AnyContextProvider
    | typeof Fragment;
  readonly key: Key | null;
  readonly props: Readonly<Record<string, unknown>>;
}

/** Immutable JSX descriptor preserving component prop inference. */
export interface PingoElement<
  Props extends Record<string, unknown> = Record<string, unknown>,
> extends AnyPingoElement {
  readonly type: ElementType<Props>;
  readonly props: Readonly<Props>;
}

/** Values accepted in component and host children. */
export type PingoNode =
  AnyPingoElement | string | number | bigint | boolean | null | undefined | readonly PingoNode[];

/** TypeScript automatic-JSX namespace. */
// eslint-disable-next-line @typescript-eslint/no-namespace -- TypeScript's JSX import-source contract requires this namespace name.
export declare namespace JSX {
  export type Element = AnyPingoElement;
  /**
   * What may appear as a JSX tag.
   *
   * Without this, TypeScript falls back to requiring a component's return type
   * to be assignable to `Element | null`. `PingoNode` includes `undefined`, so
   * every component written with the return type this package documents was
   * rejected as a tag. Declaring the tag vocabulary directly is what the
   * `ElementType` hook exists for.
   */
  export type ElementType =
    | keyof IntrinsicElements
    | FunctionComponent<never>
    | MemoComponent<never>
    | AnyContextProvider
    | typeof Fragment;
  export interface ElementChildrenAttribute {
    children: unknown;
  }
  export interface IntrinsicAttributes {
    key?: Key;
  }
  export interface IntrinsicElements {
    container: ContainerProps;
    editableText: EditableTextProps;
    image: ImageProps;
    scroll: ScrollProps;
    text: TextProps;
    video: VideoProps;
    path: PathProps;
    virtualList: VirtualListProps;
  }
}
