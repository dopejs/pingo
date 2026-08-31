---
title: Checkbox
description: 受控的多選框，可帶文字標籤，渲染在 pingo canvas 上。
---

# Checkbox

多選框用於獨立的布林開關。下方預覽由 pingo 引擎即時渲染，並跟隨網站主題切換明暗。Checkbox 是受控元件：預覽中展示靜態的開/關/禁用組合，互動由呼叫方持有的狀態驅動。

:::preview checkbox-basic
:::

## 用法

```tsx
import { useSignal, type PingoNode } from "@dopejs/pingo";
import { Checkbox } from "@dopejs/pingo-ui";

// useSignal 是 hook，必须运行在组件作用域内。
function NotificationSetting(): PingoNode {
  const enabled = useSignal(false);
  return (
    <Checkbox
      checked={enabled.get()}
      label="已启用通知"
      onCheckedChange={(next) => enabled.set(next)}
    />
  );
}

root.render(<NotificationSetting />);
```

`checked` 由父元件持有，`onCheckedChange` 負責更新它——元件本身不儲存狀態。`label` 可選，提供後會在選框右側渲染文字。

## 示例

### 禁用

傳入 `disabled` 後選框不再響應指標與鍵盤，語義值變為 `disabled`。

## Props

| Prop              | 型別                         | 預設值  | 說明                   |
| ----------------- | ---------------------------- | ------- | ---------------------- |
| `checked`         | `boolean`                    | —       | 選中狀態（必填，受控） |
| `onCheckedChange` | `(checked: boolean) => void` | —       | 狀態切換回調           |
| `disabled`        | `boolean`                    | `false` | 禁用態                 |
| `label`           | `string`                     | —       | 選框右側的文字標籤     |
| `className`       | `string`                     | —       | 追加在元件類名之後     |
| `semanticLabel`   | `string`                     | —       | 無障礙名稱             |

## 無障礙

元件帶 `checkbox` 語義角色，語義值隨狀態在 `checked` / `unchecked` / `disabled` 間切換。指標按下時自動聚焦。✓ 指示符相依字型字形覆蓋，在圖示資產就緒前作為佔位實作。
