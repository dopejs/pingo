---
title: ListRow
description: リスト行の分子コンポーネント。アバターやバッジなどの基本部品と選択/無効状態を組み合わせる。pingo canvas 上にレンダリング。
---

# ListRow

ListRow は pingo 固有のプロダクト分子コンポーネントです。1 行のリスト項目で、タイトルと説明が中央の伸縮列を
占め、`leading`（アバター、アイコン）と `trailing`（バッジ、スイッチ、矢印）のスロットが両端に配置されます。
下のプレビューは pingo エンジンによるリアルタイムレンダリングです。クリック可能な行には完全なポインター
フィードバックがあり、サイトのテーマに合わせて明暗が切り替わります。

:::preview list-row-basic
:::

shadcn の基本部品との組み合わせ関係：ListRow は行のレイアウトとインタラクション状態を定義し、コンテンツ
コンポーネントは内蔵しません。`leading`/`trailing` スロットは任意の `PingoNode` を受け取り、典型的な
組み合わせは Avatar、Badge、Switch です。隣接する行の間に余白が必要な場合は、固定高さの container で
間隔を作ります（pingo には gap プロパティがありません）。

## 使い方

```tsx
import { Avatar, Badge, ListRow } from "@dopejs/pingo-ui";

root.render(
  <ListRow
    title="田中太郎"
    description="tanaka@example.com"
    leading={<Avatar fallback="田" size={32} />}
    trailing={<Badge>管理者</Badge>}
    onPress={() => openMember("tanaka")}
  />,
);
```

## 例

### 選択と無効化

`selected` は選択スタイルを適用し、選択状態を外部に公開します。`disabled` の行はイベントハンドラーを一切
持ちません。「ハンドラー内で判定する」よりも強力です。

:::preview list-row-states
:::

### 表示専用の行

`onPress` を渡さない場合は表示専用項目として振る舞います。セマンティックロールは `listitem` で、
インタラクションスタイルもイベントもありません。

## Props

| Prop          | 型           | デフォルト | 説明                                                            |
| ------------- | ------------ | ---------- | --------------------------------------------------------------- |
| `title`       | `string`     | —          | タイトルテキスト（必須）                                        |
| `description` | `string`     | —          | 副次的な説明テキスト                                            |
| `leading`     | `PingoNode`  | —          | 前部スロット。アバターやアイコンを配置                          |
| `trailing`    | `PingoNode`  | —          | 尾部スロット。バッジ、スイッチ、矢印を配置                      |
| `selected`    | `boolean`    | —          | 選択状態。渡すと `selected`/`unselected` セマンティック値を公開 |
| `disabled`    | `boolean`    | `false`    | 無効状態。イベントハンドラーは一切登録されない                  |
| `onPress`     | `() => void` | —          | クリック時のコールバック。渡すと行がインタラクティブになる      |
| `className`   | `string`     | —          | コンポーネントのクラス名に追加される                            |

## アクセシビリティ

インタラクティブな行は `button` セマンティックロールを持ち、表示専用の行は `listitem` です。アクセシブル名は
`title` が使われます。`selected` を渡すと `selected`/`unselected` セマンティック値を公開します。無効化された行は
ポインタ/キーボードハンドラーを一切持たず、支援技術には純粋な静的項目として見えます。
