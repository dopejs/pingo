---
title: Breadcrumb
description: shadcn 风格的面包屑导航，末项为当前页不可点击，渲染在 pingo canvas 上。
---

# Breadcrumb

面包屑导航：除末项外每一项都是可点击的链接，末项表示当前页——不渲染为链接，也不会向辅助技术提供"跳转到当前位置"的操作。下方预览由 pingo 引擎实时渲染——可以点击前序项目、用键盘激活，并跟随站点主题切换明暗。

:::preview breadcrumb-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Breadcrumb } from "@dopejs/pingo-ui";

root.render(
  createElement(Breadcrumb, {
    items: [
      { label: "首页", onNavigate: () => navigate("/") },
      { label: "组件", onNavigate: () => navigate("/components") },
      { label: "Breadcrumb" }, // 末项是当前页，无需 onNavigate
    ],
  }),
);
```

## 示例

### 自定义分隔符

`separator` 默认是 `/`，可以换成任意文本符号（在图标集落地前分隔符是文本字形）：

:::preview breadcrumb-separator
:::

## Props

### BreadcrumbProps

| Prop        | 类型                        | 默认值 | 说明                               |
| ----------- | --------------------------- | ------ | ---------------------------------- |
| `items`     | `readonly BreadcrumbItem[]` | —      | 面包屑项目，末项视为当前页（必填） |
| `separator` | `string`                    | `"/"`  | 项目之间的分隔符                   |
| `className` | `string`                    | —      | 追加在组件类名之后                 |

### BreadcrumbItem

| 字段         | 类型         | 默认值 | 说明                                                                       |
| ------------ | ------------ | ------ | -------------------------------------------------------------------------- |
| `label`      | `string`     | —      | 项目文案（必填）                                                           |
| `onNavigate` | `() => void` | —      | 点击回调；未提供时该项目不附带任何激活行为（末项本就视为当前页，无需提供） |

## 无障碍

面包屑整体是 `navigation` 语义、名称为 "breadcrumb"；可点击项为 link 语义，支持 `Enter` / `Space` 键盘激活，点击前会先聚焦。当前页渲染为纯文本并带 `current` 语义值，屏幕阅读器不会把它当作可跳转的链接。更多见[无障碍指南](/guide/accessibility)。
