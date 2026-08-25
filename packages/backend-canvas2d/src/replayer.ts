import { readDisplayListHeader, validateInstructionSize } from "./display-list";
import type { DisplayListReader } from "./display-list";
import { DisplayOpcode } from "./generated";
import type { CanvasGlyphSpan } from "./glyph-resources";

/** Canvas 2D contexts supported on the main thread and in workers. */
export type Canvas2DContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

/** Host-resolved font and fill state for the system-text fallback path. */
export interface CanvasTextStyle {
  readonly font: string;
  readonly fillStyle: string | CanvasGradient | CanvasPattern;
  readonly lineHeight?: number;
  readonly direction?: CanvasDirection;
  readonly textAlign?: CanvasTextAlign;
  readonly textBaseline?: CanvasTextBaseline;
  /** Internal fallback path marker for distributing inter-word space. */
  readonly justify?: boolean;
}

/** Resource table consulted by the allocation-conscious replay loop. */
export interface Canvas2DResources {
  getPaint(id: number): string | CanvasGradient | CanvasPattern | undefined;
  getPath(id: number): Path2D | undefined;
  getImage(id: number): CanvasImageSource | undefined;
  getText(id: number): string | undefined;
  getTextStyle(id: number): CanvasTextStyle | undefined;
  getFont(id: number): object | undefined;
  getGlyphSpan(id: number): CanvasGlyphSpan | undefined;
  getPicture(id: number): Uint8Array | undefined;
  drawGlyphRun:
    | ((
        context: Canvas2DContext,
        fontId: number,
        size: number,
        x: number,
        y: number,
        glyphSpanId: number,
      ) => void)
    | undefined;
}

/** Deterministic validation failure raised before any canvas pixels are touched. */
export class Canvas2DReplayError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "Canvas2DReplayError";
  }
}

/** Work counters from one fully validated replay. */
export interface ReplayStats {
  /** Commands including recursively expanded pictures. */
  readonly commands: number;
  /** DrawPicture expansions. */
  readonly pictures: number;
  /** Deepest picture nesting, with the root list at depth zero. */
  readonly maximumPictureDepth: number;
}

const MAX_PICTURE_DEPTH = 64;
const MAX_EXPANDED_COMMANDS = 4_194_304;

interface ValidationState {
  commands: number;
  pictures: number;
  maximumPictureDepth: number;
  readonly activePictures: Set<number>;
}

/** Validates complete lists/resources before executing a thin typed-reader loop. */
export class Canvas2DReplayer {
  readonly #activePictures = new Set<number>();

  /**
   * Replays one immutable frame. Resource getters must remain stable for the
   * synchronous validation/replay call; malformed input never reaches canvas.
   */
  public replay(
    context: Canvas2DContext,
    bytes: Uint8Array,
    resources: Canvas2DResources,
  ): ReplayStats {
    this.#activePictures.clear();
    const state: ValidationState = {
      commands: 0,
      pictures: 0,
      maximumPictureDepth: 0,
      activePictures: this.#activePictures,
    };
    validateList(bytes, resources, state, 0);

    context.save();
    try {
      replayList(context, bytes, resources);
    } finally {
      context.restore();
    }
    return {
      commands: state.commands,
      pictures: state.pictures,
      maximumPictureDepth: state.maximumPictureDepth,
    };
  }
}

