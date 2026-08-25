---
title: Skeleton
description: 内容加载期间的占位骨架块，渲染在 pingo canvas 上。
---

# Skeleton

Skeleton 在内容加载完成前展示与最终布局形状相近的占位块，降低等待时的跳变感。下方预览由 pingo 引擎实时渲染，并跟随站点主题切换明暗。

:::preview skeleton-card
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Skeleton } from "@dopejs/pingo-ui";

root.render(createElement(Skeleton, { width: 320, height: 16 }));
```

`width` / `height` 均可省略，此时尺寸完全交给外层布局与你的样式表。

## 示例

### 组合成页面骨架

用多个不同尺寸的 Skeleton 拼出即将出现的内容结构——上方预览就是一个「头像 + 标题 + 两行正文」的卡片骨架。pingo 没有 gap 属性，块间距用固定尺寸的空容器实现，参见[样式指南](/guide/styling)。

## Props

| Prop        | 类型     | 默认值 | 说明                               |
| ----------- | -------- | ------ | ---------------------------------- |
| `width`     | `number` | —      | 占位块宽度（px），省略时由布局决定 |
| `height`    | `number` | —      | 占位块高度（px），省略时由布局决定 |
| `className` | `string` | —      | 追加在组件类名之后                 |

## 无障碍

Skeleton 是装饰性占位，不携带语义。加载完成后应整体替换为真实内容；长时间停留在骨架屏意味着加载失败，请给出错误提示与重试入口。

当前为静态占位（无脉冲动画）——核心动画子集暂不支持 CSS keyframes。
