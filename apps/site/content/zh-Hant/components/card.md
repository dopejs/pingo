---
title: Card
description: 組合式卡片容器：Header、Title、Description、Content、Footer，渲染在 pingo canvas 上。
---

# Card

卡片把相關內容聚合在一個帶邊框與陰影的容器裡，由六個可組合的槽位構成。下方預覽由 pingo 引擎即時渲染，並跟隨網站主題切換明暗。

:::preview card-basic
:::

## 用法

```tsx
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@dopejs/pingo-ui";

root.render(
  <Card>
    <CardHeader>
      <CardTitle>账户设置</CardTitle>
      <CardDescription>管理你的账户偏好与通知。</CardDescription>
    </CardHeader>
    <CardContent>
      <text value="卡片正文内容。" />
    </CardContent>
    <CardFooter>
      <Button onPress={() => {}}>保存</Button>
    </CardFooter>
  </Card>,
);
```

所有槽位都是可選的，只組合需要的部分即可；槽位內容原樣透傳，不做任何包裝。

## Props

`Card`、`CardHeader`、`CardContent`、`CardFooter` 接受容器型 props：

| Prop        | 型別        | 預設值 | 說明               |
| ----------- | ----------- | ------ | ------------------ |
| `children`  | `PingoNode` | —      | 槽位內容（必填）   |
| `className` | `string`    | —      | 追加在元件類名之後 |

`CardTitle`、`CardDescription` 接受文字型 props：

| Prop        | 型別     | 預設值 | 說明               |
| ----------- | -------- | ------ | ------------------ |
| `children`  | `string` | —      | 文字內容（必填）   |
| `className` | `string` | —      | 追加在元件類名之後 |

## 無障礙

Card 是純視覺容器，不引入額外語義；卡片的可讀名稱與結構由內部放置的標題、按鈕等元件承擔。標題與正文顏色繼承卡片的前景色，明暗主題下均保持對比度。