function validateList(
  bytes: Uint8Array,
  resources: Canvas2DResources,
  state: ValidationState,
  depth: number,
): void {
  if (depth > MAX_PICTURE_DEPTH) replayFail("picture nesting exceeds the maximum depth");
  state.maximumPictureDepth = Math.max(state.maximumPictureDepth, depth);
  const { reader, declaredCount } = readDisplayListHeader(bytes);
  state.commands += declaredCount;
  if (state.commands > MAX_EXPANDED_COMMANDS) {
    replayFail("expanded picture command count exceeds the replay budget");
  }
  let actualCount = 0;
  let saveDepth = 0;
  while (reader.remaining > 0) {
    const offset = reader.offset;
    const header = reader.instruction();
    actualCount += 1;
    if (!isKnownOpcode(DisplayOpcode, header.opcode)) {
      if (!header.optional) replayFail(`unknown display-list opcode ${String(header.opcode)}`);
      reader.seekTo(header.end);
      continue;
    }
    const opcode = header.opcode;
    if (opcode === DisplayOpcode.Save) saveDepth += 1;
    if (opcode === DisplayOpcode.Restore) {
      if (saveDepth === 0) replayFail("Restore underflows the graphics-state stack");
      saveDepth -= 1;
    }
    validateCommand(reader, opcode, resources, state, depth);
    validateInstructionSize(opcode, offset, reader.offset);
    if (reader.offset !== header.end) replayFail("instruction length does not match its payload");
  }
  if (actualCount !== declaredCount) replayFail("instruction count does not match input");
  if (saveDepth !== 0) replayFail("display list has unmatched Save commands");
}

function validateCommand(
  reader: DisplayListReader,
  opcode: DisplayOpcode,
  resources: Canvas2DResources,
  state: ValidationState,
  depth: number,
): void {
  switch (opcode) {
    case DisplayOpcode.Save:
    case DisplayOpcode.Restore:
      return;
    case DisplayOpcode.Transform:
      reader.skipF32(6);
      return;
    case DisplayOpcode.ClipRect:
      reader.skipF32(4);
      return;
    case DisplayOpcode.Alpha: {
      const alpha = reader.f32();
      if (alpha < 0 || alpha > 1) replayFail("alpha is outside the zero-to-one range");
      return;
    }
    case DisplayOpcode.FillRect:
      reader.skipF32(4);
      required(resources.getPaint(reader.u32()), "paint");
      return;
    case DisplayOpcode.FillColorRect:
      reader.skipF32(2);
      if (reader.f32() < 0 || reader.f32() < 0) {
        replayFail("color rectangle has negative extent");
      }
      reader.u32();
      return;
    case DisplayOpcode.FillColorRRect: {
      reader.skipF32(2);
      if (reader.f32() < 0 || reader.f32() < 0) {
        replayFail("rounded color rectangle has negative extent");
      }
      for (let index = 0; index < 4; index += 1) {
        if (reader.f32() < 0) replayFail("rounded color rectangle has negative radius");
      }
      reader.u32();
      return;
    }
    case DisplayOpcode.FillColorShadow: {
      reader.skipF32(2);
      if (reader.f32() < 0 || reader.f32() < 0) {
        replayFail("shadow has negative extent");
      }
      for (let index = 0; index < 4; index += 1) {
        if (reader.f32() < 0) replayFail("shadow has negative radius");
      }
      reader.skipF32(2);
      if (reader.f32() < 0) replayFail("shadow has negative blur");
      reader.u32();
      return;
    }
    case DisplayOpcode.FillColorBorder: {
      reader.skipF32(2);
      if (reader.f32() < 0 || reader.f32() < 0) {
        replayFail("color border has negative extent");
      }
      for (let index = 0; index < 8; index += 1) {
        if (reader.f32() < 0) replayFail("color border has a negative radius or width");
      }
      reader.u32();
      reader.u32();
      reader.u32();
      reader.u32();
      return;
    }
    case DisplayOpcode.FillRRect: {
      reader.skipF32(4);
      for (let index = 0; index < 4; index += 1) {
        if (reader.f32() < 0) replayFail("rounded-rectangle radius is negative");
      }
      required(resources.getPaint(reader.u32()), "paint");
      return;
    }
    case DisplayOpcode.FillPath:
      required(resources.getPath(reader.u32()), "path");
      required(resources.getPaint(reader.u32()), "paint");
      return;
    case DisplayOpcode.FillColorPath:
      required(resources.getPath(reader.u32()), "path");
      reader.u32();
      return;
    case DisplayOpcode.StrokeColorPath: {
      required(resources.getPath(reader.u32()), "path");
      reader.u32();
      validateStrokeStyle(reader);
      return;
    }
    case DisplayOpcode.StrokePath: {
      required(resources.getPath(reader.u32()), "path");
      required(resources.getPaint(reader.u32()), "paint");
      validateStrokeStyle(reader);
      return;
    }
    case DisplayOpcode.DrawGlyphRun: {
      const fontId = reader.u32();
      const size = reader.f32();
      if (size < 0) replayFail("glyph-run font size is negative");
      reader.skipF32(2);
      const glyphSpanId = reader.u32();
      required(resources.getFont(fontId), "font");
      required(resources.getGlyphSpan(glyphSpanId), "glyph span");
      if (resources.drawGlyphRun === undefined) replayFail("glyph-run renderer is unavailable");
      return;
    }
    case DisplayOpcode.DrawTextFallback:
      required(resources.getText(reader.u32()), "text");
      required(resources.getTextStyle(reader.u32()), "text style");
      reader.skipF32(2);
      return;
    case DisplayOpcode.DrawTextInlineFallback:
      required(resources.getTextStyle(reader.u32()), "text style");
      reader.skipF32(2);
      reader.utf8(reader.u32());
      return;
    case DisplayOpcode.FillPlaceholder: {
      reader.skipF32(2);
      if (reader.f32() < 0 || reader.f32() < 0) {
        replayFail("placeholder has negative extent");
      }
      reader.u32();
      return;
    }
    case DisplayOpcode.DrawEditorDecoration: {
      reader.skipF32(2);
      if (reader.f32() < 0 || reader.f32() < 0) {
        replayFail("editor decoration has negative extent");
      }
      reader.u32();
      const kind = reader.u16();
      if (kind < 1 || kind > 3) replayFail("unknown editor decoration kind");
      if (reader.u16() !== 0) replayFail("editor decoration reserved bytes must be zero");
      return;
    }
    case DisplayOpcode.DrawImage:
      required(resources.getImage(reader.u32()), "image");
      reader.skipF32(8);
      return;
    case DisplayOpcode.DrawPicture: {
      const pictureId = reader.u32();
      reader.skipF32(2);
      const picture = required(resources.getPicture(pictureId), "picture");
      if (state.activePictures.has(pictureId)) replayFail("picture graph contains a cycle");
      state.pictures += 1;
      state.activePictures.add(pictureId);
      try {
        validateList(picture, resources, state, depth + 1);
      } finally {
        state.activePictures.delete(pictureId);
      }
      return;
    }
    default:
      return assertNeverOpcode(opcode);
  }
}

