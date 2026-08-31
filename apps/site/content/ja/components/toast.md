---
title: Toast
description: 隅に表示される軽量通知。ToastViewport にホストされ、pingo canvas 上に描画される。
---

# Toast

Toast は、隅に一時的に表示される軽量な通知であり、保存成功や同期失敗などの即時フィードバックに適している。以下のプレビューは pingo エンジンによってリアルタイムに描画される。ボタンをクリックすると toast がトリガーされ、サイトのテーマに追従して明暗が切り替わる。

:::preview toast-basic
:::

## 使い方

Toast は `ToastViewport` と組み合わせて使用する。ビューポートは絶対配置される隅のコンテナ（デフォルトは右上）であり、**必ずルートに近いコンテナの下に配置する必要がある**。本エンジンの包含ブロックは親ノードであり、直近の positioned 祖先ではない。小さいコンテナ内に配置すると、その小さいコンテナのみを覆うことになる。

```tsx
import { Button, Toast, ToastViewport } from "@dopejs/pingo-ui";

let open = false;

function scene() {
  return (
    <container width={surfaceWidth} height={surfaceHeight}>
      <Button
        onPress={() => {
          open = true;
          root.render(scene());
        }}
      >
        保存
      </Button>
      <ToastViewport>
        <Toast open={open} title="保存しました" description="設定をローカルに書き込みました。" />
      </ToastViewport>
    </container>
  );
}
```

表示/非表示、自動クローズのタイミングはアプリケーション自身が制御する。`open` を反転させて再度 `root.render(...)` を呼び出せばよい（プレビュー内のボタンはこのパターンである）。

## 例

### バリアント

`variant="destructive"` は失敗通知に使用する。この場合、説明テキストに弱めの前景色は使用されない。破壊的バックグラウンドはすでに前景を反転させており、さらに弱めると赤背景に灰色のテキストになってしまうためである。

:::preview toast-variants
:::

## Props

### Toast

| Prop          | 型                           | デフォルト値 | 説明                                                               |
| ------------- | ---------------------------- | ------------ | ------------------------------------------------------------------ |
| `open`        | `boolean`                    | —            | 表示するかどうか。`false` の場合は `null` として描画される（必須） |
| `title`       | `string`                     | —            | タイトル（必須）                                                   |
| `description` | `string`                     | —            | 説明本文。省略した場合は説明行を描画しない                         |
| `variant`     | `"default" \| "destructive"` | `"default"`  | 視覚的バリアント                                                   |
| `className`   | `string`                     | —            | コンポーネントのクラス名の後に追加する                             |

### ToastViewport

| Prop        | 型          | デフォルト値 | 説明                                                                           |
| ----------- | ----------- | ------------ | ------------------------------------------------------------------------------ |
| `children`  | `PingoNode` | —            | ビューポート内の toast リスト。複数ある場合は 8px 間隔で縦に積み重ねる（必須） |
| `className` | `string`    | —            | コンポーネントのクラス名の後に追加する                                         |

## アクセシビリティ

Toast には `status` セマンティックロールが付与されており、支援技術はこれをステータスメッセージとして読み上げる。toast は現在のフォーカスを妨げない。重要な操作の結果については、ページ上に永続的なフィードバック（`Alert` など）も併せて保持すること。
