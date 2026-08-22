import { createElement, Pressable, Text, TextArea, TextField, View, type EditTransaction, type PingoNode } from "@dopejs/pingo";
import { useTheme } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

let name = "张三";
let nameRevision = 1n;
let bio = "canvas 原生编辑，无任何 HTML 输入控件。";
let bioRevision = 1n;

function applyDelta(value: string, transaction: EditTransaction): string {
  const delta = transaction.delta;
  return delta === undefined
    ? value
    : value.slice(0, delta.range.start) + delta.text + value.slice(delta.range.end);
}

type Hex = `#${string}`;

interface Palette {
  readonly text: Hex;
  readonly onAccent: Hex;
  readonly muted: Hex;
  readonly surface: Hex;
  readonly field: Hex;
  readonly border: Hex;
  readonly accent: Hex;
  readonly danger: Hex;
}

const LIGHT: Palette = {
  text: "#1f2329ff",
  onAccent: "#ffffffff",
  muted: "#5b6472ff",
  surface: "#ffffffff",
  field: "#fbfcffff",
  border: "#c0c4ccff",
  accent: "#3157dfff",
  danger: "#d03050ff",
};

const DARK: Palette = {
  text: "#eef2fbff",
  onAccent: "#0d111bff",
  muted: "#aeb8caff",
  surface: "#1a2231ff",
  field: "#141a27ff",
  border: "#3a4356ff",
  accent: "#8ba2ffff",
  danger: "#ff8f86ff",
};

function Scene(props: { readonly width: number; readonly height: number }): PingoNode {
  const palette = useTheme() === "dark" ? DARK : LIGHT;
  const cardWidth = Math.min(420, props.width - 48);
  const fieldWidth = Math.min(340, props.width - 96);
  const label = (value: string): PingoNode =>
    createElement(Text, {
      value,
      fontSize: 12,
      lineHeight: 18,
      color: palette.muted,
      width: cardWidth - 32,
    });
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
        label("TextField：装饰过的单行编辑原语"),
        createElement(View, { height: 6 }),
        createElement(TextField, {
          value: name,
          revision: nameRevision,
          semanticLabel: "收件人",
          width: fieldWidth,
          color: palette.text,
          backgroundColor: palette.field,
          borderColor: palette.border,
          errorColor: palette.danger,
          onTransaction: (transaction: EditTransaction) => {
            name = applyDelta(name, transaction);
            nameRevision = transaction.revision;
          },
        }),
        createElement(View, { height: 12 }),
        label("TextArea：多行变体，Enter 换行而不触发 submit"),
        createElement(View, { height: 6 }),
        createElement(TextArea, {
          value: bio,
          revision: bioRevision,
          semanticLabel: "简介",
          rows: 2,
          width: fieldWidth,
          color: palette.text,
          backgroundColor: palette.field,
          borderColor: palette.border,
          errorColor: palette.danger,
          onTransaction: (transaction: EditTransaction) => {
            bio = applyDelta(bio, transaction);
            bioRevision = transaction.revision;
          },
        }),
        createElement(View, { height: 12 }),
        label("Pressable：可聚焦的激活表面，样式完全由 children 决定"),
        createElement(View, { height: 6 }),
        createElement(Pressable, {
          onPress: () => {},
          semanticLabel: "示例操作",
          children: createElement(View, {
            padding: [6, 14, 6, 14],
            backgroundColor: palette.accent,
            style: { borderRadius: 6 },
            children: createElement(Text, {
              value: "提交",
              fontSize: 13,
              lineHeight: 18,
              color: palette.onAccent,
              fontWeight: 600,
            }),
          }),
        }),
      ],
    }),
  ]);
}

const demo: PreviewDemo = {
  height: 320,
  render: (context): PingoNode =>
    createElement(Scene, { width: context.width, height: context.height }),
};

export default demo;