function replayList(
  context: Canvas2DContext,
  bytes: Uint8Array,
  resources: Canvas2DResources,
): void {
  const { reader } = readDisplayListHeader(bytes);
  while (reader.remaining > 0) {
    const header = reader.instruction();
    // Validation already ran over these bytes, so an unknown opcode here can
    // only be one the validator agreed to skip.
    if (typeof DisplayOpcode[header.opcode] !== "string") {
      reader.seekTo(header.end);
      continue;
    }
    replayCommand(context, reader, header.opcode, resources);
    reader.seekTo(header.end);
  }
}

function replayCommand(
  context: Canvas2DContext,
  reader: DisplayListReader,
  opcode: DisplayOpcode,
  resources: Canvas2DResources,
): void {
  switch (opcode) {
    case DisplayOpcode.Save:
      context.save();
      return;
    case DisplayOpcode.Restore:
      context.restore();
      return;
    case DisplayOpcode.Transform:
      context.transform(
        reader.f32(),
        reader.f32(),
        reader.f32(),
        reader.f32(),
        reader.f32(),
        reader.f32(),
      );
      return;
    case DisplayOpcode.ClipRect: {
      const x = reader.f32();
      const y = reader.f32();
      const width = reader.f32();
      const height = reader.f32();
      context.beginPath();
      context.rect(x, y, width, height);
      context.clip();
      return;
    }
    case DisplayOpcode.Alpha:
      context.globalAlpha *= reader.f32();
      return;
    case DisplayOpcode.FillRect: {
      const x = reader.f32();
      const y = reader.f32();
      const width = reader.f32();
      const height = reader.f32();
      context.fillStyle = required(resources.getPaint(reader.u32()), "paint");
      context.fillRect(x, y, width, height);
      return;
    }
    case DisplayOpcode.FillColorRect: {
      const x = reader.f32();
      const y = reader.f32();
      const width = reader.f32();
      const height = reader.f32();
      context.fillStyle = rgbaCss(reader.u32());
      context.fillRect(x, y, width, height);
      return;
    }
    case DisplayOpcode.FillColorRRect: {
      const x = reader.f32();
      const y = reader.f32();
      const width = reader.f32();
      const height = reader.f32();
      const topLeft = reader.f32();
      const topRight = reader.f32();
      const bottomRight = reader.f32();
      const bottomLeft = reader.f32();
      context.fillStyle = rgbaCss(reader.u32());
      context.beginPath();
      context.roundRect(x, y, width, height, [topLeft, topRight, bottomRight, bottomLeft]);
      context.fill();
      return;
    }
    case DisplayOpcode.FillColorShadow: {
      const x = reader.f32();
      const y = reader.f32();
      const width = reader.f32();
      const height = reader.f32();
      const radii = [reader.f32(), reader.f32(), reader.f32(), reader.f32()] as const;
      const offsetX = reader.f32();
      const offsetY = reader.f32();
      const blur = reader.f32();
      const color = rgbaCss(reader.u32());
      // Core already folded CSS spread into the rectangle and radii, so all
      // that is left is what Canvas2D does natively. The fill itself lands
      // under the node's own background; see apps/site/content/guide/style-support.md.
      context.save();
      context.shadowColor = color;
      context.shadowBlur = blur;
      context.shadowOffsetX = offsetX;
      context.shadowOffsetY = offsetY;
      context.fillStyle = color;
      context.beginPath();
      context.roundRect(x, y, width, height, [...radii]);
      context.fill();
      context.restore();
      return;
    }
    case DisplayOpcode.FillColorBorder: {
      const rect = [reader.f32(), reader.f32(), reader.f32(), reader.f32()] as const;
      const radii = [reader.f32(), reader.f32(), reader.f32(), reader.f32()] as const;
      const widths = [reader.f32(), reader.f32(), reader.f32(), reader.f32()] as const;
      const colors = [reader.u32(), reader.u32(), reader.u32(), reader.u32()] as const;
      drawColorBorder(context, rect, radii, widths, colors);
      return;
    }
    case DisplayOpcode.FillRRect: {
      const x = reader.f32();
      const y = reader.f32();
      const width = reader.f32();
      const height = reader.f32();
      const topLeft = reader.f32();
      const topRight = reader.f32();
      const bottomRight = reader.f32();
      const bottomLeft = reader.f32();
      context.fillStyle = required(resources.getPaint(reader.u32()), "paint");
      context.beginPath();
      context.roundRect(x, y, width, height, [topLeft, topRight, bottomRight, bottomLeft]);
      context.fill();
      return;
    }
    case DisplayOpcode.FillPath: {
      const path = required(resources.getPath(reader.u32()), "path");
      context.fillStyle = required(resources.getPaint(reader.u32()), "paint");
      context.fill(path);
      return;
    }
    case DisplayOpcode.FillColorPath: {
      const path = required(resources.getPath(reader.u32()), "path");
      context.fillStyle = rgbaCss(reader.u32());
      context.fill(path);
      return;
    }
    case DisplayOpcode.StrokeColorPath: {
      const path = required(resources.getPath(reader.u32()), "path");
      context.strokeStyle = rgbaCss(reader.u32());
      applyStrokeStyle(context, reader);
      context.stroke(path);
      return;
    }
    case DisplayOpcode.StrokePath: {
      const path = required(resources.getPath(reader.u32()), "path");
      context.strokeStyle = required(resources.getPaint(reader.u32()), "paint");
      context.lineWidth = reader.f32();
      context.lineCap = STROKE_CAPS[reader.u8()] ?? "butt";
      context.lineJoin = STROKE_JOINS[reader.u8()] ?? "miter";
      // Reserved halfword, read to advance rather than skipped by count.
      reader.u16();
      context.miterLimit = reader.f32();
      context.stroke(path);
      return;
    }
    case DisplayOpcode.DrawGlyphRun: {
      const fontId = reader.u32();
      const size = reader.f32();
      const x = reader.f32();
      const y = reader.f32();
      const glyphSpanId = reader.u32();
      resources.drawGlyphRun?.(context, fontId, size, x, y, glyphSpanId);
      return;
    }
    case DisplayOpcode.DrawTextFallback: {
      const text = required(resources.getText(reader.u32()), "text");
      const style = required(resources.getTextStyle(reader.u32()), "text style");
      const x = reader.f32();
      const y = reader.f32();
      drawFallbackText(context, text, style, x, y);
      return;
    }
    case DisplayOpcode.DrawTextInlineFallback: {
      const style = required(resources.getTextStyle(reader.u32()), "text style");
      const x = reader.f32();
      const y = reader.f32();
      const text = reader.utf8(reader.u32());
      drawFallbackText(context, text, style, x, y);
      return;
    }
    case DisplayOpcode.FillPlaceholder: {
      const x = reader.f32();
      const y = reader.f32();
      const width = reader.f32();
      const height = reader.f32();
      context.fillStyle = rgbaCss(reader.u32());
      context.fillRect(x, y, width, height);
      return;
    }
    case DisplayOpcode.DrawEditorDecoration: {
      const x = reader.f32();
      const y = reader.f32();
      const width = reader.f32();
      const height = reader.f32();
      context.fillStyle = rgbaCss(reader.u32());
      reader.u16();
      reader.u16();
      context.fillRect(x, y, width, height);
      return;
    }
    case DisplayOpcode.DrawImage: {
      const image = required(resources.getImage(reader.u32()), "image");
      const sourceX = reader.f32();
      const sourceY = reader.f32();
      const sourceWidth = reader.f32();
      const sourceHeight = reader.f32();
      const destinationX = reader.f32();
      const destinationY = reader.f32();
      const destinationWidth = reader.f32();
      const destinationHeight = reader.f32();
      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        destinationX,
        destinationY,
        destinationWidth,
        destinationHeight,
      );
      return;
    }
    case DisplayOpcode.DrawPicture: {
      const picture = required(resources.getPicture(reader.u32()), "picture");
      const x = reader.f32();
      const y = reader.f32();
      context.save();
      context.translate(x, y);
      try {
        replayList(context, picture, resources);
      } finally {
        context.restore();
      }
      return;
    }
    default:
      return assertNeverOpcode(opcode);
  }
}

