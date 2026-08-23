---
title: Progress
description: 展示任务完成进度的进度条，渲染在 pingo canvas 上。
---

# Progress

Progress 用一条填充轨道展示确定性进度，如下载、上传或多步任务。下方预览由 pingo 引擎实时渲染，并跟随站点主题切换明暗。

:::preview progress-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Progress } from "@dopejs/pingo-ui";

root.render(createElement(Progress, { value: 60 }));
```

轨道宽度继承父容器，把 Progress 放在一个固定宽度的容器里即可控制条长：

```tsx
createElement("container", {
  width: 320,
  children: createElement(Progress, { value: 60 }),
});
```

## 示例

### 自定义最大值

`max` 默认 100。传入后按 `value / max` 计算填充百分比，并始终钳制在 0–100 之间：

```tsx
createElement(Progress, { value: 3, max: 10 }); // 30%
```

## Props

| Prop        | 类型     | 默认值 | 说明                           |
| ----------- | -------- | ------ | ------------------------------ |
| `value`     | `number` | —      | 当前进度（必填），越界会被钳制 |
| `max`       | `number` | `100`  | 最大值，最小按 1 处理          |
| `className` | `string` | —      | 追加在组件类名之后             |

## 无障碍

Progress 是纯视觉元素，未附带语义角色。如果进度对任务完成至关重要，请在旁边配合文本说明当前百分比或阶段名称。
