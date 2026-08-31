---
title: Popover
description: 錨定在觸發器旁的浮層面板，用於補充資訊與輕量操作。
---

# Popover

Popover 在觸發器旁邊開啟一個浮動面板，頁面捲動時面板保持錨定。下方預覽由 pingo 引擎即時渲染——點選觸發器即可開合，並跟隨網站主題切換明暗。

:::preview popover-basic
:::

## 用法

```tsx
import { Button, Popover, PopoverContent, PopoverTrigger } from "@dopejs/pingo-ui";

root.render(
  <Popover defaultOpen={false} onOpenChange={(open) => {}}>
    <PopoverTrigger>
      <Button onPress={() => {}}>打开浮层</Button>
    </PopoverTrigger>
    <PopoverContent>
      <text value="任意内容" />
    </PopoverContent>
  </Popover>,
);
```

`PopoverTrigger` 與 `PopoverContent` 透過 context 讀取根元件狀態，必須作為同一個 `Popover` 的子節點。預設非受控（`defaultOpen`），傳入 `open` 即切換為受控模式。面板預設錨定在觸發器下方；開啟版面回讀後，空間不足時會自動翻轉到另一側。

## 示例

### 任意內容

`PopoverContent` 的 `children` 接受任意 `PingoNode`，可以放表單、列表或排版內容。

:::preview popover-rich
:::

## Props

### Popover

| Prop           | 型別                      | 預設值  | 說明                       |
| -------------- | ------------------------- | ------- | -------------------------- |
| `open`         | `boolean`                 | —       | 受控開合狀態               |
| `defaultOpen`  | `boolean`                 | `false` | 非受控初始開合             |
| `onOpenChange` | `(open: boolean) => void` | —       | 開合變化回調               |
| `children`     | `PingoNode`               | —       | Trigger 與 Content（必填） |
| `className`    | `string`                  | —       | 追加在錨點容器類名之後     |

### PopoverTrigger

| Prop        | 型別        | 預設值 | 說明             |
| ----------- | ----------- | ------ | ---------------- |
| `children`  | `PingoNode` | —      | 觸發元素（必填） |
| `className` | `string`    | —      | 追加類名         |

### PopoverContent

| Prop        | 型別        | 預設值 | 說明             |
| ----------- | ----------- | ------ | ---------------- |
| `children`  | `PingoNode` | —      | 面板內容（必填） |
| `className` | `string`    | —      | 追加類名         |

## 無障礙

觸發器具備 button 語義並暴露 expanded/collapsed 狀態；`Escape` 關閉面板並把焦點交還觸發器。
