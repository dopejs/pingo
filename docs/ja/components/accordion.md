---
title: Accordion
description: 一度に 1 項目だけ展開する垂直スタックのアコーディオン。pingo canvas 上にレンダリング。
---

# Accordion

アコーディオンは関連するコンテンツを展開・折りたたみ可能な垂直グループにまとめ、同時に展開できるのは
1 項目だけです。下のプレビューは pingo エンジンによるリアルタイムレンダリングです。タイトルをクリックして
切り替えたり、矢印キーでフォーカスを移動し Enter/Space で展開したりできます。

:::preview accordion-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { Accordion, AccordionItem } from "@dopejs/pingo-ui";

root.render(
  createElement(Accordion, {
    defaultOpenValue: "intro",
    children: [
      createElement(AccordionItem, {
        value: "intro",
        title: "pingo-ui とは？",
        children: createElement("text", { value: "pingo canvas 上にレンダリングされるコンポーネントライブラリ。" }),
      }),
      createElement(AccordionItem, {
        value: "theme",
        title: "ダークテーマに対応していますか？",
        children: createElement("text", { value: "対応しています。テーマに合わせて自動で切り替わります。" }),
      }),
    ],
  }),
);
```

`Accordion` は非制御（`defaultOpenValue`）と制御（`openValue` + `onValueChange`）の両方の使い方を
サポートしています。

## Props

### Accordion

| Prop | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `openValue` | `string` | — | 制御：現在展開している項目の `value` |
| `defaultOpenValue` | `string` | — | 非制御：初期に展開する項目の `value` |
| `onValueChange` | `(value: string \| undefined) => void` | — | 展開項目が変化したときのコールバック。すべて折りたたまれた場合は `undefined` |
| `children` | `PingoNode` | — | `AccordionItem` のリスト（必須） |
| `className` | `string` | — | コンポーネントのクラス名に追加される |

### AccordionItem

| Prop | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 項目の一意な識別子（必須） |
| `title` | `string` | — | トリガーのタイトル（必須） |
| `children` | `PingoNode` | — | 展開時に表示するコンテンツ（必須） |
| `className` | `string` | — | コンポーネントのクラス名に追加される |

## アクセシビリティ

矢印キー（上/下）はタイトル間でフォーカスを移動するだけで展開状態は変えません。Home/End は先頭・末尾へ
ジャンプします。Enter または Space で展開を切り替えます。これはフォーカスと選択の分離に関する WAI-ARIA の
要件に沿っています。コンテンツ領域は折りたたみ時にアンマウントではなく `display: none` で非表示になるため、
展開状態が保持されます。
