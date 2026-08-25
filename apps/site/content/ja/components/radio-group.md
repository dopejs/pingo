---
title: Radio Group
description: 単一選択のオプショングループ。矢印キーナビゲーション対応。pingo canvas 上にレンダリング。
---

# Radio Group

ラジオグループは、相互に排他的な選択肢のセットから 1 つを選ぶために使います。下のプレビューは pingo
エンジンによるリアルタイムレンダリングです。選択肢をクリックするか矢印キーで選択を移動でき、サイトの
テーマに合わせて明暗が切り替わります。

:::preview radio-group-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { RadioGroup, RadioGroupItem } from "@dopejs/pingo-ui";

root.render(
  createElement(RadioGroup, {
    defaultValue: "b",
    onValueChange: (value) => console.log(value),
    children: [
      createElement(RadioGroupItem, { value: "a", label: "選択肢 A" }),
      createElement(RadioGroupItem, { value: "b", label: "選択肢 B" }),
      createElement(RadioGroupItem, { value: "c", label: "選択肢 C" }),
    ],
  }),
);
```

`RadioGroup` はコンテキスト経由で現在の値を `RadioGroupItem` に配信するため、両方とも `createElement` で
コンポーネントとしてマウントする必要があります。`value` を渡すと制御モードになり、それ以外では
`defaultValue` でコンポーネントが状態を自己管理します。

## 例

### 無効化

`RadioGroup` に `disabled` を渡すとグループ全体が無効になり、各項目のセマンティック値が `disabled` に
なります。

## Props

### RadioGroup

| Prop            | 型                        | デフォルト | 説明                                 |
| --------------- | ------------------------- | ---------- | ------------------------------------ |
| `value`         | `string`                  | —          | 制御された選択値                     |
| `defaultValue`  | `string`                  | —          | 非制御の初期選択値                   |
| `onValueChange` | `(value: string) => void` | —          | 選択変更時のコールバック             |
| `disabled`      | `boolean`                 | `false`    | グループ全体を無効化                 |
| `children`      | `PingoNode`               | —          | `RadioGroupItem` のリスト（必須）    |
| `className`     | `string`                  | —          | コンポーネントのクラス名に追加される |

### RadioGroupItem

| Prop        | 型       | デフォルト | 説明                                 |
| ----------- | -------- | ---------- | ------------------------------------ |
| `value`     | `string` | —          | 選択肢の値（必須）                   |
| `label`     | `string` | —          | 選択肢のテキスト                     |
| `className` | `string` | —          | コンポーネントのクラス名に追加される |

## アクセシビリティ

グループコンテナは `radiogroup` セマンティクスを、各項目は `radio` セマンティクスを持ち、`checked` /
`unchecked` / `disabled` の間で切り替わります。WAI-ARIA に従い、ラジオグループはレイアウト方向に関わらず
両方の矢印キーで選択を移動でき、フォーカスも同期します。
