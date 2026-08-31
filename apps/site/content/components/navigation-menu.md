---
title: Navigation Menu
description: 站点导航风格的菜单栏，行为与 Menubar 一致、语义为导航。
---

# Navigation Menu

Navigation Menu 是导航语义版的 [Menubar](/components/menubar)：同样的触发器行与展开面板，但对外暴露 navigation 语义，适合站点主导航。下方预览由 pingo 引擎实时渲染，并跟随站点主题切换明暗。

:::preview navigation-menu-basic
:::

## 用法

```tsx
import { MenubarMenu, NavigationMenu } from "@dopejs/pingo-ui";

root.render(
  <NavigationMenu onValueChange={(value) => {}}>
    <MenubarMenu value="products" label="产品">
      <text value="渲染引擎" />
    </MenubarMenu>
    <MenubarMenu value="docs" label="文档">
      <text value="快速开始" />
    </MenubarMenu>
  </NavigationMenu>,
);
```

条目复用 `MenubarMenu`。开合默认非受控，传入 `value` 即切换为受控模式。交互行为（键盘导航、打开位共享）与 Menubar 完全一致。

## Props

`NavigationMenu` 接受 `MenubarProps` 中除 `navigation` 外的全部 props：

| Prop            | 类型                                   | 默认值 | 说明                                     |
| --------------- | -------------------------------------- | ------ | ---------------------------------------- |
| `value`         | `string`                               | —      | 受控：当前打开菜单的值                   |
| `onValueChange` | `(value: string \| undefined) => void` | —      | 打开菜单变化回调（关闭时为 `undefined`） |
| `children`      | `PingoNode`                            | —      | 若干 `MenubarMenu`（必填）               |
| `className`     | `string`                               | —      | 追加类名                                 |

条目 props 见 [Menubar](/components/menubar#menubarmenu)。

## 无障碍

容器具备 navigation 语义，标签具备 menuitem 语义并暴露 expanded/collapsed 状态；左右方向键在条目间移动，`Escape` 关闭并聚焦当前标签。
