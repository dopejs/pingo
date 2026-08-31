---
title: Command
description: 可搜索过滤的命令面板，支持键盘选择与回车确认。
---

# Command

Command 是带搜索框的命令面板：输入即时过滤条目，方向键移动光标，回车确认。下方预览由 pingo 引擎实时渲染——直接在搜索框输入即可过滤，并跟随站点主题切换明暗。

:::preview command-basic
:::

## 用法

```tsx
import { Command } from "@dopejs/pingo-ui";

root.render(
  <Command
    items={[
      { value: "open", label: "打开文件" },
      { value: "save", label: "保存文件" },
    ]}
    onSelect={(value) => run(value)}
    onDismiss={() => closePalette()}
  />,
);
```

过滤是大小写不敏感的标签子串匹配——刻意的非模糊匹配：排序策略属于产品决策，组件不替调用方做。`onDismiss` 在未匹配到导航键时响应 `Escape`，适合把面板包在 Dialog 里做「⌘K」体验。

## Props

| Prop          | 类型                      | 默认值     | 说明                       |
| ------------- | ------------------------- | ---------- | -------------------------- |
| `items`       | `readonly CommandItem[]`  | —          | 命令条目（必填）           |
| `onSelect`    | `(value: string) => void` | —          | 选择条目回调（点击或回车） |
| `onDismiss`   | `() => void`              | —          | `Escape` 回调              |
| `placeholder` | `string`                  | `"搜索"`   | 搜索框的无障碍名称         |
| `emptyLabel`  | `string`                  | `"无结果"` | 过滤为空时的提示文案       |
| `className`   | `string`                  | —          | 追加类名                   |

### CommandItem

| 字段    | 类型     | 说明                   |
| ------- | -------- | ---------------------- |
| `value` | `string` | 条目值（必填）         |
| `label` | `string` | 显示与匹配文案（必填） |

## 无障碍

容器具备 search 语义，条目具备 option 语义并暴露 selected 状态；上下方向键移动光标，`Enter` 确认，`Escape` 触发 `onDismiss`。
