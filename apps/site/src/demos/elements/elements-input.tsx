/** @jsxImportSource @dopejs/pingo */
import { Input, Text, View, type EditTransaction, type PingoNode } from "@dopejs/pingo";
import { useTheme } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

// 受控编辑的 Shell 侧状态：Core 立即应用输入并反向发出版本化事务，
// Shell 在这里确认；过期 revision 永远不会覆盖更新的 Core 输入。
let remark = "点击这里输入：试试 IME、拖选与 Ctrl+Z";
let remarkRevision = 1n;
let secret = "hunter2";
let secretRevision = 1n;

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
  const cardWidth = Math.min(420, props.width - 48);
  const fieldWidth = Math.min(360, props.width - 96);
  const fieldStyle = {
    borderWidth: 1,
    borderStyle: "solid" as const,
    borderColor: palette.border,
    borderRadius: 6,
  };
  const label = (value: string): PingoNode => (
    <Text
      value={value}
      fontSize={12}
      lineHeight={18}
      color={palette.muted}
      width={cardWidth - 32}
    />
  );
  return stage(props, [
    <View
      width={cardWidth}
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
      {label("单行输入（受控 value + revision）")}
      <View height={6} />
      <Input
        value={remark}
        revision={remarkRevision}
        semanticLabel="备注"
        width={fieldWidth}
        fontSize={14}
        lineHeight={20}
        color={palette.text}
        backgroundColor={palette.field}
        padding={[6, 10, 6, 10]}
        style={fieldStyle}
        onTransaction={(transaction: EditTransaction) => {
          remark = applyDelta(remark, transaction);
          remarkRevision = transaction.revision;
        }}
      />
      <View height={14} />
      {label("密码：Core 只输出遮罩字形，明文不进 DisplayList")}
      <View height={6} />
      <Input
        value={secret}
        revision={secretRevision}
        password
        semanticLabel="密码"
        width={fieldWidth}
        fontSize={14}
        lineHeight={20}
        color={palette.text}
        backgroundColor={palette.field}
        padding={[6, 10, 6, 10]}
        style={fieldStyle}
        onTransaction={(transaction: EditTransaction) => {
          secret = applyDelta(secret, transaction);
          secretRevision = transaction.revision;
        }}
      />
    </View>,
  ]);
}

const demo: PreviewDemo = {
  height: 230,
  render: (context): PingoNode => <Scene width={context.width} height={context.height} />,
};

export default demo;
