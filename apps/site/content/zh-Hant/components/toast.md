---
title: Toast
description: 角落彈出的輕量通知，由 ToastViewport 承載，渲染在 pingo canvas 上。
---

# Toast

Toast 是在角落短暫出現的輕量通知，適合儲存成功、同步失敗等即時反饋。下方預覽由 pingo 引擎即時渲染——點選按鈕即可觸發一條 toast，並跟隨網站主題切換明暗。

:::preview toast-basic
:::

## 用法

Toast 需要配合 `ToastViewport` 使用。視口是絕對定位的角落容器（預設右上角），**必須掛在靠近根的容器下**——本引擎的包含區塊是父節點而非最近的 positioned 祖先，掛在小容器裡它就只覆蓋那個小容器。

```tsx
import { Button, Toast, ToastViewport } from "@dopejs/pingo-ui";

let open = false;

function scene() {
  return (
    <container width={surfaceWidth} height={surfaceHeight}>
      <Button
        onPress={() => {
          open = true;
          root.render(scene());
        }}
      >
        保存
      </Button>
      <ToastViewport>
        <Toast open={open} title="已保存" description="配置已写入本地。" />
      </ToastViewport>
    </container>
  );
}
```

顯示/隱藏、自動關閉時機由應用自己控制：翻轉 `open` 並重新 `root.render(...)` 即可（預覽中的按鈕就是這個模式）。

## 示例

### 變體

`variant="destructive"` 用於失敗通知。此時描述文字不再使用弱化前景色——破壞性背景已經反轉了前景，再弱化會變成紅底灰字。

:::preview toast-variants
:::

## Props

### Toast

| Prop          | 型別                         | 預設值      | 說明                                      |
| ------------- | ---------------------------- | ----------- | ----------------------------------------- |
| `open`        | `boolean`                    | —           | 是否顯示；`false` 時渲染為 `null`（必填） |
| `title`       | `string`                     | —           | 標題（必填）                              |
| `description` | `string`                     | —           | 描述正文，省略時不渲染描述行              |
| `variant`     | `"default" \| "destructive"` | `"default"` | 視覺變體                                  |
| `className`   | `string`                     | —           | 追加在元件類名之後                        |

### ToastViewport

| Prop        | 型別        | 預設值 | 說明                                                 |
| ----------- | ----------- | ------ | ---------------------------------------------------- |
| `children`  | `PingoNode` | —      | 視口內的 toast 列表，多條按 8px 間距縱向堆疊（必填） |
| `className` | `string`    | —      | 追加在元件類名之後                                   |

## 無障礙

Toast 帶有 `status` 語義角色，輔助技術會將其作為狀態訊息播報。toast 不打斷當前焦點；關鍵操作的結果請同時在頁面上保留持久反饋（如 `Alert`）。