/** Reads and checks the stroke tail without applying it. */
function validateStrokeStyle(reader: { f32(): number; u8(): number; u16(): number }): void {
  const width = reader.f32();
  if (!(width >= 0)) replayFail("stroke width is negative");
  const cap = reader.u8();
  const join = reader.u8();
  reader.u16();
  const miterLimit = reader.f32();
  if (cap > 2 || join > 2) replayFail("stroke cap or join is out of range");
  if (!(miterLimit >= 1)) replayFail("stroke miter limit is below one");
}

/** Applies the stroke tail to the context, in ABI field order. */
function applyStrokeStyle(
  context: Canvas2DContext,
  reader: { f32(): number; u8(): number; u16(): number },
): void {
  context.lineWidth = reader.f32();
  context.lineCap = STROKE_CAPS[reader.u8()] ?? "butt";
  context.lineJoin = STROKE_JOINS[reader.u8()] ?? "miter";
  // Reserved halfword, read to advance rather than skipped by count.
  reader.u16();
  context.miterLimit = reader.f32();
}

/** Cap and join codes in the order the ABI declares them. */
const STROKE_CAPS = ["butt", "round", "square"] as const;
const STROKE_JOINS = ["miter", "round", "bevel"] as const;

function rgbaCss(value: number): string {
  const red = (value >>> 24) & 0xff;
  const green = (value >>> 16) & 0xff;
  const blue = (value >>> 8) & 0xff;
  const alpha = value & 0xff;
  return `rgba(${String(red)}, ${String(green)}, ${String(blue)}, ${String(alpha / 255)})`;
}

