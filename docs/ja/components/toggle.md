---
title: Toggle
description: 太字や斜体などの即時切り替えに使う、2状態を切り替えるボタンです。pingo キャンバス上に描画されます。
---

# Toggle

2状態を切り替えるボタンで、一度押すとオンを維持し、もう一度押すとオフになります。下のプレビューは pingo エンジンによってリアルタイムで描画されています。クリックで状態を切り替えられるほか、サイトのテーマに追従してライト/ダークが切り替わります。

:::preview toggle-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { Toggle } from "@dopejs/pingo-ui";

root.render(
  createElement(Toggle, {
    children: "加粗",
    defaultPressed: true,
    onPressedChange: (pressed) => console.log(pressed),
  }),
);
```

`Toggle` は内部で hooks により状態を保持するため、`createElement` を使ってコンポーネントとしてマウントする必要があります。`pressed` を渡すと制御モードになります。それ以外の場合は `defaultPressed` を使ってコンポーネント自身に状態を保持させます。

## 例

### 無効化

`disabled` を渡すと、ボタンはポインタとキーボードに反応しなくなり、Enter やスペースによるアクティブ化も受け付けなくなります。

## Props

| Prop              | 型                           | デフォルト値 | 説明                               |
| ----------------- | ---------------------------- | ------------ | ---------------------------------- |
| `children`        | `string`                     | —            | ボタンテキスト（必須）             |
| `pressed`         | `boolean`                    | —            | 制御された押下状態                 |
| `defaultPressed`  | `boolean`                    | `false`      | 非制御時の初期押下状態             |
| `onPressedChange` | `(pressed: boolean) => void` | —            | 状態切り替え時のコールバック       |
| `disabled`        | `boolean`                    | `false`      | 無効状態                           |
| `className`       | `string`                     | —            | コンポーネントのクラス名の後に追加 |

## アクセシビリティ

コンポーネントは button セマンティクスを備えており、状態に応じてセマンティクス値が `on` / `off` の間で切り替わります。ポインタで押下した際は自動的にフォーカスされ、`Enter` と `スペース` の両方でアクティブ化できます。
