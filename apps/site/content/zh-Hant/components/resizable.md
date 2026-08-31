---
title: Resizable
description: 可拖曳手柄調整比例的雙欄版面，渲染在 pingo canvas 上。
---

# Resizable

Resizable 把容器分成兩個面板，中間的夾拖手柄可以拖動調整比例，也支援鍵盤微調。下方預覽由 pingo 引擎即時渲染——拖動手柄試試。

:::preview resizable-basic
:::

## 用法

```tsx
import { Resizable } from "@dopejs/pingo-ui";

root.render(<Resizable defaultSplit={0.4} first={sidebar} second={content} />);
```

元件自身寬高為父容器的 100%，需要一個有確定尺寸的父容器。既支援非受控（`defaultSplit`）也支援受控（`split` + `onSplitChange`）兩種用法。

## 示例

### 垂直方向

傳入 `direction: "column"` 切換為上下分割，手柄變為橫向。

:::preview resizable-vertical
:::

## Props

| Prop            | 型別                      | 預設值  | 說明                           |
| --------------- | ------------------------- | ------- | ------------------------------ |
| `first`         | `PingoNode`               | —       | 第一個面板內容（必填）         |
| `second`        | `PingoNode`               | —       | 第二個面板內容（必填）         |
| `split`         | `number`                  | —       | 受控：第一個面板佔比，`[0, 1]` |
| `defaultSplit`  | `number`                  | `0.5`   | 非受控：初始佔比               |
| `onSplitChange` | `(split: number) => void` | —       | 佔比變化回調                   |
| `direction`     | `"row" \| "column"`       | `"row"` | 分割方向                       |
| `minSplit`      | `number`                  | `0.1`   | 最小佔比（鉗制下界）           |
| `maxSplit`      | `number`                  | `0.9`   | 最大佔比（鉗制上界）           |
| `disabled`      | `boolean`                 | `false` | 禁用手柄互動                   |
| `className`     | `string`                  | —       | 追加在元件類名之後             |

## 無障礙

手柄具備 separator 語義，並向輔助技術暴露當前佔比（百分比）。聚焦手柄後可用方向鍵以 2% 步長微調：水平版面用左/右，垂直版面用上/下。
