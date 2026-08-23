import {
  createElement,
  createSvg,
  Svg,
  Text,
  View,
  type PingoNode,
  type PingoSvg,
} from "@dopejs/pingo";
import { useTheme } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { row, stage } from "../../preview/layout";

// 图标集子集：path / circle / rect / line 等形状元素，currentColor 解析为节点颜色。
const SEARCH_ICON = createSvg(
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">` +
    `<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>`,
);
const CHECK_ICON = createSvg(
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="M20 6 9 17l-5-5"/></svg>`,
);
const HEART_ICON = createSvg(
  `<svg viewBox="0 0 24 24" fill="currentColor">` +
    `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
);

type Hex = `#${string}`;

interface Palette {
  readonly muted: Hex;
  readonly surface: Hex;
  readonly border: Hex;
  readonly accent: Hex;
  readonly danger: Hex;
}

const LIGHT: Palette = {
  muted: "#5b6472ff",
  surface: "#ffffffff",
  border: "#d7dce4ff",
  accent: "#3157dfff",
  danger: "#d03050ff",
};

const DARK: Palette = {
  muted: "#aeb8caff",
  surface: "#1a2231ff",
  border: "#2a3446ff",
  accent: "#8ba2ffff",
  danger: "#ff8f86ff",
};

function Scene(props: { readonly width: number; readonly height: number }): PingoNode {
  const palette = useTheme() === "dark" ? DARK : LIGHT;
  const cardWidth = Math.min(400, props.width - 48);
  const icon = (source: PingoSvg, color: Hex, label: string): PingoNode =>
    createElement(Svg, {
      source,
      width: 28,
      height: 28,
      // currentColor 解析为 undefined，节点自己的 color 胜出——图标随主题换色。
      style: { color },
      semanticLabel: label,
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
            icon(SEARCH_ICON, palette.accent, "搜索"),
            icon(CHECK_ICON, palette.accent, "完成"),
            icon(HEART_ICON, palette.danger, "收藏"),
          ],
          20,
        ),
        createElement(View, { height: 10 }),
        createElement(Text, {
          value: "createSvg 解析图标集子集；每个形状展开为一个 path 节点",
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
