---
title: Toast
description: 角落弹出的轻量通知，由 ToastViewport 承载，渲染在 pingo canvas 上。
---

# Toast

Toast 是在角落短暂出现的轻量通知，适合保存成功、同步失败等即时反馈。下方预览由 pingo 引擎实时渲染——点击按钮即可触发一条 toast，并跟随站点主题切换明暗。

:::preview toast-basic
:::

## 用法

Toast 需要配合 `ToastViewport` 使用。视口是绝对定位的角落容器（默认右上角），**必须挂在靠近根的容器下**——本引擎的包含块是父节点而非最近的 positioned 祖先，挂在小容器里它就只覆盖那个小容器。

```tsx
import { createElement } from "@dopejs/pingo";
import { Button, Toast, ToastViewport } from "@dopejs/pingo-ui";

let open = false;

function scene() {
  return createElement("container", {
    width: surfaceWidth,
    height: surfaceHeight,
    children: [
      createElement(Button, {
        children: "保存",
        onPress: () => {
          open = true;
          root.render(scene());
        },
      }),
      createElement(ToastViewport, {
        children: createElement(Toast, {
          open,
          title: "已保存",
          description: "配置已写入本地。",
        }),
      }),
    ],
  });
}
```

显示/隐藏、自动关闭时机由应用自己控制：翻转 `open` 并重新 `root.render(...)` 即可（预览中的按钮就是这个模式）。

## 示例

### 变体

`variant="destructive"` 用于失败通知。此时描述文字不再使用弱化前景色——破坏性背景已经反转了前景，再弱化会变成红底灰字。

:::preview toast-variants
:::

## Props

### Toast

| Prop          | 类型                         | 默认值      | 说明                                      |
| ------------- | ---------------------------- | ----------- | ----------------------------------------- |
| `open`        | `boolean`                    | —           | 是否显示；`false` 时渲染为 `null`（必填） |
| `title`       | `string`                     | —           | 标题（必填）                              |
| `description` | `string`                     | —           | 描述正文，省略时不渲染描述行              |
| `variant`     | `"default" \| "destructive"` | `"default"` | 视觉变体                                  |
| `className`   | `string`                     | —           | 追加在组件类名之后                        |

### ToastViewport

| Prop        | 类型        | 默认值 | 说明                                                 |
| ----------- | ----------- | ------ | ---------------------------------------------------- |
| `children`  | `PingoNode` | —      | 视口内的 toast 列表，多条按 8px 间距纵向堆叠（必填） |
| `className` | `string`    | —      | 追加在组件类名之后                                   |

## 无障碍

Toast 带有 `status` 语义角色，辅助技术会将其作为状态消息播报。toast 不打断当前焦点；关键操作的结果请同时在页面上保留持久反馈（如 `Alert`）。
