---
title: Combobox
description: 可搜尋的下拉選擇器，輸入過濾選項列表，渲染在 pingo canvas 上。
---

# Combobox

組合框把一個顯示選中值的觸發器和一份可搜尋的選項列表繫結在一起。下方預覽由 pingo 引擎即時渲染——列表已展開，可以輸入過濾、用方向鍵選擇，並跟隨網站主題切換明暗。

:::preview combobox-basic
:::

## 用法

```tsx
import { Combobox } from "@dopejs/pingo-ui";

root.render(
  <Combobox
    items={[
      { value: "next", label: "Next.js" },
      { value: "remix", label: "Remix" },
      { value: "astro", label: "Astro" },
    ]}
    placeholder="选择框架"
    onValueChange={(value) => console.log(value)}
  />,
);
```

`items` 是 `{ value, label }` 陣列；過濾是對 `label` 的大小寫不敏感子串匹配——刻意不做模糊排序，錯誤的排序比沒有排序更糟。選中後列表自動收起，查詢詞在**關閉時**清空，避免重新開啟時對著一個早已忘記的過濾詞。

## 示例

### 受控

`value` / `onValueChange` 與 `open` / `onOpenChange` 都可以受控；預設時元件用 `defaultValue` / `defaultOpen` 自持狀態。

### 空狀態

`emptyLabel` 自訂過濾無結果時的提示文字。

## Props

| Prop            | 型別                                          | 預設值     | 說明                           |
| --------------- | --------------------------------------------- | ---------- | ------------------------------ |
| `items`         | `readonly { value: string; label: string }[]` | —          | 選項列表（必填）               |
| `value`         | `string`                                      | —          | 受控選中值                     |
| `defaultValue`  | `string`                                      | —          | 非受控初始選中值               |
| `onValueChange` | `(value: string) => void`                     | —          | 選中變化回調（選中後自動收起） |
| `open`          | `boolean`                                     | —          | 受控開合                       |
| `defaultOpen`   | `boolean`                                     | `false`    | 非受控初始開合                 |
| `onOpenChange`  | `(open: boolean) => void`                     | —          | 開合回調                       |
| `placeholder`   | `string`                                      | `"请选择"` | 未選中時觸發器上的佔位文字     |
| `emptyLabel`    | `string`                                      | —          | 過濾無結果時的提示             |
| `className`     | `string`                                      | —          | 追加在元件類名之後             |

## 無障礙

觸發器帶 button 語義並在 `expanded` / `collapsed` 間切換。列表開啟時焦點進入搜尋框，方向鍵移動高亮，回車選中並關閉；關閉後焦點回到觸發器。
