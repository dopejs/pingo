import {
  EDIT_TRANSACTIONS_MAGIC,
  EDIT_TRANSACTION_LAYOUTS,
  EditTransactionOpcode,
  INSTRUCTION_FLAG_MASK,
  INSTRUCTION_FLAG_OPTIONAL,
  INSTRUCTION_HEADER_BYTES,
  INSTRUCTION_LENGTH_ESCAPE,
  MINIMUM_READABLE_ABI_VERSION,
  MAX_EDIT_TRANSACTIONS_BYTES,
  MAX_EDIT_TRANSACTION_INSTRUCTIONS,
  MAX_EDIT_MAP_SEGMENTS,
  MAX_EDIT_MARK_RUNS,
  MAX_RESOURCE_BYTES,
  PROTOCOL_ALIGNMENT,
  STREAM_HEADER_BYTES,
  EDIT_MAP_SEGMENT_FLAG_KEPT,
} from "./generated";

const utf8Decoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });

export type EditAffinity = "downstream" | "upstream";
export type EditTransactionKind = "composition" | "edit" | "external" | "redo" | "undo";

export interface Utf16Range {
  readonly end: number;
  readonly start: number;
}

/** One styled span of an editing value. */
export interface EditMarkRun {
  /** UTF-16 code-unit length of the span. */
  readonly length: number;
  /** Text style resource identity; zero is the value's base style. */
  readonly style: number;
  /** Font resource identity; zero inherits the node's font. */
  readonly font: number;
}

/** One old-offset span of a position map and where it lands. */
export interface EditMapSegment {
  readonly oldStart: number;
  readonly oldEnd: number;
  readonly newStart: number;
  readonly newEnd: number;
  /** Whether the span survived offset for offset. */
  readonly kept: boolean;
}

/** Which edge a position collapses to when it falls inside replaced text. */
export type EditMapBias = "left" | "right";

/** One fully validated Core-owned editing transition. */
export interface EditTransaction {
  readonly nodeId: number;
  readonly baseRevision: bigint;
  readonly revision: bigint;
  readonly delta?: { readonly range: Utf16Range; readonly text: string };
  readonly selection: {
    readonly anchor: number;
    readonly anchorAffinity: EditAffinity;
    readonly focus: number;
    readonly focusAffinity: EditAffinity;
  };
  readonly composition?: Utf16Range;
  readonly kind: EditTransactionKind;
  /** Mark table after the transition, present only when it changed. */
  readonly marks?: readonly EditMarkRun[];
  /**
   * How base-revision offsets move into this revision.
   *
   * Core computes this table; the Shell only looks positions up in it, which
   * is what keeps a link range, a comment anchor, and a remote cursor from
   * each moving by a slightly different rule. Empty means nothing moved.
   */
  readonly map: readonly EditMapSegment[];
}

/**
 * Moves one base-revision offset into the revision a transaction produced.
 *
 * Boundaries are unambiguous and ignore the bias: an offset at the start of a
 * replaced span stays at the start, and one at its end lands after the
 * replacement. Only an offset strictly inside a replaced span, or one sitting
 * exactly where text was inserted, has to choose a side.
 */
export function mapEditOffset(
  map: readonly EditMapSegment[],
  offset: number,
  bias: EditMapBias = "left",
): number {
  const last = map.at(-1);
  if (last === undefined) return offset;
  const oldLength = last.oldEnd;
  const newLength = last.newEnd;
  const clamped = Math.min(offset, oldLength);
  // A pure insertion is a zero-width replaced span, and the kept span ending at
  // the same offset would otherwise answer for it and make the bias unreachable.
  const insertion = map.find(
    (segment) =>
      !segment.kept && segment.oldStart === segment.oldEnd && segment.oldStart === clamped,
  );
  if (insertion !== undefined) return bias === "left" ? insertion.newStart : insertion.newEnd;
  for (const segment of map) {
    if (clamped < segment.oldStart) break;
    if (clamped > segment.oldEnd) continue;
    if (segment.kept) return segment.newStart + (clamped - segment.oldStart);
    if (clamped === segment.oldStart) return segment.newStart;
    if (clamped === segment.oldEnd) return segment.newEnd;
    return bias === "left" ? segment.newStart : segment.newEnd;
  }
  return newLength;
}

/**
 * Moves a range, keeping it normalized and never inverted.
 *
 * The edges use outward bias, so a span that brackets an edit still brackets
 * its replacement instead of collapsing onto one side of it.
 */
export function mapEditRange(map: readonly EditMapSegment[], range: Utf16Range): Utf16Range {
  const start = mapEditOffset(map, range.start, "left");
  const end = mapEditOffset(map, range.end, "right");
  return { start, end: Math.max(start, end) };
}

