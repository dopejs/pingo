---
title: ListRow
description: 列表行分子元件，組合頭像、徽標等基礎件與選中/禁用狀態，渲染在 pingo canvas 上。
---

# ListRow

ListRow 是 pingo 特有的產品分子：一行列表項，標題與描述佔據中間伸縮列，`leading`（頭像、圖示）與 `trailing`（徽標、開關、箭號）插槽分居兩端。下方預覽由 pingo 引擎即時渲染——可點選的行有完整的指標反饋，並跟隨網站主題切換明暗。

:::preview list-row-basic
:::

與 shadcn 基礎件的組合關係：ListRow 定義行版面與互動狀態，不內建任何內容元件；`leading`/`trailing` 插槽接受任意 `PingoNode`，典型組合是 Avatar、Badge 或 Switch。相鄰行間需要留白時，用固定高度的 container 做間距（pingo 沒有 gap 屬性）。

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Avatar, Badge, ListRow } from "@dopejs/pingo-ui";

root.render(
  createElement(ListRow, {
    title: "张三",
    description: "zhangsan@example.com",
    leading: createElement(Avatar, { fallback: "张", size: 32 }),
    trailing: createElement(Badge, { children: "管理员" }),
    onPress: () => openMember("zhangsan"),
  }),
);
```

## 示例

### 選中與禁用

`selected` 應用選中樣式並對外暴露選中狀態；`disabled` 的行不攜帶任何事件處理器——比"處理器裡再判斷"更強。

:::preview list-row-states
:::

### 純展示行

不傳 `onPress` 時行為純展示項：語義角色為 `listitem`，沒有互動樣式與事件。

## Props

| Prop | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `title` | `string` | — | 標題文字（必填） |
| `description` | `string` | — | 次要描述文字 |
| `leading` | `PingoNode` | — | 前部插槽，放頭像或圖示 |
| `trailing` | `PingoNode` | — | 尾部插槽，放徽標、開關或箭號 |
| `selected` | `boolean` | — | 選中態；傳入即暴露 `selected`/`unselected` 語義值 |
| `disabled` | `boolean` | `false` | 禁用態，不註冊任何事件處理器 |
| `onPress` | `() => void` | — | 點選回調；傳入後行變為可互動 |
| `className` | `string` | — | 追加在元件類名之後 |

## 無障礙

可互動行具有 `button` 語義角色，純展示行為 `listitem`；無障礙名稱取 `title`。傳入 `selected` 時暴露 `selected`/`unselected` 語義值。禁用行不攜帶任何指標/鍵盤處理器，對輔助技術呈現為純靜態項。
