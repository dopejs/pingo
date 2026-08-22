import { createElement, Text, UnstyledTextArea, View, type EditTransaction, type PingoNode } from "@dopejs/pingo";
import { useTheme } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

let notes = "多行编辑：\nEnter 换行，上下方向键跨行移动时保持期望列（desired-x）。\n撤销重做、剪贴板与 IME composition 都由 Core 实现。";
let notesRevision = 1n;

function applyDelta(value: string, transaction: EditTransaction): string {
  const delta = transaction.delta;
  return delta === undefined
    ? value
    : value.slice(0, delta.range.start) + delta.text + value.slice(delta.range.end);
}

type Hex = `#${string}`;

interface Palette {
  readonly text: Hex;
  readonly muted: Hex;
  readonly surface: Hex;
  readonly field: Hex;
  readonly border: Hex;
}

const LIGHT: Palette = {
  text: "#1f2329ff",
  muted: "#5b6472ff",
  surface: "#ffffffff",
  field: "#fbfcffff",
  border: "#c0c4ccff",
};

const DARK: Palette = {
  text: "#eef2fbff",
  muted: "#aeb8caff",
  surface: "#1a2231ff",
  field: "#141a27ff",
  border: "#3a4356ff",
};

function Scene(props: { readonly width: number; readonly height: number }): PingoNode {
  const palette = useTheme() === "dark" ? DARK : LIGHT;
  const cardWidth = Math.min(440, props.width - 48);
  return stage(props, [
    createElement(View, {
      width: cardWidth,
      backgroundColor: palette.surface,
      padding: 16,
      style: {
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: palette.border,
        borderRadius: 10,
        flexDirection: "column",
      },
      children: [
        createElement(Text, {
          value: "UnstyledTextArea：无装饰的多行原语，外观完全由你给的样式决定",
          fontSize: 12,
          lineHeight: 18,
          color: palette.muted,
          width: cardWidth - 32,
        }),
        createElement(View, { height: 8 }),
        createElement(UnstyledTextArea, {
          value: notes,
          revision: notesRevision,
          semanticLabel: "多行说明",
          width: Math.min(380, props.width - 96),
          height: 88,
          fontSize: 14,
          lineHeight: 22,
          color: palette.text,
          backgroundColor: palette.field,
          padding: [8, 10, 8, 10],
          style: {
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: palette.border,
            borderRadius: 6,
          },
          onTransaction: (transaction: EditTransaction) => {
            notes = applyDelta(notes, transaction);
            notesRevision = transaction.revision;
          },
        }),
      ],
    }),
  ]);
}

const demo: PreviewDemo = {
  height: 240,
  render: (context): PingoNode =>
    createElement(Scene, { width: context.width, height: context.height }),
};

export default demo;
