---
title: StatCard
description: 指標卡片分子元件，展示數值、環比變化與趨勢著色，渲染在 pingo canvas 上。
---

# StatCard

StatCard 是 pingo 特有的產品分子：一塊指標瓦片，由標籤、數值、環比 delta 與說明文字組成。`trend` 隻影響 delta 的著色——`flat` 保持中性灰，因為持平的指標無所謂好壞。下方預覽由 pingo 引擎即時渲染，跟隨網站主題切換明暗。

:::preview statcard-basic
:::

與 shadcn 基礎件的組合關係：StatCard 是自包含的展示分子，內部只用 Text/View 原語，不預留插槽；儀表板版面時通常用 `flexDirection: "row"` 的 container 把多張 StatCard 排成一行，或與 Card、Divider 組合成報表區塊。數值的格式化（千分位、貨幣符號）由呼叫方完成，`value`/`delta` 都是純字串。

## 用法

```tsx
import { createElement } from "@dopejs/pingo";
import { StatCard } from "@dopejs/pingo-ui";

root.render(
  createElement(StatCard, {
    label: "本月营收",
    value: "¥128,400",
    delta: "+12.5%",
    trend: "up",
    description: "较上月",
  }),
);
```

## 示例

### 趨勢著色

`trend` 取 `"up"` / `"down"` / `"flat"`，分別把 delta 染成漲、跌與中性色；不傳 `trend` 時按 `flat` 處理。

### 無 delta

省略 `delta` 時數值獨佔一行，`trend` 不生效；`description` 同樣可省略。

```tsx
createElement(StatCard, { label: "在线设备", value: "1,024" });
```

## Props

| Prop          | 型別                       | 預設值   | 說明                                 |
| ------------- | -------------------------- | -------- | ------------------------------------ |
| `label`       | `string`                   | —        | 指標名稱（必填）                     |
| `value`       | `string`                   | —        | 指標數值，格式化由呼叫方負責（必填） |
| `delta`       | `string`                   | —        | 環比變化，如 `+12.5%`                |
| `trend`       | `"up" \| "down" \| "flat"` | `"flat"` | delta 的著色方向，不影響其他部分     |
| `description` | `string`                   | —        | 底部說明文字，如比較週期             |
| `className`   | `string`                   | —        | 追加在元件類名之後                   |

## 無障礙

StatCard 具有 `group` 語義角色，無障礙名稱取 `label`，標籤、數值與 delta 作為組內文字被輔助技術依次讀出。趨勢僅透過顏色表達時，請確保 `delta` 文字本身帶有方向資訊（如 `+`/`-` 前綴），不要只相依紅綠著色。
