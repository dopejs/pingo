---
title: Hover Card
description: 悬停时展开的富内容卡片，带打开与关闭延迟。
---

# Hover Card

Hover Card 在悬停（或聚焦）触发器时展开一张富内容卡片——比 Tooltip 承载更多信息，比如用户资料预览。下方预览由 pingo 引擎实时渲染（以受控 `open` 常开展示），并跟随站点主题切换明暗。

:::preview hover-card-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { HoverCard } from "@dopejs/pingo-ui";

root.render(
  createElement(HoverCard, {
    openDelayMs: 300,
    closeDelayMs: 200,
    children: createElement("text", { value: "@pingo" }),
    content: createElement("text", { value: "Canvas 渲染引擎与 UI 组件库。" }),
  }),
);
```

卡片在打开后悬停在卡片自身上也不会关闭，因此 `closeDelayMs` 给了指针跨越触发器与卡片之间空隙的时间。传入 `open` 可切换为受控模式，配合 `onOpenChange` 自行管理状态。

## Props

| Prop           | 类型                      | 默认值 | 说明                   |
| -------------- | ------------------------- | ------ | ---------------------- |
| `children`     | `PingoNode`               | —      | 触发元素（必填）       |
| `content`      | `PingoNode`               | —      | 卡片内容（必填）       |
| `open`         | `boolean`                 | —      | 受控开合状态           |
| `onOpenChange` | `(open: boolean) => void` | —      | 开合变化回调           |
| `openDelayMs`  | `number`                  | `300`  | 打开延迟（毫秒）       |
| `closeDelayMs` | `number`                  | `200`  | 关闭延迟（毫秒）       |
| `className`    | `string`                  | —      | 追加在锚点容器类名之后 |

## 无障碍

触发器在聚焦时同样会打开卡片，失焦关闭，键盘用户不会丢失内容。
