---
title: Divider
description: 水平或垂直的视觉分隔线，渲染在 pingo canvas 上。
---

# Divider

分隔线在内容之间提供视觉分组。下方预览由 pingo 引擎实时渲染，并跟随站点主题切换明暗。

:::preview divider-horizontal
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Divider } from "@dopejs/pingo-ui";

root.render(createElement(Divider, {}));
```

## 示例

### 垂直分隔线

传入 `orientation: "vertical"` 得到一条垂直分隔线。垂直分隔线高度为父容器的 100%，因此父容器需要有确定的高度。

:::preview divider-vertical
:::

## Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | 分隔线方向 |
| `className` | `string` | — | 追加在组件类名之后 |

水平分隔线宽度为父容器的 100%、高度 1px；垂直分隔线高度为父容器的 100%、宽度 1px。

## 无障碍

Divider 是纯视觉元素，不携带语义角色，辅助技术会将其忽略；内容分组应通过标题等语义结构表达。
