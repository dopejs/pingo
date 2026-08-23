---
title: Checkbox
description: 可受控也可自持状态的多选框，可带文字标签，渲染在 pingo canvas 上。
---

# Checkbox

多选框用于独立的布尔开关。下方预览由 pingo 引擎实时渲染，可以直接点击，并跟随站点主题切换明暗。不传 `checked` 时组件自己持有状态（`defaultChecked` 给初始值）；传了 `checked` 就由调用方持有，组件只负责回调。

:::preview checkbox-basic
:::

## 用法

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { Checkbox } from "@dopejs/pingo-ui";

// useSignal 是 hook，必须运行在组件作用域内。
function NotificationSetting(): PingoNode {
  const enabled = useSignal(false);
  return createElement(Checkbox, {
    checked: enabled.get(),
    label: "已启用通知",
    onCheckedChange: (next) => enabled.set(next),
  });
}

root.render(createElement(NotificationSetting));
```

`checked` 由父组件持有，`onCheckedChange` 负责更新它。不需要外部状态时省略 `checked`，组件会自己记住，与 Slider、Tabs、Collapsible 一致：

```tsx
createElement(Checkbox, { defaultChecked: true, label: "已启用通知" });
```

注意受控用法必须真的更新 `checked`：传了 `checked` 却忽略 `onCheckedChange`，控件永远不会变化，看上去就像点不动。`label` 可选，提供后会在选框右侧渲染文字。

## 示例

### 禁用

传入 `disabled` 后选框不再响应指针与键盘，语义值变为 `disabled`。

## Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `checked` | `boolean` | — | 选中状态（受控用法；省略则组件自持） |
| `defaultChecked` | `boolean` | `false` | 自持状态时的初始值 |
| `onCheckedChange` | `(checked: boolean) => void` | — | 状态切换回调 |
| `disabled` | `boolean` | `false` | 禁用态 |
| `label` | `string` | — | 选框右侧的文字标签 |
| `className` | `string` | — | 追加在组件类名之后 |
| `semanticLabel` | `string` | — | 无障碍名称 |

## 无障碍

组件带 `checkbox` 语义角色，语义值随状态在 `checked` / `unchecked` / `disabled` 间切换。指针按下时自动聚焦。✓ 指示符依赖字体字形覆盖，在图标资产就绪前作为占位实现。
