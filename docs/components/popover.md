---
title: Popover
description: 锚定在触发器旁的浮层面板，用于补充信息与轻量操作。
---

# Popover

Popover 在触发器旁边打开一个浮动面板，页面滚动时面板保持锚定。下方预览由 pingo 引擎实时渲染——点击触发器即可开合，并跟随站点主题切换明暗。

:::preview popover-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@dopejs/pingo-ui";

root.render(
  createElement(Popover, {
    defaultOpen: false,
    onOpenChange: (open) => {},
    children: [
      createElement(PopoverTrigger, {
        children: createElement(Button, { children: "打开浮层", onPress: () => {} }),
      }),
      createElement(PopoverContent, {
        children: createElement("text", { value: "任意内容" }),
      }),
    ],
  }),
);
```

`PopoverTrigger` 与 `PopoverContent` 通过 context 读取根组件状态，必须作为同一个 `Popover` 的子节点。默认非受控（`defaultOpen`），传入 `open` 即切换为受控模式。面板默认锚定在触发器下方；开启布局回读后，空间不足时会自动翻转到另一侧。

## 示例

### 任意内容

`PopoverContent` 的 `children` 接受任意 `PingoNode`，可以放表单、列表或排版内容。

:::preview popover-rich
:::

## Props

### Popover

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` | — | 受控开合状态 |
| `defaultOpen` | `boolean` | `false` | 非受控初始开合 |
| `onOpenChange` | `(open: boolean) => void` | — | 开合变化回调 |
| `children` | `PingoNode` | — | Trigger 与 Content（必填） |
| `className` | `string` | — | 追加在锚点容器类名之后 |

### PopoverTrigger

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | 触发元素（必填） |
| `className` | `string` | — | 追加类名 |

### PopoverContent

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | 面板内容（必填） |
| `className` | `string` | — | 追加类名 |

## 无障碍

触发器具备 button 语义并暴露 expanded/collapsed 状态；`Escape` 关闭面板并把焦点交还触发器。
