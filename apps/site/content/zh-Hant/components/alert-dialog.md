---
title: Alert Dialog
description: 用於破壞性操作的確認對話方塊，內建取消/確認按鈕對。
---

# Alert Dialog

確認對話方塊是內建了「取消 / 確認」按鈕對的 Dialog，用於不可逆操作前的二次確認。下方預覽由 pingo 引擎即時渲染，並跟隨網站主題切換明暗。

:::preview alert-dialog-basic
:::

## 用法

```tsx
import { AlertDialog } from "@dopejs/pingo-ui";

root.render(
  <AlertDialog
    open={open}
    onOpenChange={(next) => setOpen(next)}
    title="确认退出？"
    description="未保存的修改将会丢失。"
    onCancel={() => {}}
    onAction={() => quit()}
  >
    {null}
  </AlertDialog>,
);
```

與 Dialog 一樣，浮層填滿它自己的父容器，請掛載在靠近根節點的位置。注意 `children` 繼承自 `DialogProps` 仍為必填，但會被元件內建的標題/描述/按鈕結構覆蓋，傳 `null` 即可。點選取消或確認按鈕都會先觸發對應回調，再透過 `onOpenChange(false)` 請求關閉；遮罩點選同樣會關閉。

## 示例

### 破壞性操作

`destructive` 會把確認按鈕渲染為危險色。

:::preview alert-dialog-destructive
:::

## Props

繼承 `DialogProps`（`open`、`onOpenChange`、`children`、`className`），另有：

| Prop          | 型別         | 預設值   | 說明                 |
| ------------- | ------------ | -------- | -------------------- |
| `title`       | `string`     | —        | 標題（必填）         |
| `description` | `string`     | —        | 補充說明             |
| `cancelLabel` | `string`     | `"取消"` | 取消按鈕文案         |
| `actionLabel` | `string`     | `"确定"` | 確認按鈕文案         |
| `onCancel`    | `() => void` | —        | 取消回調（隨後關閉） |
| `onAction`    | `() => void` | —        | 確認回調（隨後關閉） |
| `destructive` | `boolean`    | `false`  | 確認按鈕使用危險色   |

## 無障礙

具備 dialog 語義；取消與確認按鈕都註冊在 Tab 迴圈中，鍵盤使用者不會被困在對話方塊裡。
