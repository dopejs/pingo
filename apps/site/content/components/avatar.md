---
title: Avatar
description: 圆形头像，图片缺失时回退为首字母缩写，渲染在 pingo canvas 上。
---

# Avatar

Avatar 展示用户头像：传入已解码的图片资源时按圆形裁切显示，未传入时回退为 `fallback` 缩写。下方预览由 pingo 引擎实时渲染，并跟随站点主题切换明暗。

:::preview avatar-basic
:::

## 用法

```tsx
import { Avatar } from "@dopejs/pingo-ui";

root.render(<Avatar fallback="张" />);
```

有图片时传入预解码的 `PingoImage` 资源，图片以 `object-fit: cover` 填充并裁切为圆形：

```tsx
<Avatar image={decodedImage} fallback="张" />
```

## 示例

### 尺寸

`size` 是正方形边长（px），同时把圆角设为 `size / 2`。省略时使用皮肤默认的 40px。预览中依次为 32、默认、56。

```tsx
<Avatar fallback="李" size={32} />
```

## Props

| Prop        | 类型         | 默认值        | 说明                                         |
| ----------- | ------------ | ------------- | -------------------------------------------- |
| `image`     | `PingoImage` | —             | 预解码的图片资源；缺省时显示 `fallback` 缩写 |
| `fallback`  | `string`     | —             | 缩写文本，图片缺失时显示（必填）             |
| `size`      | `number`     | 皮肤默认 `40` | 正方形边长（px）                             |
| `className` | `string`     | —             | 追加在组件类名之后                           |

## 无障碍

`fallback` 缩写同时承担可读名称的职责，请使用能代表用户的字符（如姓氏或姓名首字母），不要传入占位符号。
