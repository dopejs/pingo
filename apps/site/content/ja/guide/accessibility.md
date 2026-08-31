# アクセシビリティとテスト容易性

## 初日からアーキテクチャに入れる

canvas の内容は本質的にスクリーンリーダーから見えません。pingo はアクセシビリティをリリース後に
被せるレイヤーとして扱いません。Core がセマンティクスツリー（role / label / value / bounds /
focusable）を保持し、`@dopejs/pingo-a11y` がそれを canvas の隣の絶対配置された DOM シャドウツリーへ
差分的に反映します。

シャドウ要素は視覚的には透明ですが、アクセシビリティツリーと tab 順には存在します。フォーカスすると
エンジンの編集セッションへ転送されるため、キーボード利用者は canvas 内の入力欄を実際に操作できます。

## セマンティクスを宣言する

```tsx
<container semanticRole="region" semanticLabel="決済パネル">
  <text value="決済" semanticRole="heading" semanticLabel="決済" />
  {TextField({ semanticLabel: "宛先", value, revision })}
</container>
```

`editableText` は既定で textbox のセマンティクスを持ちます。パスワード欄の値が
セマンティクスツリーに入ることは**決してありません**。

## セマンティクスで E2E を書く

セマンティクスツリーが実際の DOM に反映されるため、E2E はピクセル比較ではなくロールと名前で
要素を選択できます。

```ts
import { getByRole, queryAllByRole } from "@dopejs/pingo";

const email = getByRole(document.body, "textbox", { name: "宛先" });
email.focus(); // エンジンの編集セッションへ転送されます
expect(queryAllByRole(document.body, "textbox")).toHaveLength(2);
```

ピクセルスナップショットは残しますが、描画の正しさを示す**補助的な証拠**であって唯一の
アサーションではありません。この選択により、フォントのレンダリングやアンチエイリアスが変わった
だけで UI テストが総崩れになることを防げます。

## 描かれた文字をアサートする

セマンティクスツリーは「このノードは何か」に答えますが、「このフレームが本当にその
文字列を描いたか」には答えません。両者の間には可視性、描画順、仮想化、サブツリー
キャッシュがあり、主描画経路の命令はそもそも文字列を持ちません。`onPaintedText` が
残り半分を埋めます。

```ts
let painted: PaintedTextSnapshot | undefined;
const root = await createHostedCanvasRoot(canvas, {
  onPaintedText: (snapshot) => (painted = snapshot),
});

// セマンティクスツリーはボタンの存在を、プローブはそれが描かれたことを言う。
getByRole(document.body, "button", { name: "保存" });
expect(painted?.records.some((record) => record.text === "保存")).toBe(true);
```

スナップショットはフレームごとに 1 回届き、`root.paintedText()` は直近のものを返します。
各レコードは `nodeId`、`text`、デバイス座標 `origin`、描画チャネル `channel`、
`originClipped` を持ちます。`onPaintedText` を渡さなければエンジンは計算自体を行わず、
フレームのコストはこの機能がない場合と変わりません。

境界が二つあります。報告するのは **Core が発行したもの**であって、再生後も見えている
ものではありません（ビューポートのカリングはバックエンドで起きます）。パスワード欄は
マスクの `•` を報告します。実際に描かれているのがそれだからです。

## セマンティクスツリーを観測する

```ts
const root = await createHostedCanvasRoot(canvas, {
  onSemantics: (nodes) => inspect(nodes),
  accessibility: true, // 既定で有効。false にするとシャドウツリーを無効化します
});
```

各ノードは `nodeId`、`role`、`label`、`value`、ワールド `bounds`、`focusable`、`focused`、
`password` フラグを返します。フレーム診断の `dirtySemanticsNodes` でセマンティクス無効化の頻度を
観察できます。

## プラットフォーム認定

自動化がカバーするのは、セマンティクスツリーの書き出し、シャドウツリーの対応付け、role/label
セレクタ、キーボード契約です。
**実際のスクリーンリーダー（VoiceOver、NVDA、TalkBack）の挙動マトリクスはプラットフォーム認定**
として別に追跡し、エンジニアリングの完了条件には含めません。この線引きは、検証していない
実機の結論をサポートの約束として偽らないためのものです。

[Playground のセマンティクスデモ](/ja/playground#/semantics)で現在のセマンティクスツリーを直接読めます。
