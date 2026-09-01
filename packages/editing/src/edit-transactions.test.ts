import { describe, expect, it } from "vitest";

import { ABI_VERSION, EDIT_TRANSACTIONS_MAGIC, STREAM_HEADER_BYTES } from "./generated";
import { decodeEditTransactionBatch, mapEditOffset, mapEditRange } from "./edit-transactions";

describe("Edit Transaction Stream", () => {
  it("decodes exact u64 revisions, unicode delta, selection, and composition", () => {
    const bytes = transactionStream({
      nodeId: 7,
      baseRevision: 0x1234_5678_9abc_def0n,
      revision: 0x1234_5678_9abc_def1n,
      delta: { start: 1, end: 2, text: "你🙂" },
      selection: [4, 4],
      composition: [1, 4],
      kind: 2,
      affinities: [0, 1],
      marks: [
        [1, 0, 0],
        [3, 12, 5],
      ],
      map: [
        [0, 1, 0, 1, 1],
        [1, 2, 1, 4, 0],
      ],
    });

    expect(decodeEditTransactionBatch(bytes)).toEqual([
      {
        nodeId: 7,
        baseRevision: 0x1234_5678_9abc_def0n,
        revision: 0x1234_5678_9abc_def1n,
        delta: { range: { start: 1, end: 2 }, text: "你🙂" },
        selection: {
          anchor: 4,
          anchorAffinity: "upstream",
          focus: 4,
          focusAffinity: "downstream",
        },
        composition: { start: 1, end: 4 },
        kind: "composition",
        marks: [
          { length: 1, style: 0, font: 0 },
          { length: 3, style: 12, font: 5 },
        ],
        map: [
          { oldStart: 0, oldEnd: 1, newStart: 0, newEnd: 1, kept: true },
          { oldStart: 1, oldEnd: 2, newStart: 1, newEnd: 4, kept: false },
        ],
      },
    ]);
  });

  it("moves offsets by looking them up in the Core-produced map", () => {
    // "abcdef" with "cd" replaced by "XYZ".
    const map = [
      { oldStart: 0, oldEnd: 2, newStart: 0, newEnd: 2, kept: true },
      { oldStart: 2, oldEnd: 4, newStart: 2, newEnd: 5, kept: false },
      { oldStart: 4, oldEnd: 6, newStart: 5, newEnd: 7, kept: true },
    ];
    expect(mapEditOffset(map, 0)).toBe(0);
    expect(mapEditOffset(map, 6)).toBe(7);
    // Both edges of a replaced span are unambiguous and ignore the bias.
    expect(mapEditOffset(map, 2, "right")).toBe(2);
    expect(mapEditOffset(map, 4, "left")).toBe(5);
    // Only the interior has to choose a side.
    expect(mapEditOffset(map, 3, "left")).toBe(2);
    expect(mapEditOffset(map, 3, "right")).toBe(5);
    // A span bracketing the edit still brackets its replacement.
    expect(mapEditRange(map, { start: 1, end: 5 })).toEqual({ start: 1, end: 6 });
    // A stale anchor clamps rather than disappearing.
    expect(mapEditOffset(map, 99)).toBe(7);
    // An empty table is the identity.
    expect(mapEditOffset([], 4)).toBe(4);

    // A pure insertion is the one boundary where the bias decides, because a
    // range that ends exactly there grows to contain what was typed.
    const insertion = [
      { oldStart: 0, oldEnd: 3, newStart: 0, newEnd: 3, kept: true },
      { oldStart: 3, oldEnd: 3, newStart: 3, newEnd: 5, kept: false },
      { oldStart: 3, oldEnd: 6, newStart: 5, newEnd: 8, kept: true },
    ];
    expect(mapEditOffset(insertion, 3, "left")).toBe(3);
    expect(mapEditOffset(insertion, 3, "right")).toBe(5);
    expect(mapEditRange(insertion, { start: 1, end: 3 })).toEqual({ start: 1, end: 5 });
  });

  it("rejects malformed UTF-8, reserved flags, and non-canonical absence payloads", () => {
    const canonical = transactionStream({
      nodeId: 1,
      baseRevision: 0n,
      revision: 1n,
      delta: { start: 0, end: 0, text: "a" },
      selection: [1, 1],
      kind: 1,
      affinities: [1, 1],
    });
    const invalidUtf8 = canonical.slice();
    invalidUtf8[80] = 0xff;
    expect(() => decodeEditTransactionBatch(invalidUtf8)).toThrow(/UTF-8/u);

    const reservedFlags = canonical.slice();
    reservedFlags[65] = 0x80;
    expect(() => decodeEditTransactionBatch(reservedFlags)).toThrow(/reserved/u);

    const absentDelta = canonical.slice();
    absentDelta[65] = 0;
    expect(() => decodeEditTransactionBatch(absentDelta)).toThrow(/absent edit delta/u);
  });
});

