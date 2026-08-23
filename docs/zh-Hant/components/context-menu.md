---
title: Context Menu
description: 右鍵觸發的上下文選單，選單出現在指標按下處。
---

# Context Menu

Context Menu 在目標區域上右鍵（`contextmenu` 事件）時，於指標位置開啟選單。下方預覽由 pingo 引擎即時渲染——在文字區域上右鍵即可開啟選單，並跟隨網站主題切換明暗。

:::preview context-menu-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { ContextMenu } from "@dopejs/pingo-ui";

root.render(
  createElement(ContextMenu, {
    items: [
      { value: "copy", label: "复制" },
      { value: "paste", label: "粘贴", disabled: true },
      { value: "delete", label: "删除" },
    ],
    onSelect: (value) => run(value),
    children: createElement("text", { value: "在此右键" }),
  }),
);
```

選單定位在指標按下處而非觸發器角落；`Escape` 或選擇一項後關閉。禁用項不參與鍵盤導航，也不響應點選。靜態渲染時只顯示觸發區域，選單在右鍵時出現。

## Props

| Prop | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | 觸發區域內容（必填） |
| `items` | `readonly ContextMenuEntry[]` | — | 選單項（必填） |
| `onSelect` | `(value: string) => void` | — | 選擇選單項回調 |
| `onOpenChange` | `(open: boolean) => void` | — | 開合變化回調 |
| `className` | `string` | — | 追加類名 |

### ContextMenuEntry

| 欄位 | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 選單項值（必填） |
| `label` | `string` | — | 顯示文案（必填） |
| `disabled` | `boolean` | `false` | 禁用態 |

## 無障礙

選單具備 menu 語義，選單項具備 menuitem 語義；開啟後方向鍵上下移動，`Escape` 關閉。
