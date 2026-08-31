---
title: Popover
description: トリガーの横にアンカーされる浮遊パネル。補足情報や軽量な操作に。
---

# Popover

Popover はトリガーの横に浮遊パネルを開きます。ページがスクロールしてもパネルはアンカーされたままです。
下のプレビューは pingo エンジンによるリアルタイムレンダリングです。トリガーをクリックすると開閉でき、
サイトのテーマに合わせて明暗が切り替わります。

:::preview popover-basic
:::

## 使い方

```tsx
import { Button, Popover, PopoverContent, PopoverTrigger } from "@dopejs/pingo-ui";

root.render(
  <Popover defaultOpen={false} onOpenChange={(open) => {}}>
    <PopoverTrigger>
      <Button onPress={() => {}}>ポップオーバーを開く</Button>
    </PopoverTrigger>
    <PopoverContent>
      <text value="任意のコンテンツ" />
    </PopoverContent>
  </Popover>,
);
```

`PopoverTrigger` と `PopoverContent` はコンテキスト経由でルートコンポーネントの状態を読み取るため、同じ
`Popover` の子ノードである必要があります。デフォルトは非制御（`defaultOpen`）で、`open` を渡すと制御モードに
切り替わります。パネルはデフォルトでトリガーの下にアンカーされます。レイアウト読み戻しを有効にすると、
スペースが足りない場合に自動で反対側にフリップします。

## 例

### 任意のコンテンツ

`PopoverContent` の `children` は任意の `PingoNode` を受け取り、フォーム、リスト、タイポグラフィ
コンテンツなどを配置できます。

:::preview popover-rich
:::

## Props

### Popover

| Prop           | 型                        | デフォルト | 説明                                   |
| -------------- | ------------------------- | ---------- | -------------------------------------- |
| `open`         | `boolean`                 | —          | 制御された開閉状態                     |
| `defaultOpen`  | `boolean`                 | `false`    | 非制御の初期開閉                       |
| `onOpenChange` | `(open: boolean) => void` | —          | 開閉変化時のコールバック               |
| `children`     | `PingoNode`               | —          | Trigger と Content（必須）             |
| `className`    | `string`                  | —          | アンカーコンテナのクラス名に追加される |

### PopoverTrigger

| Prop        | 型          | デフォルト | 説明                 |
| ----------- | ----------- | ---------- | -------------------- |
| `children`  | `PingoNode` | —          | トリガー要素（必須） |
| `className` | `string`    | —          | 追加するクラス名     |

### PopoverContent

| Prop        | 型          | デフォルト | 説明                       |
| ----------- | ----------- | ---------- | -------------------------- |
| `children`  | `PingoNode` | —          | パネルのコンテンツ（必須） |
| `className` | `string`    | —          | 追加するクラス名           |

## アクセシビリティ

トリガーは button セマンティクスを持ち、expanded/collapsed 状態を公開します。`Escape` でパネルを閉じ、
フォーカスをトリガーに戻します。
