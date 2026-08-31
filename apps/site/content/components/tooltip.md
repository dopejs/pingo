---
title: Tooltip
description: 悬停时显示的简短说明文字，锚定在目标元素上方。
---

# Tooltip

Tooltip 在指针悬停时显示一小段说明文字，默认锚定在目标上方。下方预览由 pingo 引擎实时渲染——把指针悬停在按钮上即可看到气泡，并跟随站点主题切换明暗。

:::preview tooltip-basic
:::

## 用法

```tsx
import { Button, Tooltip } from "@dopejs/pingo-ui";

root.render(
  <Tooltip content="保存到云端">
    <Button onPress={() => save()}>保存</Button>
  </Tooltip>,
);
```

Tooltip 由指针进出驱动（`pointerenter` / `pointerleave`），无受控 props；静态渲染时只显示触发元素，气泡在悬停时出现。

## Props

| Prop        | 类型        | 默认值 | 说明                   |
| ----------- | ----------- | ------ | ---------------------- |
| `content`   | `string`    | —      | 气泡文字（必填）       |
| `children`  | `PingoNode` | —      | 触发元素（必填）       |
| `className` | `string`    | —      | 追加在锚点容器类名之后 |

## 无障碍

气泡具备 tooltip 语义。Tooltip 只在悬停时出现，不响应键盘聚焦；关键信息不要只放在 Tooltip 里。
