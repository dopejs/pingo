---
title: Button
description: 触发操作或事件的按钮，渲染在 pingo canvas 上。
---

# Button

按钮触发一个操作。下方预览由 pingo 引擎实时渲染——可以点击、聚焦，并跟随站点主题切换明暗。

:::preview button-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Button } from "@dopejs/pingo-ui";

root.render(
  createElement(Button, {
    children: "保存",
    variant: "default",
    onPress: () => save(),
  }),
);
```

## 示例

### 尺寸

`size` 支持 `default`、`sm`、`lg` 与 `icon`。

### 禁用

传入 `disabled` 后按钮不再响应指针与键盘，并应用禁用样式。

## Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `string` | — | 按钮文本（必填） |
| `variant` | `"default" \| "secondary" \| "outline" \| "ghost" \| "destructive"` | `"default"` | 视觉变体 |
| `size` | `"default" \| "sm" \| "lg" \| "icon"` | `"default"` | 尺寸 |
| `disabled` | `boolean` | `false` | 禁用态 |
| `onPress` | `() => void` | — | 指针/键盘激活回调 |
| `semanticLabel` | `string` | `children` | 无障碍名称 |
| `className` | `string` | — | 追加在组件类名之后 |

## 无障碍

按钮具备 button 语义与键盘激活支持；`semanticLabel` 默认取 `children`，图标按钮请显式提供。
