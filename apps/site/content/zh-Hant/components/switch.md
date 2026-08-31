---
title: Switch
description: 受控的開關控制項，用於即時生效的布林設定，渲染在 pingo canvas 上。
---

# Switch

開關用於即時生效的布林設定。下方預覽由 pingo 引擎即時渲染，並跟隨網站主題切換明暗。Switch 是受控元件：預覽中展示靜態的開/關/禁用組合，互動由呼叫方持有的狀態驅動。

:::preview switch-basic
:::

## 用法

```tsx
import { useSignal, type PingoNode } from "@dopejs/pingo";
import { Switch } from "@dopejs/pingo-ui";

// useSignal 是 hook，必须运行在组件作用域内。
function AirplaneMode(): PingoNode {
  const on = useSignal(false);
  return (
    <Switch checked={on.get()} semanticLabel="飞行模式" onCheckedChange={(next) => on.set(next)} />
  );
}

root.render(<AirplaneMode />);
```

`checked` 由父元件持有，`onCheckedChange` 負責更新它——元件本身不儲存狀態。

## 示例

### 禁用

傳入 `disabled` 後開關不再響應指標與鍵盤，語義值變為 `disabled`。

## Props

| Prop              | 型別                         | 預設值  | 說明                   |
| ----------------- | ---------------------------- | ------- | ---------------------- |
| `checked`         | `boolean`                    | —       | 開關狀態（必填，受控） |
| `onCheckedChange` | `(checked: boolean) => void` | —       | 狀態切換回調           |
| `disabled`        | `boolean`                    | `false` | 禁用態                 |
| `className`       | `string`                     | —       | 追加在元件類名之後     |
| `semanticLabel`   | `string`                     | —       | 無障礙名稱             |

## 無障礙

元件帶 `switch` 語義角色，語義值隨狀態在 `on` / `off` / `disabled` 間切換。指標按下時自動聚焦。開關沒有可見文字，請始終提供 `semanticLabel`。
