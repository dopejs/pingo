---
title: Input OTP
description: 定長一次性驗證碼輸入，支援逐格輸入與整段貼上，渲染在 pingo canvas 上。
---

# Input OTP

一次性驗證碼輸入，由若干定長格子組成。下方預覽由 pingo 引擎即時渲染——可以逐格輸入數字、貼上整段驗證碼，並跟隨網站主題切換明暗。

:::preview input-otp-basic
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { InputOTP } from "@dopejs/pingo-ui";

root.render(
  createElement(InputOTP, {
    length: 6,
    semanticLabel: "一次性验证码",
    onValueChange: (value) => console.log(value),
    onComplete: (code) => verify(code),
  }),
);
```

內部值是一個**定長、以空格補齊**的字串：空格代表空格位。`onValueChange` 收到的就是這個補齊後的值；`onComplete` 在所有格子填滿時觸發一次，收到的是去掉空格的完整驗證碼。貼上會視為從當前格子開始的整段填充，刪除只清空當前格而不左移後續數字。

## 示例

### 長度

`length` 決定格子數（預設 6）。每格使用數字軟鍵盤（`inputMode: "numeric"`）。

## Props

| Prop | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `length` | `number` | `6` | 格子數量 |
| `value` | `string` | — | 受控當前值（空格補齊） |
| `defaultValue` | `string` | — | 非受控初始值 |
| `onValueChange` | `(value: string) => void` | — | 值變化回調，值為空格補齊的定長字串 |
| `onComplete` | `(value: string) => void` | — | 全部填滿時回調，值為去空格的完整驗證碼 |
| `disabled` | `boolean` | `false` | 禁用所有格子 |
| `semanticLabel` | `string` | — | 組的無障礙名稱 |
| `className` | `string` | — | 追加在元件類名之後 |

## 無障礙

元件帶 `group` 語義角色；每個格子自動獲得 `序号/总数` 形式的無障礙名稱（如 `3/6`），也可以透過 `semanticLabel` 命名整個組。
