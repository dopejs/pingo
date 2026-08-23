---
title: Icon Button
description: 只承载图标的按钮，必须提供无障碍名称，渲染在 pingo canvas 上。
---

# Icon Button

图标按钮用于没有文字标签的紧凑操作。下方预览由 pingo 引擎实时渲染——可以点击、聚焦，并跟随站点主题切换明暗。

:::preview icon-button-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { IconButton } from "@dopejs/pingo-ui";

root.render(
  createElement(IconButton, {
    icon: createElement("text", { value: "★" }),
    semanticLabel: "收藏",
    variant: "outline",
    onPress: () => toggleFavorite(),
  }),
);
```

`icon` 是一个透传的插槽，接受任意 `PingoNode`——图标字体、SVG 或文本字形都可以。因为没有可见文字，`semanticLabel` 是必填的。

## 示例

### 变体

`variant` 与 [Button](/components/button) 完全对齐：`default`、`secondary`、`outline`、`ghost`、`destructive`。

### 已知限制

`size` 支持 `default`、`sm`、`lg`，但当前皮肤没有为 icon 变体编写 `sm`/`lg` 的复合规则，图标尺寸会覆盖尺寸修饰，`sm`/`lg` 暂无视觉效果。

## Props

| Prop            | 类型                                                                | 默认值      | 说明                             |
| --------------- | ------------------------------------------------------------------- | ----------- | -------------------------------- |
| `icon`          | `PingoNode`                                                         | —           | 图标插槽，原样透传（必填）       |
| `semanticLabel` | `string`                                                            | —           | 无障碍名称（必填）               |
| `variant`       | `"default" \| "secondary" \| "outline" \| "ghost" \| "destructive"` | `"default"` | 视觉变体                         |
| `size`          | `"default" \| "sm" \| "lg"`                                         | `"default"` | 尺寸（`sm`/`lg` 暂无效，见上文） |
| `disabled`      | `boolean`                                                           | `false`     | 禁用态                           |
| `onPress`       | `() => void`                                                        | —           | 指针/键盘激活回调                |
| `className`     | `string`                                                            | —           | 追加在组件类名之后               |

## 无障碍

图标按钮没有可见文本，屏幕阅读器只能依赖 `semanticLabel`，因此该 prop 为必填。按钮具备 button 语义与键盘激活支持。