export class EditTransactionDecodingError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "EditTransactionDecodingError";
  }
}

/** Validates an entire reverse batch before exposing any transaction. */
export function decodeEditTransactionBatch(input: Uint8Array): readonly EditTransaction[] {
  if (input.byteLength > MAX_EDIT_TRANSACTIONS_BYTES) fail("edit transaction stream is too large");
  if (input.byteLength % PROTOCOL_ALIGNMENT !== 0) fail("edit transaction stream is not aligned");
  const reader = new Reader(input);
  if (reader.u32() !== EDIT_TRANSACTIONS_MAGIC) fail("wrong edit transaction magic");
  // Newer producers stay readable through the self-describing instruction
  // framing; anything older than it cannot be stepped through safely.
  if (reader.u16() < MINIMUM_READABLE_ABI_VERSION) fail("unsupported edit transaction ABI version");
  if (reader.u16() !== STREAM_HEADER_BYTES) fail("invalid edit transaction header length");
  if (reader.u32() !== input.byteLength) fail("edit transaction length does not match input");
  const declared = reader.u32();
  if (declared > MAX_EDIT_TRANSACTION_INSTRUCTIONS) {
    fail("edit transaction instruction count exceeds limit");
  }
  if (declared > Math.floor(reader.remaining / EDIT_TRANSACTION_LAYOUTS[1].minimumBytes)) {
    fail("edit transaction instruction count cannot fit in input");
  }

  const transactions: EditTransaction[] = [];
  while (reader.remaining > 0) {
    const offset = reader.offset;
    const header = reader.instruction();
    if (header.opcode !== Number(EditTransactionOpcode.Transaction)) {
      // Skipping is the producer's call: an unmarked unknown instruction is
      // still fatal, because losing it could change what the stream means.
      if (!header.optional) fail("unknown edit transaction opcode");
      reader.seekTo(header.end);
      continue;
    }
    transactions.push(decodeTransaction(reader));
    const consumed = reader.offset - offset;
    if (
      consumed < EDIT_TRANSACTION_LAYOUTS[EditTransactionOpcode.Transaction].minimumBytes ||
      consumed % 4 !== 0
    ) {
      fail("edit transaction instruction has invalid length");
    }
    if (reader.offset !== header.end) fail("instruction length does not match its payload");
  }
  if (transactions.length !== declared) fail("edit transaction count does not match input");
  return transactions;
}

function decodeTransaction(reader: Reader): EditTransaction {
  const nodeId = reader.u32();
  const baseRevision = reader.u64();
  const revision = reader.u64();
  if (revision <= baseRevision) fail("edit transaction revision must increase");
  const deltaRange = range(reader.u32(), reader.u32(), "delta");
  const anchor = reader.u32();
  const focus = reader.u32();
  const compositionRange = range(reader.u32(), reader.u32(), "composition");
  const kind = transactionKind(reader.u8());
  const flags = reader.u8();
  if ((flags & ~7) !== 0) fail("edit transaction flags contain reserved bits");
  const anchorAffinity = affinity(reader.u8());
  const focusAffinity = affinity(reader.u8());
  const textLength = reader.u32();
  if (textLength > MAX_RESOURCE_BYTES) fail("edit transaction delta exceeds byte limit");
  const markCount = reader.u32();
  const mapCount = reader.u32();
  if (markCount > MAX_EDIT_MARK_RUNS || mapCount > MAX_EDIT_MAP_SEGMENTS) {
    fail("edit transaction payload exceeds its protocol budget");
  }
  const text = reader.utf8(textLength);
  const marks: EditMarkRun[] = [];
  for (let index = 0; index < markCount; index += 1) {
    marks.push({ length: reader.u32(), style: reader.u32(), font: reader.u32() });
  }
  const map: EditMapSegment[] = [];
  let cursor = 0;
  for (let index = 0; index < mapCount; index += 1) {
    const oldStart = reader.u32();
    const oldEnd = reader.u32();
    const newStart = reader.u32();
    const newEnd = reader.u32();
    const segmentFlags = reader.u32();
    if ((segmentFlags & ~EDIT_MAP_SEGMENT_FLAG_KEPT) !== 0) {
      fail("position map segment flags contain reserved bits");
    }
    if (oldStart !== cursor || oldEnd < oldStart || newEnd < newStart) {
      fail("position map segments are not ordered");
    }
    cursor = oldEnd;
    map.push({
      oldStart,
      oldEnd,
      newStart,
      newEnd,
      kept: (segmentFlags & EDIT_MAP_SEGMENT_FLAG_KEPT) !== 0,
    });
  }
  const hasDelta = (flags & 1) !== 0;
  const hasComposition = (flags & 2) !== 0;
  const hasMarks = (flags & 4) !== 0;
  if (!hasMarks && markCount !== 0) fail("absent mark table has a payload");
  if (!hasDelta && (text !== "" || deltaRange.start !== 0 || deltaRange.end !== 0)) {
    fail("absent edit delta has a payload");
  }
  if (!hasComposition && (compositionRange.start !== 0 || compositionRange.end !== 0)) {
    fail("absent composition has a range");
  }
  return {
    nodeId,
    baseRevision,
    revision,
    ...(hasDelta ? { delta: { range: deltaRange, text } } : {}),
    selection: { anchor, anchorAffinity, focus, focusAffinity },
    ...(hasComposition ? { composition: compositionRange } : {}),
    kind,
    ...(hasMarks ? { marks } : {}),
    map,
  };
}

