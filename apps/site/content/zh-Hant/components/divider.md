---
title: Divider
description: 水平或垂直的視覺分隔線，渲染在 pingo canvas 上。
---

# Divider

分隔線在內容之間提供視覺分組。下方預覽由 pingo 引擎即時渲染，並跟隨網站主題切換明暗。

:::preview divider-horizontal
:::

## 用法

```tsx
import { Divider } from "@dopejs/pingo-ui";

root.render(<Divider />);
```

## 示例

### 垂直分隔線

傳入 `orientation: "vertical"` 得到一條垂直分隔線。垂直分隔線高度為父容器的 100%，因此父容器需要有確定的高度。

:::preview divider-vertical
:::

## Props

| Prop          | 型別                         | 預設值         | 說明               |
| ------------- | ---------------------------- | -------------- | ------------------ |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | 分隔線方向         |
| `className`   | `string`                     | —              | 追加在元件類名之後 |

水平分隔線寬度為父容器的 100%、高度 1px；垂直分隔線高度為父容器的 100%、寬度 1px。

## 無障礙

Divider 是純視覺元素，不攜帶語義角色，輔助技術會將其忽略；內容分組應透過標題等語義結構表達。
