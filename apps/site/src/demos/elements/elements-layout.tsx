/** @jsxImportSource @dopejs/pingo */
import { Text, View, type PingoNode } from "@dopejs/pingo";
import { useTheme } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { row, stage } from "../../preview/layout";

type Hex = `#${string}`;

interface Palette {
  readonly text: Hex;
  readonly muted: Hex;
  readonly surface: Hex;
  readonly border: Hex;
  readonly accent: Hex;
  readonly accentSoft: Hex;
}

const LIGHT: Palette = {
  text: "#1f2329ff",
  muted: "#5b6472ff",
  surface: "#ffffffff",
  border: "#d7dce4ff",
  accent: "#3157dfff",
  accentSoft: "#e9edffff",
};

const DARK: Palette = {
  text: "#eef2fbff",
  muted: "#aeb8caff",
  surface: "#1a2231ff",
  border: "#2a3446ff",
  accent: "#8ba2ffff",
  accentSoft: "#222d55ff",
};

function Scene(props: { readonly width: number; readonly height: number }): PingoNode {
  const palette = useTheme() === "dark" ? DARK : LIGHT;
  const tile = (label: string): PingoNode => (
    <View
      width={72}
      height={48}
      backgroundColor={palette.accentSoft}
      style={{ borderRadius: 8, justifyContent: "center", alignItems: "center" }}
    >
      <Text value={label} fontSize={14} lineHeight={20} color={palette.accent} fontWeight={600} />
    </View>
  );
  return stage(props, [
    <View
      width={Math.min(420, props.width - 48)}
      backgroundColor={palette.surface}
      padding={16}
      style={{
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: palette.border,
        borderRadius: 10,
        flexDirection: "column",
      }}
    >
      {row([tile("甲"), tile("乙"), tile("丙")], 12)}
      <View height={12} />
      <Text
        value="View 是通用盒子：flexDirection / 对齐走 style 通道，间距用固定尺寸容器。"
        fontSize={12}
        lineHeight={18}
        color={palette.muted}
        width={Math.min(420, props.width - 48) - 32}
      />
    </View>,
  ]);
}

const demo: PreviewDemo = {
  height: 200,
  render: (context): PingoNode => <Scene width={context.width} height={context.height} />,
};

export default demo;
