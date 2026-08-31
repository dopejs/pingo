# 無障礙與可測試性

## 從第一天進架構

canvas 內容天生對螢幕閱讀器不可見。pingo 不把無障礙當作發佈後再補的覆蓋層：
Core 維護語意樹（role / label / value / bounds / focusable），
`@dopejs/pingo-a11y` 把它增量映射為 canvas 旁的絕對定位 DOM 影子樹。

影子元素視覺透明但存在於無障礙樹與 tab 順序中；聚焦它會轉送到引擎的編輯工作階段，
所以鍵盤使用者能真正操作 canvas 內的輸入框。

## 宣告語意

```tsx
<container semanticRole="region" semanticLabel="結帳面板">
  <text value="結帳" semanticRole="heading" semanticLabel="結帳" />
  {TextField({ semanticLabel: "收件人", value, revision })}
</container>
```

`editableText` 預設具備 textbox 語意。密碼欄位的值**永遠不進入**語意樹。

## 用語意做 E2E

因為語意樹被鏡像成真實 DOM，E2E 可以依角色與名稱選取元素，而不是比對像素：

```ts
import { getByRole, queryAllByRole } from "@dopejs/pingo";

const email = getByRole(document.body, "textbox", { name: "收件人" });
email.focus(); // 轉送到引擎編輯工作階段
expect(queryAllByRole(document.body, "textbox")).toHaveLength(2);
```

像素快照仍然保留，但作為繪製正確性的**補充證據**，不是唯一斷言。
這個選擇讓 UI 測試在字體繪製或反鋸齒變化時不會成片失敗。

## 斷言畫出來的文字

語意樹回答「這個節點是什麼」，它不回答「這一幀真的把這段字畫出去了」。兩者之間隔著
可見性、繪製順序、虛擬化與子樹快取，而主繪製路徑的指令裡根本不帶字串。
`onPaintedText` 補上後一半：

```ts
let painted: PaintedTextSnapshot | undefined;
const root = await createHostedCanvasRoot(canvas, {
  onPaintedText: (snapshot) => (painted = snapshot),
});

// 語意樹說按鈕在，探針說它這一幀被畫了出來。
getByRole(document.body, "button", { name: "儲存" });
expect(painted?.records.some((record) => record.text === "儲存")).toBe(true);
```

快照每幀送達一次，`root.paintedText()` 讀最近一幀。每筆記錄給出 `nodeId`、`text`、
裝置座標 `origin`、繪製通道 `channel` 與 `originClipped`。不傳 `onPaintedText` 時引擎
完全不計算它，幀成本與沒有這項能力時一致。

兩條邊界要記住：它報告的是 **Core 發出的**，不是回放後仍然可見的——視口裁剪發生在
後端；密碼欄位報告的是遮罩 `•`，因為那就是被畫出去的內容。

## 觀測語意樹

```ts
const root = await createHostedCanvasRoot(canvas, {
  onSemantics: (nodes) => inspect(nodes),
  accessibility: true, // 預設開啟；設為 false 可關閉影子樹
});
```

每個節點給出 `nodeId`、`role`、`label`、`value`、世界 `bounds`、`focusable`、`focused`、
`password` 旗標。幀診斷裡的 `dirtySemanticsNodes` 可以觀察語意失效頻率。

## 平台資格

自動化覆蓋的是語意樹匯出、影子樹映射、role/label 選擇器與鍵盤契約。
**真實螢幕閱讀器（VoiceOver、NVDA、TalkBack）的行為矩陣屬於平台資格採集**，
單獨追蹤，不計入工程出口——這條界線避免用未驗證的裝置結論冒充支援承諾。

在 [Playground 的語意示範](/zh-Hant/playground#/semantics)裡可以直接讀取目前的語意樹。