function drawColorBorder(
  context: Canvas2DContext,
  rect: readonly [number, number, number, number],
  radii: readonly [number, number, number, number],
  widths: readonly [number, number, number, number],
  colors: readonly [number, number, number, number],
): void {
  const [x, y, width, height] = rect;
  const [top, right, bottom, left] = widths;
  const innerX = x + left;
  const innerY = y + top;
  const innerWidth = Math.max(0, width - left - right);
  const innerHeight = Math.max(0, height - top - bottom);
  const normalized = normalizeRadii(width, height, radii);
  const inner = [
    [Math.max(0, normalized[0] - left), Math.max(0, normalized[0] - top)],
    [Math.max(0, normalized[1] - right), Math.max(0, normalized[1] - top)],
    [Math.max(0, normalized[2] - right), Math.max(0, normalized[2] - bottom)],
    [Math.max(0, normalized[3] - left), Math.max(0, normalized[3] - bottom)],
  ] as const;
  const ring = (): void => {
    context.beginPath();
    roundedRectPath(context, x, y, width, height, normalized);
    if (innerWidth > 0 && innerHeight > 0) {
      roundedRectPath(context, innerX, innerY, innerWidth, innerHeight, inner);
    }
  };
  // One even-odd fill for the common uniform border: no wedge boundaries means
  // no antialiased seam along the corner diagonals.
  if (uniformBorder(widths, colors)) {
    if (top <= 0 || (colors[0] & 0xff) === 0) return;
    context.save();
    try {
      ring();
      context.fillStyle = rgbaCss(colors[0]);
      context.fill("evenodd");
    } finally {
      context.restore();
    }
    return;
  }
  const hinges = cornerHinges(width, height, widths, normalized);
  context.save();
  try {
    ring();
    context.clip("evenodd");
    // Each side owns the ring out to the diagonals through its two corner
    // hinges, and the wedges are unbounded outside the hinge quad so the clip
    // alone decides where the paint lands. Stopping them at the padding-box
    // corners instead -- which is correct only for a square corner -- left the
    // whole rounded part of the ring unpainted.
    for (let side = 0; side < 4; side += 1) {
      if ((widths[side] ?? 0) <= 0 || ((colors[side] ?? 0) & 0xff) === 0) continue;
      const near = hinges[side];
      const far = hinges[(side + 1) % 4];
      const normal = SIDE_NORMALS[side];
      const previous = SIDE_NORMALS[(side + 3) % 4];
      const next = SIDE_NORMALS[(side + 1) % 4];
      if (near === undefined || far === undefined) continue;
      if (normal === undefined || previous === undefined || next === undefined) continue;
      // Two antialiased wedges that merely abut leave the background showing
      // through a hairline along the diagonal. Each one reaches half a pixel
      // into its neighbour instead, so the later side covers the seam.
      const nearX = x + near[0] + (previous[0] - normal[0]) * SEAM_OVERLAP;
      const nearY = y + near[1] + (previous[1] - normal[1]) * SEAM_OVERLAP;
      const farX = x + far[0] + (next[0] - normal[0]) * SEAM_OVERLAP;
      const farY = y + far[1] + (next[1] - normal[1]) * SEAM_OVERLAP;
      context.fillStyle = rgbaCss(colors[side] ?? 0);
      context.beginPath();
      context.moveTo(nearX + near[2], nearY + near[3]);
      context.lineTo(farX + far[2], farY + far[3]);
      context.lineTo(farX, farY);
      context.lineTo(nearX, nearY);
      context.closePath();
      context.fill();
    }
  } finally {
    context.restore();
  }
}

