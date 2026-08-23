---
title: Avatar
description: 円形のアバター。画像がない場合はイニシャルにフォールバック。pingo canvas 上にレンダリング。
---

# Avatar

Avatar はユーザーのアバターを表示します。デコード済みの画像リソースを渡すと円形に切り抜いて表示し、
渡さない場合は `fallback` のイニシャルにフォールバックします。下のプレビューは pingo エンジンによる
リアルタイムレンダリングで、サイトのテーマに合わせて明暗が切り替わります。

:::preview avatar-basic
:::

## 使い方

```tsx
import { createElement } from "@dopejs/pingo";
import { Avatar } from "@dopejs/pingo-ui";

root.render(createElement(Avatar, { fallback: "田" }));
```

画像がある場合は、事前デコードした `PingoImage` リソースを渡します。画像は `object-fit: cover` で
フィットされ、円形に切り抜かれます。

```tsx
createElement(Avatar, { image: decodedImage, fallback: "田" });
```

## 例

### サイズ

`size` は正方形の一辺の長さ（px）で、同時に角丸を `size / 2` に設定します。省略時はスキン既定の 40px
です。プレビューでは順に 32、デフォルト、56 を表示しています。

```tsx
createElement(Avatar, { fallback: "佐", size: 32 });
```

## Props

| Prop | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `image` | `PingoImage` | — | 事前デコードした画像リソース。省略時は `fallback` のイニシャルを表示 |
| `fallback` | `string` | — | イニシャルテキスト。画像がないときに表示（必須） |
| `size` | `number` | スキン既定 `40` | 正方形の一辺の長さ（px） |
| `className` | `string` | — | コンポーネントのクラス名に追加される |

## アクセシビリティ

`fallback` のイニシャルは可読名の役割も兼ねます。ユーザーを表せる文字（姓や名前の頭文字など）を使い、
プレースホルダー記号は渡さないでください。
