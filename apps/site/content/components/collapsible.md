---
title: Collapsible
description: 单个可展开收起的内容区，渲染在 pingo canvas 上。
---

# Collapsible

Collapsible 是 Accordion 的单项原语：一个触发器控制一块内容的展开与收起，适合只需要一个折叠区的场景。下方预览由 pingo 引擎实时渲染——点击触发器切换。

:::preview collapsible-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Collapsible } from "@dopejs/pingo-ui";

root.render(
  createElement(Collapsible, {
    trigger: "高级选项",
    defaultOpen: true,
    children: createElement("text", { value: "折叠区内容。" }),
  }),
);
```

既支持非受控（`defaultOpen`）也支持受控（`open` + `onOpenChange`）两种用法。

## 示例

### 禁用

传入 `disabled` 后触发器不再响应指针与键盘，并应用禁用样式。

:::preview collapsible-disabled
:::

## Props

| Prop           | 类型                      | 默认值  | 说明                     |
| -------------- | ------------------------- | ------- | ------------------------ |
| `trigger`      | `string`                  | —       | 触发器文本（必填）       |
| `children`     | `PingoNode`               | —       | 展开后显示的内容（必填） |
| `open`         | `boolean`                 | —       | 受控：当前展开状态       |
| `defaultOpen`  | `boolean`                 | `false` | 非受控：初始展开状态     |
| `onOpenChange` | `(open: boolean) => void` | —       | 展开状态变化回调         |
| `disabled`     | `boolean`                 | `false` | 禁用触发器               |
| `className`    | `string`                  | —       | 追加在组件类名之后       |

## 无障碍

触发器具备 button 语义，并向辅助技术暴露 expanded/collapsed 状态；Enter 与空格切换展开。内容收起时以 `display: none` 隐藏而非卸载，内部的滚动位置与编辑状态得以保留。
