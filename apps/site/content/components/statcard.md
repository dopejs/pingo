---
title: StatCard
description: 指标卡片分子组件，展示数值、环比变化与趋势着色，渲染在 pingo canvas 上。
---

# StatCard

StatCard 是 pingo 特有的产品分子：一块指标瓦片，由标签、数值、环比 delta 与说明文字组成。`trend` 只影响 delta 的着色——`flat` 保持中性灰，因为持平的指标无所谓好坏。下方预览由 pingo 引擎实时渲染，跟随站点主题切换明暗。

:::preview statcard-basic
:::

与 shadcn 基础件的组合关系：StatCard 是自包含的展示分子，内部只用 Text/View 原语，不预留插槽；仪表盘布局时通常用 `flexDirection: "row"` 的 container 把多张 StatCard 排成一行，或与 Card、Divider 组合成报表区块。数值的格式化（千分位、货币符号）由调用方完成，`value`/`delta` 都是纯字符串。

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { StatCard } from "@dopejs/pingo-ui";

root.render(
  createElement(StatCard, {
    label: "本月营收",
    value: "¥128,400",
    delta: "+12.5%",
    trend: "up",
    description: "较上月",
  }),
);
```

## 示例

### 趋势着色

`trend` 取 `"up"` / `"down"` / `"flat"`，分别把 delta 染成涨、跌与中性色；不传 `trend` 时按 `flat` 处理。

### 无 delta

省略 `delta` 时数值独占一行，`trend` 不生效；`description` 同样可省略。

```tsx
createElement(StatCard, { label: "在线设备", value: "1,024" });
```

## Props

| Prop          | 类型                       | 默认值   | 说明                                 |
| ------------- | -------------------------- | -------- | ------------------------------------ |
| `label`       | `string`                   | —        | 指标名称（必填）                     |
| `value`       | `string`                   | —        | 指标数值，格式化由调用方负责（必填） |
| `delta`       | `string`                   | —        | 环比变化，如 `+12.5%`                |
| `trend`       | `"up" \| "down" \| "flat"` | `"flat"` | delta 的着色方向，不影响其他部分     |
| `description` | `string`                   | —        | 底部说明文字，如比较周期             |
| `className`   | `string`                   | —        | 追加在组件类名之后                   |

## 无障碍

StatCard 具有 `group` 语义角色，无障碍名称取 `label`，标签、数值与 delta 作为组内文本被辅助技术依次读出。趋势仅通过颜色表达时，请确保 `delta` 文本本身带有方向信息（如 `+`/`-` 前缀），不要只依赖红绿着色。
