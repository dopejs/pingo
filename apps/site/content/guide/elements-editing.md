---
title: 可编辑元素：Input 与 TextArea
description: 引擎原生可编辑文本原语——受控 revision 事务契约、EditContext 输入桥、密码与只读。
---

# 可编辑元素：Input 与 TextArea

`Input` 与 `TextArea`（在 `@dopejs/pingo` 中以 `UnstyledTextArea` 导出，见下）是引擎原生
的可编辑文本原语：caret、选区、IME composition、剪贴板与撤销重做都由 Core 实现，
**不需要在 canvas 上盖任何 HTML 输入控件**。下方预览是真实可输入的——点击聚焦，试试
中文输入法、拖选与 Ctrl+Z。

:::preview elements-input
:::

## 用法

受控写法：`value` + 单调递增的 `revision`，在 `onTransaction` 里确认 Core 发来的事务：

```tsx
import { Input, type EditTransaction } from "@dopejs/pingo";

let value = "订单备注";
let revision = 1n;

function applyDelta(current: string, transaction: EditTransaction): string {
  const delta = transaction.delta;
  return delta === undefined
    ? current
    : current.slice(0, delta.range.start) + delta.text + current.slice(delta.range.end);
}

<Input
  value={value}
  revision={revision}
  semanticLabel="订单备注"
  onTransaction={(transaction) => {
    value = applyDelta(value, transaction);
    revision = transaction.revision;
  }}
/>;
```

纯本地状态也可以不传 `value` / `revision`，改用 `TextEditingController`
（hooks 场景用 `useTextEditingController`）；`controller` 与 `value`/`revision` 互斥。

## revision 事务契约

状态所有权是明确的：**Shell 拥有业务数据，Core 拥有活动编辑会话的瞬时状态。**

1. 输入到达 Core，校验 `base_revision` 匹配当前会话；
2. 通过后**立即应用并重绘**——每次按键不需要走一遍完整的渲染管线；
3. Core 反向发出版本化的 `EditTransaction`；
4. Shell 确认（更新自己的 `value` / `revision`），或在业务校验失败时发送带新
   `revision` 的校正值。过期 revision 永远不会覆盖更新的 Core 输入；相同 revision 的
   确认不清空撤销栈。

`EditTransaction` 的字段：

| 字段           | 类型                                                        | 说明                                                                     |
| -------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------ |
| `nodeId`       | `number`                                                    | 产生事务的编辑节点                                                       |
| `baseRevision` | `bigint`                                                    | 事务基于的 revision                                                      |
| `revision`     | `bigint`                                                    | 事务后的新 revision                                                      |
| `delta`        | `{ range: { start, end }, text }`                           | 文本差异；偏移为 UTF-16，对齐 EditContext/InputEvent。纯选区事务无此字段 |
| `selection`    | `{ anchor, focus, anchorAffinity, focusAffinity }`          | 事务后的选区                                                             |
| `composition`  | `{ start, end }`                                            | 进行中的 IME 组合区间                                                    |
| `kind`         | `"edit" \| "composition" \| "external" \| "undo" \| "redo"` | 事务类别                                                                 |

## 输入桥：EditContext 与降级代理

主线程按优先级连接操作系统的文本输入服务：

1. **EditContext** —— 绑定 canvas，接收文本/选区/composition，并向输入法回报 control、
   selection 与字符边界，候选窗因此能贴在 caret 旁。
2. **引擎托管的输入代理** —— EditContext 不可用时，宿主维护**一个**全局隐藏的
   `textarea` 统一处理 `beforeinput`、composition、软键盘与剪贴板。

这是平台降级实现，不是 EmbedDOM 组件模型：Scene 里不存在与每个编辑节点一一对应的
DOM。两条路径过同一套编辑行为契约测试。

## 多行：TextArea 原语

`TextArea` 原语与 `Input` 共享同一个 `editableText` 子系统，唯一差别是 `multiline`
不变量由组件固定。Enter 插入换行而不触发 `onSubmit`；上下方向键跨行移动时保持期望列
（desired-x）。

:::preview elements-textarea
:::

## Props（Input / UnstyledTextArea）

二者共享 `EditableTextProps`（`multiline` 不对外，由组件固定）：

| Prop            | 类型                           | 默认值   | 说明                                                                       |
| --------------- | ------------------------------ | -------- | -------------------------------------------------------------------------- |
| `value`         | `string`                       | —        | 受控文本                                                                   |
| `revision`      | `number \| bigint`             | —        | 受控值的权威 revision；过期值不会覆盖更新的 Core 输入                      |
| `controller`    | `TextEditingController`        | —        | 稳定的本地 controller；与 `value`/`revision` 互斥                          |
| `readOnly`      | `boolean`                      | `false`  | 只读：仍可聚焦、有光标，可选中复制                                         |
| `disabled`      | `boolean`                      | `false`  | 禁用：不开启编辑会话，因此不接受焦点、不显示光标、不接入输入法             |
| `password`      | `boolean`                      | `false`  | 密码模式（见下）                                                           |
| `maxGraphemes`  | `number`                       | —        | grapheme 上限                                                              |
| `inputMode`     | `EditableInputMode`            | `"text"` | 软键盘提示：`decimal` `email` `none` `numeric` `search` `tel` `text` `url` |
| `onTransaction` | `(t: EditTransaction) => void` | —        | Core 编辑事务回调                                                          |
| `onSubmit`      | `() => void`                   | —        | 单行 Enter 提交；多行的 Enter 留给换行                                     |

文本外观继承 `TextProps`：`color`、`fontSize`、`fontWeight`、`lineHeight`、`fontFamily`、
`font`；尺寸、`padding`、`backgroundColor`、边框（`style` 通道）等来自
[CommonProps](/api)。

## 无障碍与隐私

- 编辑节点自带 `textbox` 语义；用 `semanticLabel` 提供名称（没有可见 label 时尤其重要）。
- 密码内容只在 Core 内以遮罩字形绘制：明文不进入 DisplayList、录制回放、devtools 或
  无障碍值，密码目标也不写剪贴板。

更深入的设计（文本位置模型、bidi 边界、契约测试矩阵）见[文本与编辑](/guide/editing)。