/** Outward unit normal per border side, in top/right/bottom/left order. */
const SIDE_NORMALS = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
] as const;

/** How far each side wedge reaches past its corner diagonal, in logical pixels. */
const SEAM_OVERLAP = 0.5;

/** Whether every side of the border draws the same paint at the same width. */
function uniformBorder(
  widths: readonly [number, number, number, number],
  colors: readonly [number, number, number, number],
): boolean {
  return widths.every((width) => width === widths[0]) && colors.every((c) => c === colors[0]);
}

/**
 * Where the four side wedges meet, per corner, as `[x, y, farX, farY]` offsets
 * from the border box origin.
 *
 * The hinge is the padding-box corner for a square corner and the centre of the
 * corner circle for a rounded one, so the split between two sides runs radially
 * through both the outer and the inner arc. All four hinges sit inside the
 * padding box, which is why the wedges anchored to them cover the whole ring.
 */
function cornerHinges(
  width: number,
  height: number,
  widths: readonly [number, number, number, number],
  radii: readonly [number, number, number, number],
): readonly (readonly [number, number, number, number])[] {
  const [top, right, bottom, left] = widths;
  // Any point this far outside the border box is outside the clipped ring on
  // both axes, so the wedges behave as if they were unbounded.
  const far = width + height + 1;
  // Borders wider than the box would cross their opposite hinge and make the
  // wedges overlap; meeting them in proportion keeps the four disjoint.
  const [leftTop, rightTop] = meet(Math.max(left, radii[0]), Math.max(right, radii[1]), width);
  const [leftBottom, rightBottom] = meet(
    Math.max(left, radii[3]),
    Math.max(right, radii[2]),
    width,
  );
  const [topLeft, bottomLeft] = meet(Math.max(top, radii[0]), Math.max(bottom, radii[3]), height);
  const [topRight, bottomRight] = meet(Math.max(top, radii[1]), Math.max(bottom, radii[2]), height);
  return [
    [leftTop, topLeft, -far, -far],
    [width - rightTop, topRight, far, -far],
    [width - rightBottom, height - bottomRight, far, far],
    [leftBottom, height - bottomLeft, -far, far],
  ];
}

