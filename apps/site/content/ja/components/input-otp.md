---
title: Input OTP
description: 固定長のワンタイムコード入力。1 マスずつの入力と一括ペーストに対応。pingo canvas 上にレンダリング。
---

# Input OTP

ワンタイムコードの入力で、固定長のマスの集まりで構成されます。下のプレビューは pingo エンジンによる
リアルタイムレンダリングです。1 マスずつ数字を入力したり、コード全体をペーストしたりでき、サイトのテーマに
合わせて明暗が切り替わります。

:::preview input-otp-basic
:::

## 使い方

```tsx
import { InputOTP } from "@dopejs/pingo-ui";

root.render(
  <InputOTP
    length={6}
    semanticLabel="ワンタイムコード"
    onValueChange={(value) => console.log(value)}
    onComplete={(code) => verify(code)}
  />,
);
```

内部値は**固定長でスペース埋め**された文字列です。スペースが空きマスを表します。`onValueChange` が受け取るのは
この埋められた値で、`onComplete` はすべてのマスが埋まったときに一度だけ発火し、スペースを取り除いた完全な
コードを受け取ります。ペーストは現在のマスから始まる一括充填として扱われ、削除は現在のマスだけをクリアし、
後続の数字を左に詰めることはしません。

## 例

### 長さ

`length` がマスの数を決めます（デフォルト 6）。各マスは数字ソフトキーボード（`inputMode: "numeric"`）を
使います。

## Props

| Prop            | 型                        | デフォルト | 説明                                                               |
| --------------- | ------------------------- | ---------- | ------------------------------------------------------------------ |
| `length`        | `number`                  | `6`        | マスの数                                                           |
| `value`         | `string`                  | —          | 制御された現在の値（スペース埋め）                                 |
| `defaultValue`  | `string`                  | —          | 非制御の初期値                                                     |
| `onValueChange` | `(value: string) => void` | —          | 値変化時のコールバック。値はスペース埋めの固定長文字列             |
| `onComplete`    | `(value: string) => void` | —          | すべて埋まったときのコールバック。値はスペースを除いた完全なコード |
| `disabled`      | `boolean`                 | `false`    | すべてのマスを無効化                                               |
| `semanticLabel` | `string`                  | —          | グループのアクセシブル名                                           |
| `className`     | `string`                  | —          | コンポーネントのクラス名に追加される                               |

## アクセシビリティ

コンポーネントは `group` セマンティックロールを持ちます。各マスは自動的に `番号/総数` 形式のアクセシブル名
（たとえば `3/6`）を取得し、`semanticLabel` でグループ全体に名前を付けることもできます。
