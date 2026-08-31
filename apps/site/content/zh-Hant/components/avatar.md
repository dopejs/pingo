---
title: Avatar
description: 圓形頭像，圖片缺失時回退為首字母縮寫，渲染在 pingo canvas 上。
---

# Avatar

Avatar 展示使用者頭像：傳入已解碼的圖片資源時按圓形裁切顯示，未傳入時回退為 `fallback` 縮寫。下方預覽由 pingo 引擎即時渲染，並跟隨網站主題切換明暗。

:::preview avatar-basic
:::

## 用法

```tsx
import { Avatar } from "@dopejs/pingo-ui";

root.render(<Avatar fallback="张" />);
```

有圖片時傳入預解碼的 `PingoImage` 資源，圖片以 `object-fit: cover` 填充並裁切為圓形：

```tsx
<Avatar image={decodedImage} fallback="张" />
```

## 示例

### 尺寸

`size` 是正方形邊長（px），同時把圓角設為 `size / 2`。省略時使用外觀預設的 40px。預覽中依次為 32、預設、56。

```tsx
<Avatar fallback="李" size={32} />
```

## Props

| Prop        | 型別         | 預設值        | 說明                                         |
| ----------- | ------------ | ------------- | -------------------------------------------- |
| `image`     | `PingoImage` | —             | 預解碼的圖片資源；預設時顯示 `fallback` 縮寫 |
| `fallback`  | `string`     | —             | 縮寫文字，圖片缺失時顯示（必填）             |
| `size`      | `number`     | 外觀預設 `40` | 正方形邊長（px）                             |
| `className` | `string`     | —             | 追加在元件類名之後                           |

## 無障礙

`fallback` 縮寫同時承擔可讀名稱的職責，請使用能代表使用者的字元（如姓氏或姓名首字母），不要傳入佔位符號。
