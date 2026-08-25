---
title: Form
description: 表單容器與欄位包裝器，負責版面、語義與錯誤/描述資訊位，渲染在 pingo canvas 上。
---

# Form

`Form` 是表單容器，`FormField` 把標籤、控制項和錯誤/描述資訊組裝成一個欄位。下方預覽由 pingo 引擎即時渲染——欄位裡的輸入框可以真正編輯，並跟隨網站主題切換明暗。

:::preview form-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Form, FormField, Input } from "@dopejs/pingo-ui";

root.render(
  createElement(Form, {
    children: createElement(FormField, {
      label: "邮箱",
      required: true,
      error: emailError, // 校验规则由调用方持有
      children: createElement(Input, {
        semanticLabel: "邮箱",
        onValueChange: (value) => validate(value),
      }),
    }),
  }),
);
```

校驗不在元件內：何時校驗、報什麼錯、如何組合都是產品決策。呼叫方持有規則並傳入 `error`，元件只負責版面、語義與資訊位。

## 示例

### 錯誤與描述

`error` 存在時欄位被標記為無效，並**替換**描述文字——兩行指引中若有一行是失敗資訊，另一行會把它淹沒。`required` 在標籤後追加 `*` 標記。

## Props

### Form

| Prop        | 型別        | 預設值 | 說明               |
| ----------- | ----------- | ------ | ------------------ |
| `children`  | `PingoNode` | —      | 表單內容（必填）   |
| `className` | `string`    | —      | 追加在元件類名之後 |

### FormField

| Prop          | 型別        | 預設值  | 說明                                   |
| ------------- | ----------- | ------- | -------------------------------------- |
| `label`       | `string`    | —       | 欄位標籤（必填）                       |
| `children`    | `PingoNode` | —       | 欄位控制項（必填）                     |
| `error`       | `string`    | —       | 錯誤資訊；存在即標記欄位無效並替換描述 |
| `description` | `string`    | —       | 輔助描述文字                           |
| `required`    | `boolean`   | `false` | 必填標記，標籤後追加 `*`               |
| `className`   | `string`    | —       | 追加在元件類名之後                     |

## 無障礙

`Form` 帶 `form` 語義角色；`FormField` 帶 `group` 語義並以標籤命名，無效時語義值為 `invalid`。語義標註在組上而不是控制項上——控制項是呼叫方的，組是唯一保證存在的元素。
