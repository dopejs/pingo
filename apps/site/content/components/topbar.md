---
title: TopBar
description: 应用顶栏分子组件，由标题与前后插槽组合而成，渲染在 pingo canvas 上。
---

# TopBar

TopBar 是 pingo 特有的产品分子：把标题与 `leading`（logo、返回）和 `actions`（按钮、头像）两个插槽组合成一行应用顶栏。标题列始终占据剩余空间（`flexGrow`），把 actions 推到最右端——无需任何测量。下方预览由 pingo 引擎实时渲染，跟随站点主题切换明暗。

:::preview topbar-basic
:::

与 shadcn 基础件的组合关系：TopBar 本身不提供按钮或头像，它定义的是**布局骨架**；`leading` 与 `actions` 插槽接受任意 `PingoNode`，通常组合 [Button](/components/button)、IconButton、Avatar 等基础件。多个 action 用一个 `flexDirection: "row"` 的 container 包起来传入。

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Avatar, Button, TopBar } from "@dopejs/pingo-ui";

root.render(
  createElement(TopBar, {
    title: "仪表盘",
    leading: createElement(Avatar, { fallback: "P", size: 28 }),
    actions: createElement(Button, {
      children: "新建",
      variant: "outline",
      onPress: () => create(),
    }),
  }),
);
```

## 示例

### 无标题

省略 `title` 时标题列仍会渲染（一个空的伸缩列），actions 依旧被推到右端；适合只有操作区的工具条。

```tsx
createElement(TopBar, {
  actions: createElement(Button, { children: "导出", onPress: () => {} }),
});
```

## Props

| Prop        | 类型        | 默认值 | 说明                         |
| ----------- | ----------- | ------ | ---------------------------- |
| `title`     | `string`    | —      | 标题文本；省略时渲染空伸缩列 |
| `leading`   | `PingoNode` | —      | 前部插槽，放 logo 或返回按钮 |
| `actions`   | `PingoNode` | —      | 尾部插槽，被标题列推到最右端 |
| `className` | `string`    | —      | 追加在组件类名之后           |

## 无障碍

TopBar 具有 `banner` 语义角色；提供 `title` 时标题文本带 `heading` 角色。插槽内组件的无障碍属性（如 IconButton 的 `semanticLabel`）由各自组件负责。
