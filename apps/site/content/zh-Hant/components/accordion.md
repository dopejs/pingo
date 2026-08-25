---
title: Accordion
description: 單次展開一項的垂直堆疊手風琴，渲染在 pingo canvas 上。
---

# Accordion

手風琴把相關內容組織成可展開收起的垂直分組，同一時間只展開一項。下方預覽由 pingo 引擎即時渲染——可以點選標題切換，或用方向鍵移動焦點、Enter/空格展開。

:::preview accordion-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Accordion, AccordionItem } from "@dopejs/pingo-ui";

root.render(
  createElement(Accordion, {
    defaultOpenValue: "intro",
    children: [
      createElement(AccordionItem, {
        value: "intro",
        title: "什么是 pingo-ui？",
        children: createElement("text", { value: "渲染在 pingo canvas 上的组件库。" }),
      }),
      createElement(AccordionItem, {
        value: "theme",
        title: "支持暗色主题吗？",
        children: createElement("text", { value: "支持，跟随主题自动切换。" }),
      }),
    ],
  }),
);
```

`Accordion` 既支援非受控（`defaultOpenValue`）也支援受控（`openValue` + `onValueChange`）兩種用法。

## Props

### Accordion

| Prop               | 型別                                   | 預設值 | 說明                                     |
| ------------------ | -------------------------------------- | ------ | ---------------------------------------- |
| `openValue`        | `string`                               | —      | 受控：當前展開項的 `value`               |
| `defaultOpenValue` | `string`                               | —      | 非受控：初始展開項的 `value`             |
| `onValueChange`    | `(value: string \| undefined) => void` | —      | 展開項變化回調；全部收起時為 `undefined` |
| `children`         | `PingoNode`                            | —      | `AccordionItem` 列表（必填）             |
| `className`        | `string`                               | —      | 追加在元件類名之後                       |

### AccordionItem

| Prop        | 型別        | 預設值 | 說明                     |
| ----------- | ----------- | ------ | ------------------------ |
| `value`     | `string`    | —      | 項的唯一標識（必填）     |
| `title`     | `string`    | —      | 觸發器標題（必填）       |
| `children`  | `PingoNode` | —      | 展開後顯示的內容（必填） |
| `className` | `string`    | —      | 追加在元件類名之後       |

## 無障礙

方向鍵（上/下）在標題之間移動焦點但不改變展開狀態，Home/End 跳到首尾；Enter 或空格切換展開——符合 WAI-ARIA 對焦點與選中分離的要求。內容區域收起時以 `display: none` 隱藏而非卸載，展開狀態得以保留。
