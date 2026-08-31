---
title: Card
description: 组合式卡片容器：Header、Title、Description、Content、Footer，渲染在 pingo canvas 上。
---

# Card

卡片把相关内容聚合在一个带边框与阴影的容器里，由六个可组合的槽位构成。下方预览由 pingo 引擎实时渲染，并跟随站点主题切换明暗。

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

所有槽位都是可选的，只组合需要的部分即可；槽位内容原样透传，不做任何包装。

## Props

`Card`、`CardHeader`、`CardContent`、`CardFooter` 接受容器型 props：

| Prop        | 类型        | 默认值 | 说明               |
| ----------- | ----------- | ------ | ------------------ |
| `children`  | `PingoNode` | —      | 槽位内容（必填）   |
| `className` | `string`    | —      | 追加在组件类名之后 |

`CardTitle`、`CardDescription` 接受文本型 props：

| Prop        | 类型     | 默认值 | 说明               |
| ----------- | -------- | ------ | ------------------ |
| `children`  | `string` | —      | 文本内容（必填）   |
| `className` | `string` | —      | 追加在组件类名之后 |

## 无障碍

Card 是纯视觉容器，不引入额外语义；卡片的可读名称与结构由内部放置的标题、按钮等组件承担。标题与正文颜色继承卡片的前景色，明暗主题下均保持对比度。
