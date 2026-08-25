---
title: Checkbox
description: 制御されたチェックボックス。テキストラベル付き可。pingo canvas 上にレンダリング。
---

# Checkbox

チェックボックスは独立したブール値の切り替えに使います。下のプレビューは pingo エンジンによる
リアルタイムレンダリングで、サイトのテーマに合わせて明暗が切り替わります。Checkbox は制御
コンポーネントです。プレビューでは静的なオン/オフ/無効の組み合わせを表示しており、インタラクションは
呼び出し側が保持する状態によって駆動されます。

:::preview checkbox-basic
:::

## 使い方

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { Checkbox } from "@dopejs/pingo-ui";

// useSignal はフックなので、コンポーネントスコープ内で実行する必要があります。
function NotificationSetting(): PingoNode {
  const enabled = useSignal(false);
  return createElement(Checkbox, {
    checked: enabled.get(),
    label: "通知が有効",
    onCheckedChange: (next) => enabled.set(next),
  });
}

root.render(createElement(NotificationSetting));
```

`checked` は親コンポーネントが保持し、`onCheckedChange` がそれを更新します。コンポーネント自身は状態を
持ちません。`label` はオプションで、指定するとチェックボックスの右側にテキストがレンダリングされます。

## 例

### 無効化

`disabled` を渡すと、チェックボックスはポインタにもキーボードにも反応しなくなり、セマンティック値が
`disabled` になります。

## Props

| Prop              | 型                           | デフォルト | 説明                                 |
| ----------------- | ---------------------------- | ---------- | ------------------------------------ |
| `checked`         | `boolean`                    | —          | チェック状態（必須、制御）           |
| `onCheckedChange` | `(checked: boolean) => void` | —          | 状態切り替え時のコールバック         |
| `disabled`        | `boolean`                    | `false`    | 無効状態                             |
| `label`           | `string`                     | —          | チェックボックス右側のテキストラベル |
| `className`       | `string`                     | —          | コンポーネントのクラス名に追加される |
| `semanticLabel`   | `string`                     | —          | アクセシブル名                       |

## アクセシビリティ

コンポーネントは `checkbox` セマンティックロールを持ち、セマンティック値は状態に応じて `checked` /
`unchecked` / `disabled` の間で切り替わります。ポインタを押すと自動的にフォーカスされます。✓ インジケーターは
フォントグリフのカバレッジに依存しており、アイコンアセットが整うまでのプレースホルダー実装です。
