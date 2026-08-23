---
title: Switch
description: 可受控也可自持状态的开关控件，用于即时生效的布尔设置，渲染在 pingo canvas 上。
---

# Switch

开关用于即时生效的布尔设置。下方预览由 pingo 引擎实时渲染，可以直接点击，并跟随站点主题切换明暗。不传 `checked` 时组件自己持有状态（`defaultChecked` 给初始值）；传了 `checked` 就由调用方持有，组件只负责回调。

:::preview switch-basic
:::

## 用法

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { Switch } from "@dopejs/pingo-ui";

// useSignal 是 hook，必须运行在组件作用域内。
function AirplaneMode(): PingoNode {
  const on = useSignal(false);
  return createElement(Switch, {
    checked: on.get(),
    semanticLabel: "飞行模式",
    onCheckedChange: (next) => on.set(next),
  });
}

root.render(createElement(AirplaneMode));
```

`checked` 由父组件持有，`onCheckedChange` 负责更新它。不需要外部状态时省略 `checked`，组件会自己记住，与 Slider、Tabs、Collapsible 一致：

```tsx
createElement(Switch, { defaultChecked: true, semanticLabel: "飞行模式" });
```

注意受控用法必须真的更新 `checked`：传了 `checked` 却忽略 `onCheckedChange`，开关永远不会动，看上去就像点不动。

## 示例

### 禁用

传入 `disabled` 后开关不再响应指针与键盘，语义值变为 `disabled`。

## Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `checked` | `boolean` | — | 开关状态（受控用法；省略则组件自持） |
| `defaultChecked` | `boolean` | `false` | 自持状态时的初始值 |
| `onCheckedChange` | `(checked: boolean) => void` | — | 状态切换回调 |
| `disabled` | `boolean` | `false` | 禁用态 |
| `className` | `string` | — | 追加在组件类名之后 |
| `semanticLabel` | `string` | — | 无障碍名称 |

## 无障碍

组件带 `switch` 语义角色，语义值随状态在 `on` / `off` / `disabled` 间切换。指针按下时自动聚焦。开关没有可见文字，请始终提供 `semanticLabel`。
