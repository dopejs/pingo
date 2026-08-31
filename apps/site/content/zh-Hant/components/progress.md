---
title: Progress
description: 展示任務完成進度的進度條，渲染在 pingo canvas 上。
---

# Progress

Progress 用一條填充軌道展示確定性進度，如下載、上傳或多步任務。下方預覽由 pingo 引擎即時渲染，並跟隨網站主題切換明暗。

:::preview progress-basic
:::

## 用法

```tsx
import { Progress } from "@dopejs/pingo-ui";

root.render(<Progress value={60} />);
```

軌道寬度繼承父容器，把 Progress 放在一個固定寬度的容器裡即可控制條長：

```tsx
<container width={320}>
  <Progress value={60} />
</container>
```

## 示例

### 自訂最大值

`max` 預設 100。傳入後按 `value / max` 計算填充百分比，並始終鉗制在 0–100 之間：

```tsx
<Progress value={3} max={10} /> // 30%
```

## Props

| Prop        | 型別     | 預設值 | 說明                           |
| ----------- | -------- | ------ | ------------------------------ |
| `value`     | `number` | —      | 當前進度（必填），越界會被鉗制 |
| `max`       | `number` | `100`  | 最大值，最小按 1 處理          |
| `className` | `string` | —      | 追加在元件類名之後             |

## 無障礙

Progress 是純視覺元素，未附帶語義角色。如果進度對任務完成至關重要，請在旁邊配合文字說明當前百分比或階段名稱。
