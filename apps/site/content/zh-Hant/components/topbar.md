---
title: TopBar
description: 應用頂欄分子元件，由標題與前後插槽組合而成，渲染在 pingo canvas 上。
---

# TopBar

TopBar 是 pingo 特有的產品分子：把標題與 `leading`（logo、返回）和 `actions`（按鈕、頭像）兩個插槽組合成一行應用頂欄。標題列始終佔據剩餘空間（`flexGrow`），把 actions 推到最右端——無需任何測量。下方預覽由 pingo 引擎即時渲染，跟隨網站主題切換明暗。

:::preview topbar-basic
:::

與 shadcn 基礎件的組合關係：TopBar 本身不提供按鈕或頭像，它定義的是**版面骨架**；`leading` 與 `actions` 插槽接受任意 `PingoNode`，通常組合 [Button](/components/button)、IconButton、Avatar 等基礎件。多個 action 用一個 `flexDirection: "row"` 的 container 包起來傳入。

## 用法

```tsx
import { Avatar, Button, TopBar } from "@dopejs/pingo-ui";

root.render(
  <TopBar
    title="仪表盘"
    leading={<Avatar fallback="P" size={28} />}
    actions={
      <Button variant="outline" onPress={() => create()}>
        新建
      </Button>
    }
  />,
);
```

## 示例

### 無標題

省略 `title` 時標題列仍會渲染（一個空的伸縮列），actions 依舊被推到右端；適合只有操作區的工具條。

```tsx
<TopBar actions={<Button onPress={() => {}}>导出</Button>} />
```

## Props

| Prop        | 型別        | 預設值 | 說明                         |
| ----------- | ----------- | ------ | ---------------------------- |
| `title`     | `string`    | —      | 標題文字；省略時渲染空伸縮列 |
| `leading`   | `PingoNode` | —      | 前部插槽，放 logo 或返回按鈕 |
| `actions`   | `PingoNode` | —      | 尾部插槽，被標題列推到最右端 |
| `className` | `string`    | —      | 追加在元件類名之後           |

## 無障礙

TopBar 具有 `banner` 語義角色；提供 `title` 時標題文字帶 `heading` 角色。插槽內元件的無障礙屬性（如 IconButton 的 `semanticLabel`）由各自元件負責。
