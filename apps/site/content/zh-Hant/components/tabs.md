---
title: Tabs
description: 標籤頁切換一組同級面板，渲染在 pingo canvas 上。
---

# Tabs

標籤頁在同一區域內切換多個同級內容面板。下方預覽由 pingo 引擎即時渲染——可以點選標籤切換，或用左右方向鍵在標籤間移動。

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

`Tabs` 既支援非受控（`defaultValue`）也支援受控（`value` + `onValueChange`）兩種用法。

## Props

### Tabs

| Prop            | 型別                      | 預設值 | 說明                                    |
| --------------- | ------------------------- | ------ | --------------------------------------- |
| `value`         | `string`                  | —      | 受控：當前選中標籤的 `value`            |
| `defaultValue`  | `string`                  | —      | 非受控：初始選中標籤的 `value`          |
| `onValueChange` | `(value: string) => void` | —      | 選中變化回調                            |
| `children`      | `PingoNode`               | —      | `TabsList` 與若干 `TabsContent`（必填） |
| `className`     | `string`                  | —      | 追加在元件類名之後                      |

### TabsList

| Prop        | 型別        | 預設值 | 說明                       |
| ----------- | ----------- | ------ | -------------------------- |
| `children`  | `PingoNode` | —      | `TabsTrigger` 列表（必填） |
| `className` | `string`    | —      | 追加在元件類名之後         |

### TabsTrigger

| Prop        | 型別     | 預設值 | 說明                                    |
| ----------- | -------- | ------ | --------------------------------------- |
| `value`     | `string` | —      | 與對應 `TabsContent` 關聯的標識（必填） |
| `children`  | `string` | —      | 標籤文字（必填）                        |
| `className` | `string` | —      | 追加在元件類名之後                      |

### TabsContent

| Prop        | 型別        | 預設值 | 說明                                    |
| ----------- | ----------- | ------ | --------------------------------------- |
| `value`     | `string`    | —      | 與對應 `TabsTrigger` 關聯的標識（必填） |
| `children`  | `PingoNode` | —      | 面板內容（必填）                        |
| `className` | `string`    | —      | 追加在元件類名之後                      |

## 無障礙

標籤列表具備 tablist 語義、標籤具備 tab 語義並向輔助技術暴露選中狀態。左右方向鍵與 Home/End 在標籤間移動並同時選中，焦點隨選擇一起移動；未觸發的面板以 `display: none` 隱藏而非卸載，面板內的捲動位置與編輯狀態得以保留。
