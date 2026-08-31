---
title: Switch
description: 即時に反映されるブール設定のための制御されたスイッチコントロール。pingo キャンバス上に描画されます。
---

# Switch

スイッチは即時に反映されるブール設定に使用します。以下のプレビューは pingo エンジンによってリアルタイムに描画され、サイトのテーマに応じてライト/ダークが切り替わります。Switch は制御コンポーネントです。プレビューでは静的なオン/オフ/無効の組み合わせを示し、インタラクションは呼び出し側が保持する状態によって駆動されます。

:::preview switch-basic
:::

## 使い方

```tsx
import { useSignal, type PingoNode } from "@dopejs/pingo";
import { Switch } from "@dopejs/pingo-ui";

// useSignal はフックであり、コンポーネントスコープ内で実行する必要があります。
function AirplaneMode(): PingoNode {
  const on = useSignal(false);
  return (
    <Switch
      checked={on.get()}
      semanticLabel="機内モード"
      onCheckedChange={(next) => on.set(next)}
    />
  );
}

root.render(<AirplaneMode />);
```

`checked` は親コンポーネントが保持し、`onCheckedChange` がそれを更新します。コンポーネント自体は状態を保存しません。

## 例

### 無効化

`disabled` を渡すと、スイッチはポインタとキーボードに応答しなくなり、セマンティック値は `disabled` になります。

## Props

| Prop              | 型                           | デフォルト値 | 説明                               |
| ----------------- | ---------------------------- | ------------ | ---------------------------------- |
| `checked`         | `boolean`                    | —            | スイッチの状態（必須、制御）       |
| `onCheckedChange` | `(checked: boolean) => void` | —            | 状態変更時のコールバック           |
| `disabled`        | `boolean`                    | `false`      | 無効状態                           |
| `className`       | `string`                     | —            | コンポーネントのクラス名の後に追加 |
| `semanticLabel`   | `string`                     | —            | アクセシビリティ名                 |

## アクセシビリティ

コンポーネントは `switch` セマンティックロールを持ち、セマンティック値は状態に応じて `on` / `off` / `disabled` を切り替えます。ポインタを押下すると自動的にフォーカスされます。スイッチには可視テキストがないため、常に `semanticLabel` を指定してください。
