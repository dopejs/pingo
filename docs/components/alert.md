---
title: Alert
description: 展示重要提示信息的callout区块，渲染在 pingo canvas 上。
---

# Alert

Alert 用于在页面中展示需要用户注意、但不打断流程的提示信息。下方预览由 pingo 引擎实时渲染，并跟随站点主题切换明暗。

:::preview alert-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Alert } from "@dopejs/pingo-ui";

root.render(
  createElement(Alert, {
    title: "提示",
    children: "你的配置已自动保存。",
  }),
);
```

## 示例

### 破坏性提示

`variant="destructive"` 用于错误或失败场景：边框与标题变为破坏性配色，描述文字保持常规前景色以保证可读性。

```tsx
createElement(Alert, {
  title: "同步失败",
  variant: "destructive",
  children: "请检查网络连接后重试。",
});
```

## Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | — | 标题（必填） |
| `children` | `string` | — | 描述正文（必填） |
| `variant` | `"default" \| "destructive"` | `"default"` | 视觉变体 |
| `className` | `string` | — | 追加在组件类名之后 |

## 无障碍

Alert 是纯静态文本区块，不抢焦点；请用简洁的 `title` 概括结论，把细节放在描述中。需要用户确认或处理的场景请改用 `AlertDialog`。
