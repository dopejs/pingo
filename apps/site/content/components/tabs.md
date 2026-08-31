---
title: Tabs
description: 标签页切换一组同级面板，渲染在 pingo canvas 上。
---

# Tabs

标签页在同一区域内切换多个同级内容面板。下方预览由 pingo 引擎实时渲染——可以点击标签切换，或用左右方向键在标签间移动。

:::preview tabs-basic
:::

## 用法

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@dopejs/pingo-ui";

root.render(
  <Tabs defaultValue="account">
    <TabsList>
      <TabsTrigger value="account">账户</TabsTrigger>
      <TabsTrigger value="password">密码</TabsTrigger>
    </TabsList>
    <TabsContent value="account">
      <text value="管理你的账户信息。" />
    </TabsContent>
    <TabsContent value="password">
      <text value="修改你的登录密码。" />
    </TabsContent>
  </Tabs>,
);
```

`Tabs` 既支持非受控（`defaultValue`）也支持受控（`value` + `onValueChange`）两种用法。

## Props

### Tabs

| Prop            | 类型                      | 默认值 | 说明                                    |
| --------------- | ------------------------- | ------ | --------------------------------------- |
| `value`         | `string`                  | —      | 受控：当前选中标签的 `value`            |
| `defaultValue`  | `string`                  | —      | 非受控：初始选中标签的 `value`          |
| `onValueChange` | `(value: string) => void` | —      | 选中变化回调                            |
| `children`      | `PingoNode`               | —      | `TabsList` 与若干 `TabsContent`（必填） |
| `className`     | `string`                  | —      | 追加在组件类名之后                      |

### TabsList

| Prop        | 类型        | 默认值 | 说明                       |
| ----------- | ----------- | ------ | -------------------------- |
| `children`  | `PingoNode` | —      | `TabsTrigger` 列表（必填） |
| `className` | `string`    | —      | 追加在组件类名之后         |

### TabsTrigger

| Prop        | 类型     | 默认值 | 说明                                    |
| ----------- | -------- | ------ | --------------------------------------- |
| `value`     | `string` | —      | 与对应 `TabsContent` 关联的标识（必填） |
| `children`  | `string` | —      | 标签文本（必填）                        |
| `className` | `string` | —      | 追加在组件类名之后                      |

### TabsContent

| Prop        | 类型        | 默认值 | 说明                                    |
| ----------- | ----------- | ------ | --------------------------------------- |
| `value`     | `string`    | —      | 与对应 `TabsTrigger` 关联的标识（必填） |
| `children`  | `PingoNode` | —      | 面板内容（必填）                        |
| `className` | `string`    | —      | 追加在组件类名之后                      |

## 无障碍

标签列表具备 tablist 语义、标签具备 tab 语义并向辅助技术暴露选中状态。左右方向键与 Home/End 在标签间移动并同时选中，焦点随选择一起移动；未激活的面板以 `display: none` 隐藏而非卸载，面板内的滚动位置与编辑状态得以保留。
