---
title: Dialog
description: 模態對話方塊，打斷流程以獲取使用者輸入或確認，渲染在 pingo canvas 上。
---

# Dialog

對話方塊在當前內容之上開啟一個模態面板，並附帶遮罩。下方預覽由 pingo 引擎即時渲染——點選遮罩或按 `Escape` 會觸發 `onOpenChange(false)`，並跟隨網站主題切換明暗。

:::preview dialog-basic
:::

## 用法

```tsx
import {
  Button,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@dopejs/pingo-ui";

root.render(
  <Dialog open={open} onOpenChange={(next) => setOpen(next)}>
    <DialogHeader>
      <DialogTitle>编辑资料</DialogTitle>
      <DialogDescription>修改会立即同步。</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button onPress={() => save()}>保存</Button>
    </DialogFooter>
  </Dialog>,
);
```

Dialog 的浮層會填滿**它自己的父容器**（而不是視口），請把它掛載在靠近根節點的位置。`open` 為受控 prop：元件不持有開合狀態，關閉時透過 `onOpenChange(false)` 通知呼叫方。

## 示例

### 組合區塊

`DialogHeader` / `DialogTitle` / `DialogDescription` / `DialogFooter` 是純版面與排版元件，按需組合；`children` 接受任意 `PingoNode`，表單、列表都可以放進面板。

## Props

### Dialog

| Prop           | 型別                      | 預設值 | 說明                   |
| -------------- | ------------------------- | ------ | ---------------------- |
| `open`         | `boolean`                 | —      | 是否開啟（必填，受控） |
| `onOpenChange` | `(open: boolean) => void` | —      | 請求關閉/開啟時回調    |
| `children`     | `PingoNode`               | —      | 面板內容（必填）       |
| `className`    | `string`                  | —      | 追加在浮層類名之後     |

### DialogHeader / DialogFooter

| Prop        | 型別        | 預設值 | 說明             |
| ----------- | ----------- | ------ | ---------------- |
| `children`  | `PingoNode` | —      | 區塊內容（必填） |
| `className` | `string`    | —      | 追加類名         |

### DialogTitle / DialogDescription

| Prop        | 型別     | 預設值 | 說明             |
| ----------- | -------- | ------ | ---------------- |
| `children`  | `string` | —      | 文字內容（必填） |
| `className` | `string` | —      | 追加類名         |

## 無障礙

面板具備 dialog 語義；開啟時焦點移入面板，`Escape` 關閉後焦點回到觸發元素。面板內的可互動元素會註冊進 Tab 迴圈。標題請使用 `DialogTitle`（heading 語義）。
