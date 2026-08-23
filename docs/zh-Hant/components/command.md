---
title: Command
description: 可搜尋過濾的命令面板，支援鍵盤選擇與回車確認。
---

# Command

Command 是帶搜尋框的命令面板：輸入即時過濾條目，方向鍵移動游標，回車確認。下方預覽由 pingo 引擎即時渲染——直接在搜尋框輸入即可過濾，並跟隨網站主題切換明暗。

:::preview command-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Command } from "@dopejs/pingo-ui";

root.render(
  createElement(Command, {
    items: [
      { value: "open", label: "打开文件" },
      { value: "save", label: "保存文件" },
    ],
    onSelect: (value) => run(value),
    onDismiss: () => closePalette(),
  }),
);
```

過濾是大小寫不敏感的標籤子字串匹配——刻意的非模糊匹配：排序策略屬於產品決策，元件不替呼叫方做。`onDismiss` 在未匹配到導航鍵時響應 `Escape`，適合把面板包在 Dialog 裡做「⌘K」體驗。

## Props

| Prop | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `items` | `readonly CommandItem[]` | — | 命令條目（必填） |
| `onSelect` | `(value: string) => void` | — | 選擇條目回調（點選或回車） |
| `onDismiss` | `() => void` | — | `Escape` 回調 |
| `placeholder` | `string` | `"搜索"` | 搜尋框的無障礙名稱 |
| `emptyLabel` | `string` | `"无结果"` | 過濾為空時的提示文案 |
| `className` | `string` | — | 追加類名 |

### CommandItem

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| `value` | `string` | 條目值（必填） |
| `label` | `string` | 顯示與匹配文案（必填） |

## 無障礙

容器具備 search 語義，條目具備 option 語義並暴露 selected 狀態；上下方向鍵移動游標，`Enter` 確認，`Escape` 觸發 `onDismiss`。
