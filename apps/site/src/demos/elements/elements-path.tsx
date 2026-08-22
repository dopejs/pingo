import { createElement, Path, Text, View, type PingoNode } from "@dopejs/pingo";
import { useTheme } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { row, stage } from "../../preview/layout";

const HEART =
  "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z";
const STAR =
  "M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8-6.1-3.5-6.1 3.5 1.4-6.8L2.2 9.1l6.9-.8z";
const VIEW_BOX = [0, 0, 24, 24] as const;

type Hex = `#${string}`;

interface Palette {
  readonly muted: Hex;
  readonly surface: Hex;
  readonly border: Hex;
  readonly accent: Hex;
  readonly danger: Hex;
  readonly warn: Hex;
}

const LIGHT: Palette = {
  muted: "#5b6472ff",
  surface: "#ffffffff",
  border: "#d7dce4ff",
  accent: "#3157dfff",
  danger: "#d03050ff",
  warn: "#b7770dff",
};

const DARK: Palette = {
  muted: "#aeb8caff",
  surface: "#1a2231ff",
  border: "#2a3446ff",
  accent: "#8ba2ffff",
  danger: "#ff8f86ff",
  warn: "#f2c14eff",
};

function Scene(props: { readonly width: number; readonly height: number }): PingoNode {
  const palette = useTheme() === "dark" ? DARK : LIGHT;
  const cardWidth = Math.min(400, props.width - 48);
  // Path 画在节点自己的 color 里：用祖先的 style.color 让它像文字一样继承颜色。
  const outline = (d: string, color: Hex, strokeWidth?: number): PingoNode =>
    createElement(View, {
      style: { color },
      children: createElement(Path, {
        d,
        viewBox: VIEW_BOX,
        width: 32,
        height: 32,
        ...(strokeWidth === undefined ? {} : { strokeWidth }),
      }),
    });
  return stage(props, [
    createElement(View, {
      width: cardWidth,
      backgroundColor: palette.surface,
      padding: [14, 20, 14, 20],
      style: {
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: palette.border,
        borderRadius: 10,
        flexDirection: "column",
        alignItems: "center",
      },
      children: [
        row(
          [
            outline(HEART, palette.danger),
            outline(HEART, palette.accent, 2),
            outline(STAR, palette.warn),
          ],
          20,
        ),
        createElement(View, { height: 10 }),
        createElement(Text, {
          value: "Path：一条 d 一个节点，填充或描边；viewBox 缩放进节点盒",
          fontSize: 12,
          lineHeight: 18,
          color: palette.muted,
          width: cardWidth - 40,
        }),
      ],
    }),
  ]);
}

const demo: PreviewDemo = {
  height: 180,
  render: (context): PingoNode =>
    createElement(Scene, { width: context.width, height: context.height }),
};

export default demo;