function range(start: number, end: number, label: string): Utf16Range {
  if (start > end) fail(`${label} range is reversed`);
  return { start, end };
}

function affinity(value: number): EditAffinity {
  if (value === 0) return "upstream";
  if (value === 1) return "downstream";
  return fail("unknown edit affinity");
}

function transactionKind(value: number): EditTransactionKind {
  switch (value) {
    case 1:
      return "edit";
    case 2:
      return "composition";
    case 3:
      return "undo";
    case 4:
      return "redo";
    case 5:
      return "external";
    default:
      return fail("unknown edit transaction kind");
  }
}

class Reader {
  readonly #bytes: Uint8Array;
  readonly #view: DataView;
  #offset = 0;

  public constructor(bytes: Uint8Array) {
    this.#bytes = bytes;
    this.#view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }

  public get offset(): number {
    return this.#offset;
  }

  public get remaining(): number {
    return this.#bytes.byteLength - this.#offset;
  }

  /** Reads one instruction header, including where the instruction ends. */
  public instruction(): { opcode: number; optional: boolean; end: number } {
    const offset = this.#offset;
    if (offset % PROTOCOL_ALIGNMENT !== 0) fail("instruction is not aligned");
    this.require(INSTRUCTION_HEADER_BYTES);
    const opcode = this.u8();
    const flags = this.u8();
    if ((flags & ~INSTRUCTION_FLAG_MASK) !== 0) fail("unsupported instruction flags");
    const words = this.u16();
    const length = words === INSTRUCTION_LENGTH_ESCAPE ? this.u32() : words * PROTOCOL_ALIGNMENT;
    const end = offset + length;
    if (length < INSTRUCTION_HEADER_BYTES || length % PROTOCOL_ALIGNMENT !== 0) {
      fail("instruction length is invalid");
    }
    if (end > this.#bytes.byteLength) fail("instruction length runs past the stream");
    return { opcode, optional: (flags & INSTRUCTION_FLAG_OPTIONAL) !== 0, end };
  }

  /** Moves the cursor forward to an instruction boundary. */
  public seekTo(offset: number): void {
    if (offset < this.#offset || offset > this.#bytes.byteLength) fail("invalid instruction skip");
    this.#offset = offset;
  }

  public u8(): number {
    this.require(1);
    return this.#view.getUint8(this.#offset++);
  }

  public u16(): number {
    this.require(2);
    const value = this.#view.getUint16(this.#offset, true);
    this.#offset += 2;
    return value;
  }

  public u32(): number {
    this.require(4);
    const value = this.#view.getUint32(this.#offset, true);
    this.#offset += 4;
    return value;
  }

  public u64(): bigint {
    return BigInt(this.u32()) | (BigInt(this.u32()) << 32n);
  }

  public utf8(length: number): string {
    this.require(length);
    const start = this.#offset;
    this.#offset += length;
    let result: string;
    try {
      result = utf8Decoder.decode(this.#bytes.subarray(start, this.#offset));
    } catch {
      return fail("edit transaction delta is not UTF-8");
    }
    const padding = (PROTOCOL_ALIGNMENT - (length % PROTOCOL_ALIGNMENT)) % PROTOCOL_ALIGNMENT;
    this.require(padding);
    for (let index = 0; index < padding; index += 1) {
      if (this.#bytes[this.#offset++] !== 0) fail("edit transaction padding must be zero");
    }
    return result;
  }

  private require(length: number): void {
    if (!Number.isSafeInteger(length) || length < 0 || length > this.remaining) {
      fail("truncated edit transaction stream");
    }
  }
}

function fail(message: string): never {
  throw new EditTransactionDecodingError(message);
}
