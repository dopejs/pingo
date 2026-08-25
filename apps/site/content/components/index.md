---
title: 组件
description: shadcn 心智的 pingo 原生 UI 组件库，全部在 canvas 上实时渲染。
---

# 组件

`@dopejs/pingo-ui` 是与 shadcn/ui 对齐的组件库：API 与皮肤语义保持一致，渲染目标是
pingo canvas 引擎而非 DOM。下方每个组件页都包含**实时渲染**的预览——预览本身就是引擎
绘制的 canvas，可交互、跟随主题切换。

## 使用

```ts
import { createHostedCanvasRoot } from "@dopejs/pingo";
import { Button, createPingoUiStyleSheet } from "@dopejs/pingo-ui";

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [createPingoUiStyleSheet()],
});
root.render(createElement(Button, { children: "保存" }));
```

用户自定义样式表必须在 pingo-ui 样式表**之后**注册，同优先级规则按注册顺序覆盖。
主题与品牌定制见[样式指南](/guide/styling)与 [SCSS 与 Less](/guide/scss-less)。

从左侧目录选择一个组件开始。
