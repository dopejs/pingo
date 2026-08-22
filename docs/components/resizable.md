---
title: Resizable
description: 可拖拽手柄调整比例的双栏布局，渲染在 pingo canvas 上。
---

# Resizable

Resizable 把容器分成两个面板，中间的夹拖手柄可以拖动调整比例，也支持键盘微调。下方预览由 pingo 引擎实时渲染——拖动手柄试试。

:::preview resizable-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Resizable } from "@dopejs/pingo-ui";

root.render(
  createElement(Resizable, {
    defaultSplit: 0.4,
    first: sidebar,
    second: content,
  }),
);
```

组件自身宽高为父容器的 100%，需要一个有确定尺寸的父容器。既支持非受控（`defaultSplit`）也支持受控（`split` + `onSplitChange`）两种用法。

## 示例

### 垂直方向

传入 `direction: "column"` 切换为上下分割，手柄变为横向。

:::preview resizable-vertical
:::

## Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `first` | `PingoNode` | — | 第一个面板内容（必填） |
| `second` | `PingoNode` | — | 第二个面板内容（必填） |
| `split` | `number` | — | 受控：第一个面板占比，`[0, 1]` |
| `defaultSplit` | `number` | `0.5` | 非受控：初始占比 |
| `onSplitChange` | `(split: number) => void` | — | 占比变化回调 |
| `direction` | `"row" \| "column"` | `"row"` | 分割方向 |
| `minSplit` | `number` | `0.1` | 最小占比（钳制下界） |
| `maxSplit` | `number` | `0.9` | 最大占比（钳制上界） |
| `disabled` | `boolean` | `false` | 禁用手柄交互 |
| `className` | `string` | — | 追加在组件类名之后 |

## 无障碍

手柄具备 separator 语义，并向辅助技术暴露当前占比（百分比）。聚焦手柄后可用方向键以 2% 步长微调：水平布局用左/右，垂直布局用上/下。
