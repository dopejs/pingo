---
title: Badge
description: 非互動的狀態小標籤，渲染在 pingo canvas 上。
---

# Badge

Badge 是一個非互動的狀態標籤，用來標註狀態、分類或數量，例如「管理員」「Beta」。下方預覽由 pingo 引擎即時渲染，並跟隨網站主題切換明暗。

:::preview badge-variants
:::

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { Badge } from "@dopejs/pingo-ui";

root.render(createElement(Badge, { children: "Beta" }));
```

## 示例

### 變體

四種變體覆蓋常見語義：`default`（強調）、`secondary`（弱化）、`destructive`（錯誤/危險）、`outline`（描邊）。預覽中已按順序展示。

```tsx
createElement(Badge, { children: "只读", variant: "secondary" });
```

### 搭配其他元件

Badge 常作為列表行或卡片的 trailing 元素，與 `Avatar`、`ListRow` 組合使用：

```tsx
createElement(ListRow, {
  title: "张三",
  leading: createElement(Avatar, { fallback: "张", size: 32 }),
  trailing: createElement(Badge, { children: "管理员" }),
  onPress: () => {},
});
```

## Props

| Prop | 型別 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `children` | `string` | — | 標籤文字（必填） |
| `variant` | `"default" \| "secondary" \| "destructive" \| "outline"` | `"default"` | 視覺變體 |
| `semanticLabel` | `string` | — | 無障礙名稱；省略時使用預設語義 |
| `className` | `string` | — | 追加在元件類名之後 |

## 無障礙

Badge 不響應指標與鍵盤，是純展示元素。當文字不足以傳達含義（如純數字角標）時，用 `semanticLabel` 提供完整說明。
