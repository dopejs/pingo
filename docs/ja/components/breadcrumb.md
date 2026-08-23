---
title: Breadcrumb
description: shadcn スタイルのパンくずナビゲーション。末尾項目は現在のページでクリック不可。pingo canvas 上にレンダリング。
---

# Breadcrumb

パンくずナビゲーション。末尾項目以外はすべてクリック可能なリンクで、末尾項目は現在のページを表します。
リンクとしてレンダリングされず、「現在位置へジャンプ」する操作も支援技術に提供されません。下のプレビューは
pingo エンジンによるリアルタイムレンダリングです。前の項目をクリックしたり、キーボードでアクティブに
したりでき、サイトのテーマに合わせて明暗が切り替わります。

:::preview breadcrumb-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { Breadcrumb } from "@dopejs/pingo-ui";

root.render(
  createElement(Breadcrumb, {
    items: [
      { label: "ホーム", onNavigate: () => navigate("/") },
      { label: "コンポーネント", onNavigate: () => navigate("/components") },
      { label: "Breadcrumb" }, // 末尾項目は現在のページなので onNavigate は不要
    ],
  }),
);
```

## 例

### カスタム区切り文字

`separator` のデフォルトは `/` ですが、任意のテキスト記号に変更できます（アイコンセットが導入されるまでは
区切り文字はテキストグリフです）。

:::preview breadcrumb-separator
:::

## Props

### BreadcrumbProps

| Prop        | 型                          | デフォルト | 説明                                                     |
| ----------- | --------------------------- | ---------- | -------------------------------------------------------- |
| `items`     | `readonly BreadcrumbItem[]` | —          | パンくず項目。末尾項目は現在のページとみなされる（必須） |
| `separator` | `string`                    | `"/"`      | 項目間の区切り文字                                       |
| `className` | `string`                    | —          | コンポーネントのクラス名に追加される                     |

### BreadcrumbItem

| フィールド   | 型           | デフォルト | 説明                                                                                                           |
| ------------ | ------------ | ---------- | -------------------------------------------------------------------------------------------------------------- |
| `label`      | `string`     | —          | 項目のテキスト（必須）                                                                                         |
| `onNavigate` | `() => void` | —          | クリック時のコールバック。未指定の項目にはアクティブ化の挙動が付かない（末尾項目は現在のページなので指定不要） |

## アクセシビリティ

パンくず全体は "breadcrumb" という名前の `navigation` セマンティクスを持ちます。クリック可能な項目は
link セマンティクスで、`Enter` / `Space` によるキーボードアクティブ化をサポートし、クリック前に
フォーカスされます。現在のページは `current` セマンティック値を持つプレーンテキストとしてレンダリング
され、スクリーンリーダーはそれをジャンプ可能なリンクとして扱いません。詳しくは
[アクセシビリティガイド](/ja/guide/accessibility)を参照してください。
