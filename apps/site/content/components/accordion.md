---
title: Accordion
description: 单次展开一项的垂直堆叠手风琴，渲染在 pingo canvas 上。
---

# Accordion

手风琴把相关内容组织成可展开收起的垂直分组，同一时间只展开一项。下方预览由 pingo 引擎实时渲染——可以点击标题切换，或用方向键移动焦点、Enter/空格展开。

:::preview accordion-basic
:::

## 用法

```tsx
import { Accordion, AccordionItem } from "@dopejs/pingo-ui";

root.render(
  <Accordion defaultOpenValue="intro">
    <AccordionItem value="intro" title="什么是 pingo-ui？">
      <text value="渲染在 pingo canvas 上的组件库。" />
    </AccordionItem>
    <AccordionItem value="theme" title="支持暗色主题吗？">
      <text value="支持，跟随主题自动切换。" />
    </AccordionItem>
  </Accordion>,
);
```

`Accordion` 既支持非受控（`defaultOpenValue`）也支持受控（`openValue` + `onValueChange`）两种用法。

## Props

### Accordion

| Prop               | 类型                                   | 默认值 | 说明                                     |
| ------------------ | -------------------------------------- | ------ | ---------------------------------------- |
| `openValue`        | `string`                               | —      | 受控：当前展开项的 `value`               |
| `defaultOpenValue` | `string`                               | —      | 非受控：初始展开项的 `value`             |
| `onValueChange`    | `(value: string \| undefined) => void` | —      | 展开项变化回调；全部收起时为 `undefined` |
| `children`         | `PingoNode`                            | —      | `AccordionItem` 列表（必填）             |
| `className`        | `string`                               | —      | 追加在组件类名之后                       |

### AccordionItem

| Prop        | 类型        | 默认值 | 说明                     |
| ----------- | ----------- | ------ | ------------------------ |
| `value`     | `string`    | —      | 项的唯一标识（必填）     |
| `title`     | `string`    | —      | 触发器标题（必填）       |
| `children`  | `PingoNode` | —      | 展开后显示的内容（必填） |
| `className` | `string`    | —      | 追加在组件类名之后       |

## 无障碍

方向键（上/下）在标题之间移动焦点但不改变展开状态，Home/End 跳到首尾；Enter 或空格切换展开——符合 WAI-ARIA 对焦点与选中分离的要求。内容区域收起时以 `display: none` 隐藏而非卸载，展开状态得以保留。
