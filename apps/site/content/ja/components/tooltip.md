---
title: Tooltip
description: ホバー時に表示される短い説明テキストで、対象要素の上にアンカーされます。
---

# Tooltip

Tooltip は、ポインターがホバーした際に短い説明テキストを表示し、デフォルトでは対象の上にアンカーされます。以下のプレビューは pingo エンジンによってリアルタイムにレンダリングされています。ボタンにポインターを重ねるとバブルが表示され、サイトのテーマに合わせて明暗が切り替わります。

:::preview tooltip-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { Button, Tooltip } from "@dopejs/pingo-ui";

root.render(
  createElement(Tooltip, {
    content: "保存到云端",
    children: createElement(Button, { children: "保存", onPress: () => save() }),
  }),
);
```

Tooltip はポインターの出入り（`pointerenter` / `pointerleave`）によって駆動され、制御用 props はありません。静的レンダリング時にはトリガー要素のみが表示され、バブルはホバー時に出現します。

## Props

| Prop        | 型          | デフォルト値 | 説明                                 |
| ----------- | ----------- | ------------ | ------------------------------------ |
| `content`   | `string`    | —            | バブルのテキスト（必須）             |
| `children`  | `PingoNode` | —            | トリガー要素（必須）                 |
| `className` | `string`    | —            | アンカーコンテナのクラス名の後に追加 |

## アクセシビリティ

バブルは tooltip セマンティクスを備えています。Tooltip はホバー時のみ表示され、キーボードフォーカスには反応しません。重要な情報は Tooltip だけに配置しないでください。
