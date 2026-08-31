---
title: Dropdown Menu
description: トリガーをクリックして展開するアクションメニュー。キーボードナビゲーション対応。
---

# Dropdown Menu

Dropdown Menu はトリガーの下にアクション項目のセットを展開します。下のプレビューは pingo エンジンによる
リアルタイムレンダリングです。トリガーをクリックすると開閉でき、サイトのテーマに合わせて明暗が切り替わります。

:::preview dropdown-menu-basic
:::

## 使い方

```tsx
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@dopejs/pingo-ui";

root.render(
  <DropdownMenu onValueChange={(value) => run(value)}>
    <DropdownMenuTrigger>
      <Button onPress={() => {}}>メニューを開く</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem value="profile">プロフィール</DropdownMenuItem>
      <DropdownMenuItem value="settings">設定</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>,
);
```

Trigger と Content はコンテキスト経由でルートコンポーネントの状態を読み取るため、同じ `DropdownMenu` の
子ノードである必要があります。項目を選択すると `onValueChange` が発火し、メニューは自動的に閉じます。
開閉はデフォルトで非制御（`defaultOpen`）で、コンポーネントは制御用の `open` prop を提供しません。
完全に制御されたリスト選択が必要な場合は Select を使ってください（両者は同じ実装を共有しています）。

## Props

### DropdownMenu

| Prop            | 型                        | デフォルト | 説明                                     |
| --------------- | ------------------------- | ---------- | ---------------------------------------- |
| `value`         | `string`                  | —          | 現在の選択値（対応する項目をハイライト） |
| `defaultOpen`   | `boolean`                 | `false`    | 初期の開閉状態                           |
| `onValueChange` | `(value: string) => void` | —          | メニュー項目選択時のコールバック         |
| `onOpenChange`  | `(open: boolean) => void` | —          | 開閉変化時のコールバック                 |
| `children`      | `PingoNode`               | —          | Trigger と Content（必須）               |
| `className`     | `string`                  | —          | アンカーコンテナのクラス名に追加される   |

### DropdownMenuTrigger

| Prop          | 型          | デフォルト | 説明                                                                  |
| ------------- | ----------- | ---------- | --------------------------------------------------------------------- |
| `children`    | `PingoNode` | —          | トリガー要素。省略時は現在の値/プレースホルダーテキストをレンダリング |
| `placeholder` | `string`    | —          | 選択値がないときのプレースホルダーテキスト                            |
| `className`   | `string`    | —          | 追加するクラス名                                                      |

### DropdownMenuContent

| Prop        | 型          | デフォルト | 説明                 |
| ----------- | ----------- | ---------- | -------------------- |
| `children`  | `PingoNode` | —          | メニュー項目（必須） |
| `className` | `string`    | —          | 追加するクラス名     |

### DropdownMenuItem

| Prop        | 型       | デフォルト | 説明                     |
| ----------- | -------- | ---------- | ------------------------ |
| `value`     | `string` | —          | メニュー項目の値（必須） |
| `children`  | `string` | —          | 表示テキスト（必須）     |
| `className` | `string` | —          | 追加するクラス名         |

## アクセシビリティ

メニューは menu セマンティクスを、メニュー項目は menuitem セマンティクスを持ちます。開いた後は矢印キーで
上下に移動し、`Enter`/`Space` で選択、`Escape` で閉じてフォーカスをトリガーに戻します。
