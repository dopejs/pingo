import { describe, expect, it } from "vitest";

import { ABI_VERSION, DISPLAY_LIST_MAGIC, DisplayOpcode, STREAM_HEADER_BYTES } from "./generated";
import { decodeDisplayList } from "./display-list";

describe("DisplayList", () => {
  it("decodes the cross-language golden list", () => {
    const list = decodeDisplayList(
      fromHex(
        "444f504404001000440000000400000001000100040005000000000000000000000020440000f0431000060000008040000000410000c8420000a0410200000002000100",
      ),
    );
    expect(list.commands).toEqual([
      { type: "save" },
      { type: "clipRect", rect: [0, 0, 640, 480] },
      { type: "fillRect", rect: [4, 8, 100, 20], paintId: 2 },
      { type: "restore" },
    ]);
  });

  it("rejects unknown, truncated, and unbalanced streams", () => {
    const golden = fromHex(
      "444f504404001000440000000400000001000100040005000000000000000000000020440000f0431000060000008040000000410000c8420000a0410200000002000100",
    );
    const unknown = golden.slice();
    unknown[16] = 0xff;
    expect(() => decodeDisplayList(unknown)).toThrow(/unknown/u);
    expect(() => decodeDisplayList(golden.slice(0, -1))).toThrow(/aligned/u);

    const underflow = golden.slice();
    underflow[16] = 2;
    expect(() => decodeDisplayList(underflow)).toThrow(/underflows/u);
  });
  it("decodes the stroked and color path opcodes", () => {
    const list = decodeDisplayList(
      buildList([
        instruction(DisplayOpcode.FillColorPath, 8, (view) => {
          view.setUint32(4, 1, true);
          view.setUint32(8, 0x1122_33ff, true);
        }),
        instruction(DisplayOpcode.StrokePath, 20, (view) => {
          view.setUint32(4, 2, true);
          view.setUint32(8, 3, true);
          writeStrokeTail(view, 12, { width: 2, cap: 1, join: 2, miterLimit: 10 });
        }),
        instruction(DisplayOpcode.StrokeColorPath, 20, (view) => {
          view.setUint32(4, 4, true);
          view.setUint32(8, 0x4455_66ff, true);
          writeStrokeTail(view, 12, { width: 3, cap: 0, join: 1, miterLimit: 4 });
        }),
      ]),
    );
    expect(list.commands).toEqual([
      { type: "fillColorPath", pathId: 1, rgba: 0x1122_33ff },
      {
        type: "strokePath",
        pathId: 2,
        paintId: 3,
        stroke: { width: 2, cap: 1, join: 2, miterLimit: 10 },
      },
      {
        type: "strokeColorPath",
        pathId: 4,
        rgba: 0x4455_66ff,
        stroke: { width: 3, cap: 0, join: 1, miterLimit: 4 },
      },
    ]);
  });
});

function fromHex(hex: string): Uint8Array {
  return Uint8Array.from(hex.match(/../gu) ?? [], (byte) => Number.parseInt(byte, 16));
}

function buildList(instructions: readonly Uint8Array[]): Uint8Array {
  const body = instructions.reduce((total, instruction) => total + instruction.byteLength, 0);
  const stream = new Uint8Array(STREAM_HEADER_BYTES + body);
  const view = new DataView(stream.buffer);
  view.setUint32(0, DISPLAY_LIST_MAGIC, true);
  view.setUint16(4, ABI_VERSION, true);
  view.setUint16(6, STREAM_HEADER_BYTES, true);
  view.setUint32(8, stream.byteLength, true);
  view.setUint32(12, instructions.length, true);
  let offset = STREAM_HEADER_BYTES;
  for (const instruction of instructions) {
    stream.set(instruction, offset);
    offset += instruction.byteLength;
  }
  return stream;
}

function instruction(
  opcode: number,
  payloadBytes: number,
  write: (view: DataView) => void,
): Uint8Array {
  const frame = new Uint8Array(4 + payloadBytes);
  const view = new DataView(frame.buffer);
  view.setUint8(0, opcode);
  view.setUint16(2, (4 + payloadBytes) / 4, true);
  write(view);
  return frame;
}

function writeStrokeTail(
  view: DataView,
  offset: number,
  tail: {
    readonly width: number;
    readonly cap: number;
    readonly join: number;
    readonly miterLimit: number;
  },
): void {
  view.setFloat32(offset, tail.width, true);
  view.setUint8(offset + 4, tail.cap);
  view.setUint8(offset + 5, tail.join);
  view.setFloat32(offset + 8, tail.miterLimit, true);
}
