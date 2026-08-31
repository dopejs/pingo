---
title: 元件
description: shadcn 心智的 pingo 原生 UI 元件庫，全部在 canvas 上即時渲染。
---

# 元件

`@dopejs/pingo-ui` 是與 shadcn/ui 對齊的元件庫：API 與外觀語義保持一致，渲染目標是
pingo canvas 引擎而非 DOM。下方每個元件頁都包含**即時渲染**的預覽——預覽本身就是引擎
繪製的 canvas，可互動、跟隨主題切換。

## 使用

```tsx
import { createHostedCanvasRoot } from "@dopejs/pingo";
import { Button, createPingoUiStyleSheet } from "@dopejs/pingo-ui";

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [createPingoUiStyleSheet()],
});
root.render(<Button>保存</Button>);
```

使用者自訂樣式表必須在 pingo-ui 樣式表**之後**註冊，同優先順序規則按註冊順序覆蓋。
主題與品牌訂製見[樣式指南](/guide/styling)與 [SCSS 與 Less](/guide/scss-less)。

從左側目錄選擇一個元件開始。
