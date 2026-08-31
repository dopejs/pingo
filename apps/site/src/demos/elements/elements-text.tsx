/** @jsxImportSource @dopejs/pingo */
import { Text, View, type PingoNode } from "@dopejs/pingo";
import { useTheme } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

type Hex = `#${string}`;

interface Palette {
  readonly text: Hex;
  readonly muted: Hex;
  readonly surface: Hex;
  readonly border: Hex;
}

const LIGHT: Palette = {
  text: "#1f2329ff",
  muted: "#5b6472ff",
  surface: "#ffffffff",
  border: "#d7dce4ff",
};

const DARK: Palette = {
  text: "#eef2fbff",
  muted: "#aeb8caff",
  surface: "#1a2231ff",
  border: "#2a3446ff",
};

function Scene(props: { readonly width: number; readonly height: number }): PingoNode {
  const palette = useTheme() === "dark" ? DARK : LIGHT;
  const cardWidth = Math.min(460, props.width - 48);
  const textWidth = cardWidth - 32;
  const spacer = (): PingoNode => <View height={8} />;
  return stage(props, [
    <View
      width={cardWidth}
      backgroundColor={palette.surface}
      padding={[14, 16, 14, 16]}
      style={{
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: palette.border,
        borderRadius: 10,
        flexDirection: "column",
      }}
    >
      <Text
        value="标题：fontSize 24 / lineHeight 32"
        fontSize={24}
        lineHeight={32}
        fontWeight={700}
        color={palette.text}
        width={textWidth}
      />
      {spacer()}
      <Text
        value="正文：14/22。中英文混排与 emoji 🎨 的 shaping、换行与测量都由 Core 完成。"
        fontSize={14}
        lineHeight={22}
        color={palette.text}
        width={textWidth}
      />
      {spacer()}
      <Text
        value="辅助说明：12/18，muted 颜色。"
        fontSize={12}
        lineHeight={18}
        color={palette.muted}
        width={textWidth}
      />
    </View>,
  ]);
}

const demo: PreviewDemo = {
  height: 200,
  render: (context): PingoNode => <Scene width={context.width} height={context.height} />,
};

export default demo;
