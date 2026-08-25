---
title: Slider
description: 数値スライダー。ドラッグとキーボード微調整に対応し、pingo キャンバス上に描画されます。
---

# Slider

スライダーは、区間内の数値を選択するために使用します。下のプレビューは pingo エンジンによってリアルタイムに描画されます。スライダーをドラッグするか方向キーで微調整でき、サイトのテーマに合わせてライト/ダークが切り替わります。

:::preview slider-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { Slider } from "@dopejs/pingo-ui";

root.render(
  createElement(Slider, {
    defaultValue: 40,
    min: 0,
    max: 100,
    step: 1,
    semanticLabel: "音量",
    onValueChange: (value) => console.log(value),
  }),
);
```

`Slider` は内部で hooks によりドラッグ状態を保持するため、`createElement` でコンポーネントとしてマウントする必要があります。`value` を渡すと制御モードになります。それ以外の場合は `defaultValue` を使ってコンポーネント自身に状態を保持させます。

## 例

### 区間とステップ

`min` / `max` で値の範囲を制限し（デフォルトは 0–100）、`step` でキーボード微調整の粒度を決定します（デフォルトは 1）。

### 無効化

`disabled` を渡すと、スライダーはドラッグとキーボード操作に応答しなくなります。

## Props

| Prop            | 型                        | デフォルト値 | 説明                               |
| --------------- | ------------------------- | ------------ | ---------------------------------- |
| `value`         | `number`                  | —            | 制御された現在値                   |
| `defaultValue`  | `number`                  | `min`        | 非制御の初期値                     |
| `onValueChange` | `(value: number) => void` | —            | 値の変更時コールバック             |
| `min`           | `number`                  | `0`          | 最小値                             |
| `max`           | `number`                  | `100`        | 最大値                             |
| `step`          | `number`                  | `1`          | キーボード操作の刻み幅             |
| `disabled`      | `boolean`                 | `false`      | 無効状態                           |
| `semanticLabel` | `string`                  | —            | アクセシビリティ名                 |
| `className`     | `string`                  | —            | コンポーネントのクラス名の後に追加 |

## アクセシビリティ

コンポーネントは `slider` セマンティックロールを持ち、セマンティック値は現在の数値の文字列表現です。`←`/`↓` で `step` 分減らし、`→`/`↑` で `step` 分増やし、`Home`/`End` で区間の両端にジャンプします。値は常に `[min, max]` の範囲内にクランプされます。
