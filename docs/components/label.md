---
title: Label
description: 表单标签文本，配合输入控件使用，渲染在 pingo canvas 上。
---

# Label

标签用于为表单控件提供可见名称。下方预览由 pingo 引擎实时渲染，并跟随站点主题切换明暗。

:::preview label-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Input, Label } from "@dopejs/pingo-ui";

root.render(
  createElement("container", {
    style: { flexDirection: "column" },
    children: [
      createElement(Label, { children: "邮箱" }),
      createElement("container", { height: 8 }),
      createElement(Input, { semanticLabel: "邮箱", width: 320 }),
    ],
  }),
);
```

pingo 没有 `gap` 属性，标签与控件之间的间距用一个固定尺寸的容器实现。

## 示例

### 语义名称

控件关联在 pingo 中尚不存在，因此标签与控件的关联靠约定：给控件传入与标签一致的 `semanticLabel`，让屏幕阅读器能读出同样的名称。

## Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `string` | — | 标签文本（必填） |
| `className` | `string` | — | 追加在组件类名之后 |
| `semanticLabel` | `string` | — | 覆盖无障碍名称；缺省使用标签文本 |

## 无障碍

pingo 尚无 label–control 关联机制，Label 只是带样式的文本。请始终在对应控件上设置 `semanticLabel`，保证无障碍名称不依赖视觉邻近关系。
