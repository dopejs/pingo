---
title: Badge
description: 非交互的状态小标签，渲染在 pingo canvas 上。
---

# Badge

Badge 是一个非交互的状态标签，用来标注状态、分类或数量，例如「管理员」「Beta」。下方预览由 pingo 引擎实时渲染，并跟随站点主题切换明暗。

:::preview badge-variants
:::

## 用法

```tsx
import { Badge } from "@dopejs/pingo-ui";

root.render(<Badge>Beta</Badge>);
```

## 示例

### 变体

四种变体覆盖常见语义：`default`（强调）、`secondary`（弱化）、`destructive`（错误/危险）、`outline`（描边）。预览中已按顺序展示。

```tsx
<Badge variant="secondary">只读</Badge>
```

### 搭配其他组件

Badge 常作为列表行或卡片的 trailing 元素，与 `Avatar`、`ListRow` 组合使用：

```tsx
<ListRow
  title="张三"
  leading={<Avatar fallback="张" size={32} />}
  trailing={<Badge>管理员</Badge>}
  onPress={() => {}}
/>
```

## Props

| Prop            | 类型                                                     | 默认值      | 说明                           |
| --------------- | -------------------------------------------------------- | ----------- | ------------------------------ |
| `children`      | `string`                                                 | —           | 标签文本（必填）               |
| `variant`       | `"default" \| "secondary" \| "destructive" \| "outline"` | `"default"` | 视觉变体                       |
| `semanticLabel` | `string`                                                 | —           | 无障碍名称；省略时使用默认语义 |
| `className`     | `string`                                                 | —           | 追加在组件类名之后             |

## 无障碍

Badge 不响应指针与键盘，是纯展示元素。当文本不足以传达含义（如纯数字角标）时，用 `semanticLabel` 提供完整说明。
