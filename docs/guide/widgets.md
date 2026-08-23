---
title: Widgets：无样式引擎构件
description: "@dopejs/pingo-widgets 提供 TextField、TextArea、Pressable、Button 等无样式引擎级构件，以及与 @dopejs/pingo-ui 的边界。"
---

# Widgets：无样式引擎构件

`@dopejs/pingo-widgets` 是引擎之上的第一层组合：它把
[可编辑原语](/guide/elements-editing)与焦点、原生事件装配成可用构件，附带**最小**
装饰（边框、错误态），不假设任何设计系统。业务不直接依赖这个内部包——全部导出都经
`@dopejs/pingo` 再导出。下方预览实时渲染、可直接输入。

:::preview widgets-textfield
:::

## 导出与命名

| 导出        | 说明                                                        |
| ----------- | ----------------------------------------------------------- |
| `TextField` | 单行输入：边框 + 错误态装饰，内部只组合 `editableText` 原语 |
| `TextArea`  | 多行变体；Enter 换行，submit 留给宿主表单                   |
| `Pressable` | 可聚焦的激活表面：View + 焦点 + 原生 click/tap              |
| `Button`    | `Pressable` + `Text` 的文本按钮便捷组合                     |

命名注意：`@dopejs/pingo` 里的 `TextArea` 指这个带装饰的 widget；多行**原语**以
`UnstyledTextArea` 导出（`TextAreaProps` 同理有别名 `UnstyledTextAreaProps`）。

## TextField 与 TextArea

默认装饰是 1px 边框、8px 内边距；传入 `error` 字符串时切换为错误色边框，并在字段下方
渲染一条 `alert` 角色的错误说明。受控契约（`value` + `revision` + `onTransaction`）与
[可编辑元素](/guide/elements-editing)完全相同——widget 不引入新的输入路径。

```tsx
import { createElement, TextField } from "@dopejs/pingo";

createElement(TextField, {
  value,
  revision,
  semanticLabel: "收件人",
  width: 320,
  error: value === "" ? "收件人不能为空" : undefined,
  onTransaction: (t) => apply(t),
});
```

### Props（TextField）

| Prop              | 类型                           | 默认值                   | 说明                                        |
| ----------------- | ------------------------------ | ------------------------ | ------------------------------------------- |
| `value`           | `string`                       | `""`                     | 受控文本                                    |
| `revision`        | `number \| bigint`             | `0n`                     | 受控值的权威 revision                       |
| `controller`      | `TextEditingController`        | —                        | 本地 controller；与 `value`/`revision` 互斥 |
| `readOnly`        | `boolean`                      | —                        | 只读                                        |
| `password`        | `boolean`                      | —                        | 密码模式（明文不进 DisplayList 与无障碍值） |
| `maxGraphemes`    | `number`                       | —                        | grapheme 上限                               |
| `inputMode`       | `EditableInputMode`            | —                        | 软键盘布局提示                              |
| `width`           | `number`                       | `240`                    | 含边框的整体宽度                            |
| `height`          | `number`                       | `lineHeight × rows + 16` | 含边框的整体高度                            |
| `fontSize`        | `number`                       | `14`                     | 字号                                        |
| `lineHeight`      | `number`                       | `round(fontSize × 1.5)`  | 行高                                        |
| `color`           | `Color`                        | `#1f2329ff`              | 文本颜色                                    |
| `backgroundColor` | `Color`                        | `#ffffffff`              | 字段底色                                    |
| `borderColor`     | `Color`                        | `#c0c4ccff`              | 边框颜色                                    |
| `errorColor`      | `Color`                        | `#d03050ff`              | 错误态边框与说明颜色                        |
| `error`           | `string`                       | —                        | 非空即错误态：错误色边框 + 下方错误说明     |
| `onTransaction`   | `(t: EditTransaction) => void` | —                        | Core 编辑事务回调                           |
| `onSubmit`        | `() => void`                   | —                        | 单行 Enter 提交                             |
| `semanticLabel`   | `string`                       | —                        | 无障碍名称（角色恒为 `textbox`）            |

`TextArea` 在此基础上多一个 `rows`（默认 `3`），用于计算默认高度。

## Pressable 与 Button

`Pressable` 不引入新的 Scene 节点种类：它就是一个带 `button` 语义、按下时自动取焦点、
把原生 click/tap 映射成 `onPress` 的 `View`。样式完全由 `style` 与 `children` 决定，
`disabled` 时降透明度并摘除事件。

| Prop               | 类型         | 默认值                 | 说明                                       |
| ------------------ | ------------ | ---------------------- | ------------------------------------------ |
| `children`         | `PingoNode`  | —                      | 内容（Button 为 `string \| number`，必填） |
| `disabled`         | `boolean`    | `false`                | 禁用态                                     |
| `onPress`          | `() => void` | —                      | 激活回调                                   |
| `className`        | `string`     | —                      | 类名（接样式表）                           |
| `style`            | `PingoStyle` | —                      | 内联样式                                   |
| `width` / `height` | `number`     | —                      | 尺寸                                       |
| `semanticLabel`    | `string`     | `Button` 取 `children` | 无障碍名称                                 |

`Button` 额外接受 `color` 与 `fontSize`（传给内部文本）。

## 与 @dopejs/pingo-ui 的边界

两层回答不同的问题：

- **widgets** —— 行为正确性：编辑事务、焦点、语义角色、最小装饰。不含任何设计意见，
  颜色字号全部可覆写。
- **@dopejs/pingo-ui** —— 设计系统：shadcn 心智的完整组件（变体、尺寸、主题、样式表），
  内部组合 widgets、`@dopejs/pingo-editing` 与运行时 hooks，对引擎零改动。

选型建议：要现成的设计系统，直接用 [pingo-ui 组件](/components)；自带设计语言但不想
碰编辑事务细节，用 widgets 做地基；完全自定义（如游戏 HUD），直接用
[基础元素](/guide/elements)原语。

## 无障碍

`TextField` / `TextArea` 自带 `textbox` 角色，`error` 说明为 `alert` 角色；
`Pressable` / `Button` 为 `button` 角色，`disabled` 通过 `semanticValue` 暴露。
名称都靠 `semanticLabel`——没有可见 label 时不要省略。详见[无障碍](/guide/accessibility)。
