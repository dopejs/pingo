---
title: Collapsible
description: 単一の展開・折りたたみ可能なコンテンツ領域。pingo canvas 上にレンダリング。
---

# Collapsible

Collapsible は Accordion の単一項目プリミティブです。1 つのトリガーが 1 つのコンテンツの展開と折りたたみを
制御し、折りたたみ領域が 1 つだけ必要な場面に適しています。下のプレビューは pingo エンジンによる
リアルタイムレンダリングです。トリガーをクリックして切り替えられます。

:::preview collapsible-basic
:::

## 使い方

```tsx
import { Collapsible } from "@dopejs/pingo-ui";

root.render(
  <Collapsible trigger="詳細オプション" defaultOpen>
    <text value="折りたたみ領域のコンテンツ。" />
  </Collapsible>,
);
```

非制御（`defaultOpen`）と制御（`open` + `onOpenChange`）の両方の使い方をサポートしています。

## 例

### 無効化

`disabled` を渡すと、トリガーはポインタにもキーボードにも反応しなくなり、無効化スタイルが適用されます。

:::preview collapsible-disabled
:::

## Props

| Prop           | 型                        | デフォルト | 説明                                 |
| -------------- | ------------------------- | ---------- | ------------------------------------ |
| `trigger`      | `string`                  | —          | トリガーのテキスト（必須）           |
| `children`     | `PingoNode`               | —          | 展開時に表示するコンテンツ（必須）   |
| `open`         | `boolean`                 | —          | 制御：現在の展開状態                 |
| `defaultOpen`  | `boolean`                 | `false`    | 非制御：初期の展開状態               |
| `onOpenChange` | `(open: boolean) => void` | —          | 展開状態が変化したときのコールバック |
| `disabled`     | `boolean`                 | `false`    | トリガーを無効化                     |
| `className`    | `string`                  | —          | コンポーネントのクラス名に追加される |

## アクセシビリティ

トリガーは button セマンティクスを持ち、expanded/collapsed 状態を支援技術に公開します。Enter と Space で
展開を切り替えます。コンテンツは折りたたみ時にアンマウントではなく `display: none` で非表示になるため、
内部のスクロール位置と編集状態が保持されます。
