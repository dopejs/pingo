---
title: Menubar
description: 桌面风格的应用菜单栏，多个菜单共享一个打开位。
---

# Menubar

Menubar 是一排共享同一个打开位的菜单，类似桌面应用的菜单栏。下方预览由 pingo 引擎实时渲染——点击「文件」「编辑」等标签即可开合对应菜单，并跟随站点主题切换明暗。

:::preview menubar-basic
:::

## 用法

```tsx
import { Menubar, MenubarMenu } from "@dopejs/pingo-ui";

root.render(
  <Menubar onValueChange={(value) => {}}>
    <MenubarMenu value="file" label="文件">
      <text value="新建" />
    </MenubarMenu>
    <MenubarMenu value="edit" label="编辑">
      <text value="撤销" />
    </MenubarMenu>
  </Menubar>,
);
```

`MenubarMenu` 通过 context 读取菜单栏状态，必须作为 `Menubar` 的子节点；其 `children` 是打开时显示的面板内容。开合默认非受控，传入 `value` 即切换为受控模式（值为当前打开菜单的 `value`）。

## 示例

### 受控打开

传入 `value` 固定打开的菜单，常用于初始引导或外部状态同步。

:::preview menubar-open
:::

## Props

### Menubar

| Prop            | 类型                                   | 默认值  | 说明                                                                   |
| --------------- | -------------------------------------- | ------- | ---------------------------------------------------------------------- |
| `value`         | `string`                               | —       | 受控：当前打开菜单的值                                                 |
| `onValueChange` | `(value: string \| undefined) => void` | —       | 打开菜单变化回调（关闭时为 `undefined`）                               |
| `children`      | `PingoNode`                            | —       | 若干 `MenubarMenu`（必填）                                             |
| `className`     | `string`                               | —       | 追加类名                                                               |
| `navigation`    | `boolean`                              | `false` | 使用导航语义（[NavigationMenu](/components/navigation-menu) 内部使用） |

### MenubarMenu

| Prop        | 类型        | 默认值 | 说明                     |
| ----------- | ----------- | ------ | ------------------------ |
| `value`     | `string`    | —      | 菜单标识（必填）         |
| `label`     | `string`    | —      | 栏上显示的标签（必填）   |
| `children`  | `PingoNode` | —      | 打开时的面板内容（必填） |
| `className` | `string`    | —      | 追加类名                 |

## 无障碍

菜单栏具备 menubar 语义，标签具备 menuitem 语义并暴露 expanded/collapsed 状态；左右方向键在菜单间移动，菜单打开时同样切换，`Escape` 关闭并聚焦当前标签。
