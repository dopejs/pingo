/** @jsxImportSource @dopejs/pingo */
import { createImage, Image, Text, View, type PingoNode } from "@dopejs/pingo";
import { useTheme } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { row, stage } from "../../preview/layout";

const SIZE = 96;

function gradientPixels(): Uint8Array {
  const pixels = new Uint8Array(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const offset = (y * SIZE + x) * 4;
      pixels[offset] = Math.round((x / (SIZE - 1)) * 255);
      pixels[offset + 1] = Math.round((y / (SIZE - 1)) * 180);
      pixels[offset + 2] = 220;
      pixels[offset + 3] = 255;
    }
  }
  return pixels;
}

// PingoImage 是不可变的 RGBA8 位图：创建一次，随处复用。
const GRADIENT = createImage(gradientPixels(), SIZE, SIZE, { label: "渐变色示例位图" });

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
  const item = (node: PingoNode, caption: string): PingoNode => (
    <View style={{ flexDirection: "column", alignItems: "center" }}>
      {node}
      <View height={6} />
      <Text value={caption} fontSize={12} lineHeight={16} color={palette.muted} />
    </View>
  );
  return stage(props, [
    <View
      backgroundColor={palette.surface}
      padding={16}
      style={{
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: palette.border,
        borderRadius: 10,
      }}
    >
      {row(
        [
          item(<Image source={GRADIENT} />, "原始尺寸 96×96"),
          item(<Image source={GRADIENT} width={48} height={48} />, "缩放进 48×48 的节点盒"),
          item(<Image source={GRADIENT} width={128} height={64} />, "拉伸到 128×64"),
        ],
        24,
      )}
    </View>,
  ]);
}

const demo: PreviewDemo = {
  height: 220,
  render: (context): PingoNode => <Scene width={context.width} height={context.height} />,
};

export default demo;
