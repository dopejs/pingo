---
title: ListRow
description: 列表行分子组件，组合头像、徽标等基础件与选中/禁用状态，渲染在 pingo canvas 上。
---

# ListRow

ListRow 是 pingo 特有的产品分子：一行列表项，标题与描述占据中间伸缩列，`leading`（头像、图标）与 `trailing`（徽标、开关、箭号）插槽分居两端。下方预览由 pingo 引擎实时渲染——可点击的行有完整的指针反馈，并跟随站点主题切换明暗。

:::preview list-row-basic
:::

与 shadcn 基础件的组合关系：ListRow 定义行布局与交互状态，不内置任何内容组件；`leading`/`trailing` 插槽接受任意 `PingoNode`，典型组合是 Avatar、Badge 或 Switch。相邻行间需要留白时，用固定高度的 container 做间距（pingo 没有 gap 属性）。

## 用法

```tsx
import { Avatar, Badge, ListRow } from "@dopejs/pingo-ui";

root.render(
  <ListRow
    title="张三"
    description="zhangsan@example.com"
    leading={<Avatar fallback="张" size={32} />}
    trailing={<Badge>管理员</Badge>}
    onPress={() => openMember("zhangsan")}
  />,
);
```

## 示例

### 选中与禁用

`selected` 应用选中样式并对外暴露选中状态；`disabled` 的行不携带任何事件处理器——比"处理器里再判断"更强。

:::preview list-row-states
:::

### 纯展示行

不传 `onPress` 时行为纯展示项：语义角色为 `listitem`，没有交互样式与事件。

## Props

| Prop          | 类型         | 默认值  | 说明                                              |
| ------------- | ------------ | ------- | ------------------------------------------------- |
| `title`       | `string`     | —       | 标题文本（必填）                                  |
| `description` | `string`     | —       | 次要描述文本                                      |
| `leading`     | `PingoNode`  | —       | 前部插槽，放头像或图标                            |
| `trailing`    | `PingoNode`  | —       | 尾部插槽，放徽标、开关或箭号                      |
| `selected`    | `boolean`    | —       | 选中态；传入即暴露 `selected`/`unselected` 语义值 |
| `disabled`    | `boolean`    | `false` | 禁用态，不注册任何事件处理器                      |
| `onPress`     | `() => void` | —       | 点击回调；传入后行变为可交互                      |
| `className`   | `string`     | —       | 追加在组件类名之后                                |

## 无障碍

可交互行具有 `button` 语义角色，纯展示行为 `listitem`；无障碍名称取 `title`。传入 `selected` 时暴露 `selected`/`unselected` 语义值。禁用行不携带任何指针/键盘处理器，对辅助技术呈现为纯静态项。
