---
title: 基础元素：View、Text 与 Image
description: View 容器与 flex 布局、Text 文本渲染、Image 位图与 PingoFont 显式字体。
---

# 基础元素：View、Text 与 Image

pingo 的主机元素直接对应 Scene 节点，不存在 CSS 层叠或选择器匹配的开销（样式能力见
[样式](/guide/styling)）。本页覆盖三个最基础的元素：通用盒子 `View`、文本 `Text` 与位图
`Image`。下方预览由 pingo 引擎实时渲染，并跟随站点主题切换明暗。

:::preview elements-layout
:::

## View 与布局

`View` 是通用分组盒子（对应 `container` 主机元素），不引入新的 Scene 节点种类：

- `width` / `height` / `minWidth` / `maxWidth` / `padding` / `backgroundColor` / `opacity` /
  `transform` 是直接 props，`padding` 接受数值或 `[上, 右, 下, 左]` 四元组。
- `flexDirection`、`justifyContent`、`alignItems`、边框与圆角走 `style` 内联通道
  （类型化的 CSS 子集，见 [样式](/guide/styling)）。
- 子项间距用固定尺寸的容器显式表达，预览中的 `row` / `column` 助手就是这么实现的。

## 用法

```tsx
import { Text, View } from "@dopejs/pingo";

root.render(
  <View
    width={420}
    padding={16}
    backgroundColor="#ffffffff"
    style={{ flexDirection: "column", borderRadius: 10 }}
  >
    <Text value="标题" fontSize={24} lineHeight={32} fontWeight={700} />
    <View height={8} />
    <Text value="正文" fontSize={14} lineHeight={22} />
  </View>,
);
```

## Text：文本运行

文本的 shaping、换行与测量全部由 Core 完成——中英文混排、emoji、组合字符都不需要
Shell 参与。内容用 `value` 或字符串 `children` 给出。

:::preview elements-text
:::

### Props（Text）

| Prop         | 类型               | 默认值      | 说明                                 |
| ------------ | ------------------ | ----------- | ------------------------------------ |
| `value`      | `string`           | —           | 文本内容（与 `children` 二选一）     |
| `children`   | `string \| number` | —           | 文本内容                             |
| `color`      | `Color`            | `#000000ff` | 文本颜色，可继承                     |
| `fontSize`   | `number`           | —           | 字号（逻辑像素）                     |
| `lineHeight` | `number`           | —           | 行高（逻辑像素）                     |
| `fontWeight` | `number`           | —           | 字重                                 |
| `fontFamily` | `string`           | —           | CSS 字体族                           |
| `font`       | `PingoFont`        | —           | 显式不可变字体；不支持的输入整段回退 |

`Text` 同时继承全部 [CommonProps](/api)（尺寸、padding、事件、`semanticRole` /
`semanticLabel` 等）。

## Image：位图

`Image` 的 `source` 是一张 `PingoImage`——Shell 侧持有的**不可变 RGBA8 位图**，在提交
边界同步内联为 Scene 资源。用 `createImage` 创建，它会复制并校验像素：

```tsx
import { createImage, Image } from "@dopejs/pingo";

const icon = createImage(pixels, 96, 96, { label: "应用图标" });
<Image source={icon} width={48} height={48} />;
```

不传 `width` / `height` 时节点取图像的像素尺寸；传入则缩放进节点盒。`label` 即无障碍
名称，留空表示装饰性图像。

:::preview elements-image
:::

像素而不是编码字节是刻意的取舍：资源事务在提交边界同步生效，而任何编码格式都需要
异步解码。列表缩略图这类小图适合这条路径；大图应当走带异步 staging 的编码路径。

## 字体：PingoFont 与 loadFont

`Text` / 可编辑元素的 `font` prop 接受一个显式的不可变 SFNT 字体（TTF/OTF/TTC），由
Core 确定性 shaping。`createFont` 接收已解码的 SFNT 字节；`loadFont` 额外处理网络加载
与 WOFF/WOFF2 解码：

```tsx
import { loadFont } from "@dopejs/pingo";

const inter = await loadFont("/fonts/Inter-Regular.woff2", {
  fallbackFamily: "sans-serif",
});
<Text value="Hello" font={inter} fontSize={16} />;
```

`PingoFontOptions`：`faceIndex`（TTC 集合中的字面索引，默认 `0`）与
`fallbackFamily`（显式字体路径整体回退时使用的 CSS 族，默认 `"sans-serif"`）。
加载失败抛出带稳定 `code` 的 `PingoFontLoadError`（如 `fetch-failed`、`decode-failed`、
`unsupported-format`）。

## 无障碍

`semanticRole` 与 `semanticLabel` 是所有元素共有的 props：标题、按钮、区域都应在元素上
标注语义，`Image` 的名称来自 `createImage` 的 `label`。语义快照会镜像成 canvas 旁的 DOM
影子树，详见[无障碍](/guide/accessibility)。
