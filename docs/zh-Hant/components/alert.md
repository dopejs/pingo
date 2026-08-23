---
title: Alert
description: 展示重要提示資訊的callout區塊，渲染在 pingo canvas 上。
---

# Alert

Alert 用於在頁面中展示需要使用者注意、但不打斷流程的提示資訊。下方預覽由 pingo 引擎即時渲染，並跟隨網站主題切換明暗。

:::preview alert-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Alert } from "@dopejs/pingo-ui";

root.render(
  createElement(Alert, {
    title: "提示",
    children: "你的配置已自动保存。",
  }),
);
```

## 示例

### 破壞性提示

`variant="destructive"` 用於錯誤或失敗場景：邊框與標題變為破壞性配色，描述文字保持常規前景色以保證可讀性。

```tsx
createElement(Alert, {
  title: "同步失败",
  variant: "destructive",
  children: "请检查网络连接后重试。",
});
```

## Props

| Prop | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `title` | `string` | — | 標題（必填） |
| `children` | `string` | — | 描述正文（必填） |
| `variant` | `"default" \| "destructive"` | `"default"` | 視覺變體 |
| `className` | `string` | — | 追加在元件類名之後 |

## 無障礙

Alert 是純靜態文字區塊，不搶焦點；請用簡潔的 `title` 概括結論，把細節放在描述中。需要使用者確認或處理的場景請改用 `AlertDialog`。