/** Scales two opposing inset lengths down until they fit inside `extent`. */
function meet(near: number, opposite: number, extent: number): readonly [number, number] {
  const total = near + opposite;
  if (total <= extent || total <= 0) return [near, opposite];
  const scale = Math.max(0, extent) / total;
  return [near * scale, opposite * scale];
}

function normalizeRadii(
  width: number,
  height: number,
  radii: readonly [number, number, number, number],
): readonly [number, number, number, number] {
  const [topLeft, topRight, bottomRight, bottomLeft] = radii;
  const ratio = (available: number, requested: number): number =>
    requested <= Number.EPSILON ? 1 : Math.min(1, available / requested);
  const scale = Math.min(
    1,
    ratio(width, topLeft + topRight),
    ratio(height, topRight + bottomRight),
    ratio(width, bottomLeft + bottomRight),
    ratio(height, topLeft + bottomLeft),
  );
  return [topLeft * scale, topRight * scale, bottomRight * scale, bottomLeft * scale];
}

function roundedRectPath(
  context: Canvas2DContext,
  x: number,
  y: number,
  width: number,
  height: number,
  radii:
    | readonly [number, number, number, number]
    | readonly [
        readonly [number, number],
        readonly [number, number],
        readonly [number, number],
        readonly [number, number],
      ],
): void {
  const pairs = radii.map((radius) =>
    typeof radius === "number" ? ([radius, radius] as const) : radius,
  );
  const [topLeft, topRight, bottomRight, bottomLeft] = pairs;
  context.moveTo(x + (topLeft?.[0] ?? 0), y);
  context.lineTo(x + width - (topRight?.[0] ?? 0), y);
  ellipseOrLine(
    context,
    x + width - (topRight?.[0] ?? 0),
    y + (topRight?.[1] ?? 0),
    topRight?.[0] ?? 0,
    topRight?.[1] ?? 0,
    -Math.PI / 2,
    0,
    x + width,
    y + (topRight?.[1] ?? 0),
  );
  context.lineTo(x + width, y + height - (bottomRight?.[1] ?? 0));
  ellipseOrLine(
    context,
    x + width - (bottomRight?.[0] ?? 0),
    y + height - (bottomRight?.[1] ?? 0),
    bottomRight?.[0] ?? 0,
    bottomRight?.[1] ?? 0,
    0,
    Math.PI / 2,
    x + width - (bottomRight?.[0] ?? 0),
    y + height,
  );
  context.lineTo(x + (bottomLeft?.[0] ?? 0), y + height);
  ellipseOrLine(
    context,
    x + (bottomLeft?.[0] ?? 0),
    y + height - (bottomLeft?.[1] ?? 0),
    bottomLeft?.[0] ?? 0,
    bottomLeft?.[1] ?? 0,
    Math.PI / 2,
    Math.PI,
    x,
    y + height - (bottomLeft?.[1] ?? 0),
  );
  context.lineTo(x, y + (topLeft?.[1] ?? 0));
  ellipseOrLine(
    context,
    x + (topLeft?.[0] ?? 0),
    y + (topLeft?.[1] ?? 0),
    topLeft?.[0] ?? 0,
    topLeft?.[1] ?? 0,
    Math.PI,
    (Math.PI * 3) / 2,
    x + (topLeft?.[0] ?? 0),
    y,
  );
  context.closePath();
}

