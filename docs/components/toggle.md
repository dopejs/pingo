---
title: Toggle
description: 两态切换按钮，用于加粗、斜体等即时开关，渲染在 pingo canvas 上。
---

# Toggle

两态切换按钮，按下一次保持开启，再按一次关闭。下方预览由 pingo 引擎实时渲染——可以点按切换状态，并跟随站点主题切换明暗。

:::preview toggle-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Toggle } from "@dopejs/pingo-ui";

root.render(
  createElement(Toggle, {
    children: "加粗",
    defaultPressed: true,
    onPressedChange: (pressed) => console.log(pressed),
  }),
);
```

`Toggle` 内部通过 hooks 持有状态，必须用 `createElement` 以组件形式挂载。传入 `pressed` 即进入受控模式；否则用 `defaultPressed` 让组件自持状态。

## 示例

### 禁用

传入 `disabled` 后按钮不再响应指针与键盘，也不再接收 Enter/空格 激活。

## Props

| Prop              | 类型                         | 默认值  | 说明               |
| ----------------- | ---------------------------- | ------- | ------------------ |
| `children`        | `string`                     | —       | 按钮文本（必填）   |
| `pressed`         | `boolean`                    | —       | 受控按下状态       |
| `defaultPressed`  | `boolean`                    | `false` | 非受控初始按下状态 |
| `onPressedChange` | `(pressed: boolean) => void` | —       | 状态切换回调       |
| `disabled`        | `boolean`                    | `false` | 禁用态             |
| `className`       | `string`                     | —       | 追加在组件类名之后 |

## 无障碍

组件带 button 语义，语义值随状态在 `on` / `off` 间切换。指针按下时自动聚焦，`Enter` 与 `空格` 均可激活。