interface Fixture {
  readonly nodeId: number;
  readonly baseRevision: bigint;
  readonly revision: bigint;
  readonly delta?: { readonly start: number; readonly end: number; readonly text: string };
  readonly selection: readonly [number, number];
  readonly composition?: readonly [number, number];
  readonly kind: number;
  readonly affinities: readonly [number, number];
  /** `[length, style, font]` per span. */
  readonly marks?: readonly (readonly [number, number, number])[];
  /** `[oldStart, oldEnd, newStart, newEnd, flags]` per segment. */
  readonly map?: readonly (readonly [number, number, number, number, number])[];
}

function transactionStream(fixture: Fixture): Uint8Array {
  const text = new TextEncoder().encode(fixture.delta?.text ?? "");
  const padding = (4 - (text.byteLength % 4)) % 4;
  const marks = fixture.marks ?? [];
  const map = fixture.map ?? [];
  const bytes = new Uint8Array(
    80 + text.byteLength + padding + marks.length * 12 + map.length * 20,
  );
  const view = new DataView(bytes.buffer);
  view.setUint32(0, EDIT_TRANSACTIONS_MAGIC, true);
  view.setUint16(4, ABI_VERSION, true);
  view.setUint16(6, STREAM_HEADER_BYTES, true);
  view.setUint32(8, bytes.byteLength, true);
  view.setUint32(12, 1, true);
  bytes[16] = 1;
  // Instruction length in four-byte words, covering the header and payload.
  view.setUint16(18, (bytes.byteLength - 16) / 4, true);
  view.setUint32(20, fixture.nodeId, true);
  writeU64(view, 24, fixture.baseRevision);
  writeU64(view, 32, fixture.revision);
  view.setUint32(40, fixture.delta?.start ?? 0, true);
  view.setUint32(44, fixture.delta?.end ?? 0, true);
  view.setUint32(48, fixture.selection[0], true);
  view.setUint32(52, fixture.selection[1], true);
  view.setUint32(56, fixture.composition?.[0] ?? 0, true);
  view.setUint32(60, fixture.composition?.[1] ?? 0, true);
  bytes[64] = fixture.kind;
  bytes[65] =
    (fixture.delta === undefined ? 0 : 1) |
    (fixture.composition === undefined ? 0 : 2) |
    (fixture.marks === undefined ? 0 : 4);
  bytes[66] = fixture.affinities[0];
  bytes[67] = fixture.affinities[1];
  view.setUint32(68, text.byteLength, true);
  view.setUint32(72, marks.length, true);
  view.setUint32(76, map.length, true);
  bytes.set(text, 80);
  let cursor = 80 + text.byteLength + padding;
  for (const run of marks) {
    view.setUint32(cursor, run[0], true);
    view.setUint32(cursor + 4, run[1], true);
    view.setUint32(cursor + 8, run[2], true);
    cursor += 12;
  }
  for (const segment of map) {
    view.setUint32(cursor, segment[0], true);
    view.setUint32(cursor + 4, segment[1], true);
    view.setUint32(cursor + 8, segment[2], true);
    view.setUint32(cursor + 12, segment[3], true);
    view.setUint32(cursor + 16, segment[4], true);
    cursor += 20;
  }
  return bytes;
}

function writeU64(view: DataView, offset: number, value: bigint): void {
  view.setUint32(offset, Number(value & 0xffff_ffffn), true);
  view.setUint32(offset + 4, Number(value >> 32n), true);
}
