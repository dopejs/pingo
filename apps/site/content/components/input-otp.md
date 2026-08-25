---
title: Input OTP
description: 定长一次性验证码输入，支持逐格输入与整段粘贴，渲染在 pingo canvas 上。
---

# Input OTP

一次性验证码输入，由若干定长格子组成。下方预览由 pingo 引擎实时渲染——可以逐格输入数字、粘贴整段验证码，并跟随站点主题切换明暗。

:::preview input-otp-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { InputOTP } from "@dopejs/pingo-ui";

root.render(
  createElement(InputOTP, {
    length: 6,
    semanticLabel: "一次性验证码",
    onValueChange: (value) => console.log(value),
    onComplete: (code) => verify(code),
  }),
);
```

内部值是一个**定长、以空格补齐**的字符串：空格代表空格位。`onValueChange` 收到的就是这个补齐后的值；`onComplete` 在所有格子填满时触发一次，收到的是去掉空格的完整验证码。粘贴会视为从当前格子开始的整段填充，删除只清空当前格而不左移后续数字。

## 示例

### 长度

`length` 决定格子数（默认 6）。每格使用数字软键盘（`inputMode: "numeric"`）。

## Props

| Prop            | 类型                      | 默认值  | 说明                                   |
| --------------- | ------------------------- | ------- | -------------------------------------- |
| `length`        | `number`                  | `6`     | 格子数量                               |
| `value`         | `string`                  | —       | 受控当前值（空格补齐）                 |
| `defaultValue`  | `string`                  | —       | 非受控初始值                           |
| `onValueChange` | `(value: string) => void` | —       | 值变化回调，值为空格补齐的定长字符串   |
| `onComplete`    | `(value: string) => void` | —       | 全部填满时回调，值为去空格的完整验证码 |
| `disabled`      | `boolean`                 | `false` | 禁用所有格子                           |
| `semanticLabel` | `string`                  | —       | 组的无障碍名称                         |
| `className`     | `string`                  | —       | 追加在组件类名之后                     |

## 无障碍

组件带 `group` 语义角色；每个格子自动获得 `序号/总数` 形式的无障碍名称（如 `3/6`），也可以通过 `semanticLabel` 命名整个组。