function ellipseOrLine(
  context: Canvas2DContext,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  startAngle: number,
  endAngle: number,
  endX: number,
  endY: number,
): void {
  if (radiusX > 0 && radiusY > 0) {
    context.ellipse(centerX, centerY, radiusX, radiusY, 0, startAngle, endAngle);
  } else {
    context.lineTo(endX, endY);
  }
}

function required<T>(value: T | undefined, kind: string): T {
  if (value === undefined) replayFail(`referenced ${kind} resource is missing`);
  return value;
}

function drawFallbackText(
  context: Canvas2DContext,
  text: string,
  style: CanvasTextStyle,
  x: number,
  y: number,
): void {
  context.font = style.font;
  context.fillStyle = style.fillStyle;
  if (style.direction !== undefined) context.direction = style.direction;
  if (style.textAlign !== undefined) context.textAlign = style.textAlign;
  if (style.textBaseline !== undefined) context.textBaseline = style.textBaseline;
  if (style.justify === true && style.lineHeight !== undefined) {
    const lines = text.split("\n");
    for (let line = 0; line < lines.length; line += 1) {
      const value = lines[line] ?? "";
      if (line === lines.length - 1) {
        context.fillText(value, 0, y + line * style.lineHeight);
      } else {
        drawJustifiedLine(context, value, x, y + line * style.lineHeight);
      }
    }
    return;
  }
  if (style.lineHeight === undefined || !text.includes("\n")) {
    context.fillText(text, x, y);
    return;
  }
  let line = 0;
  let start = 0;
  for (let index = 0; index <= text.length; index += 1) {
    if (index !== text.length && text.charCodeAt(index) !== 0x0a) continue;
    context.fillText(text.slice(start, index), x, y + line * style.lineHeight);
    line += 1;
    start = index + 1;
  }
}

function drawJustifiedLine(context: Canvas2DContext, text: string, width: number, y: number): void {
  const words = text.trim().split(/\s+/u).filter(Boolean);
  if (words.length < 2) {
    context.fillText(text, 0, y);
    return;
  }
  const wordsWidth = words.reduce((total, word) => total + context.measureText(word).width, 0);
  const gap = Math.max(0, (width - wordsWidth) / (words.length - 1));
  let cursor = 0;
  for (const word of words) {
    context.fillText(word, cursor, y);
    cursor += context.measureText(word).width + gap;
  }
}

function replayFail(message: string): never {
  throw new Canvas2DReplayError(message);
}

function assertNeverOpcode(opcode: never): never {
  return replayFail(`unsupported display opcode ${String(opcode)}`);
}

/** Whether an opcode byte names a member this build knows. */
function isKnownOpcode<T extends Record<string, string | number>>(
  values: T,
  value: number,
): value is T[keyof T] & number {
  return typeof values[value] === "string";
}
