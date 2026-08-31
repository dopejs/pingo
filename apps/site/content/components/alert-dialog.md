---
title: Alert Dialog
description: 用于破坏性操作的确认对话框，内置取消/确认按钮对。
---

# Alert Dialog

确认对话框是内置了「取消 / 确认」按钮对的 Dialog，用于不可逆操作前的二次确认。下方预览由 pingo 引擎实时渲染，并跟随站点主题切换明暗。

:::preview alert-dialog-basic
:::

## 用法

```tsx
import { AlertDialog } from "@dopejs/pingo-ui";

root.render(
  <AlertDialog
    open={open}
    onOpenChange={(next) => setOpen(next)}
    title="确认退出？"
    description="未保存的修改将会丢失。"
    onCancel={() => {}}
    onAction={() => quit()}
  >
    {null}
  </AlertDialog>,
);
```

与 Dialog 一样，浮层填满它自己的父容器，请挂载在靠近根节点的位置。注意 `children` 继承自 `DialogProps` 仍为必填，但会被组件内置的标题/描述/按钮结构覆盖，传 `null` 即可。点击取消或确认按钮都会先触发对应回调，再通过 `onOpenChange(false)` 请求关闭；遮罩点击同样会关闭。

## 示例

### 破坏性操作

`destructive` 会把确认按钮渲染为危险色。

:::preview alert-dialog-destructive
:::

## Props

继承 `DialogProps`（`open`、`onOpenChange`、`children`、`className`），另有：

| Prop          | 类型         | 默认值   | 说明                 |
| ------------- | ------------ | -------- | -------------------- |
| `title`       | `string`     | —        | 标题（必填）         |
| `description` | `string`     | —        | 补充说明             |
| `cancelLabel` | `string`     | `"取消"` | 取消按钮文案         |
| `actionLabel` | `string`     | `"确定"` | 确认按钮文案         |
| `onCancel`    | `() => void` | —        | 取消回调（随后关闭） |
| `onAction`    | `() => void` | —        | 确认回调（随后关闭） |
| `destructive` | `boolean`    | `false`  | 确认按钮使用危险色   |

## 无障碍

具备 dialog 语义；取消与确认按钮都注册在 Tab 循环中，键盘用户不会被困在对话框里。
