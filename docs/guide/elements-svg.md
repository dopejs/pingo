---
title: 矢量图形：Path 与 SVG
description: Path 矢量轮廓与 SVG 文档子集——d 语法、viewBox 缩放、描边与 currentColor 图标。
---

# 矢量图形：Path 与 SVG

pingo 的矢量图形是引擎绘制的一等能力：路径作为不可变资源存在 Core 侧，同一个图标画
50 次也只有一份几何。两个入口：`Path` 直接接受一段 SVG path 数据；`Svg` 接受
`createSvg` / `loadSvg` 解析出的整个文档。下方预览由引擎实时渲染，图标颜色跟随站点主题。

:::preview elements-svg-icon
:::

## Path：单条轮廓

```tsx
import { createElement, Path, View } from "@dopejs/pingo";

createElement(View, {
  style: { color: "#3157dfff" }, // 轮廓画在节点的 color 里，像文字一样继承
  children: createElement(Path, {
    d: "M20 6 9 17l-5-5",
    viewBox: [0, 0, 24, 24],
    width: 24,
    height: 24,
    strokeWidth: 2,
  }),
});
```

- `d` 支持完整 SVG path 语法（`M L H V C S Q T A Z` 及小写相对形式）；圆弧 `A` 在解析时
  转成三次贝塞尔，Core 不需要单独的曲线类型。
- `viewBox` 是作者空间的盒子，绘制时缩放进节点盒——同一资源在 16px 与 48px 的节点里
  都直接可用，不需要调用方换算。
- 不传 `strokeWidth` 时填充轮廓；传入非零值则按该宽度描边（round cap/join）。
- `geometryTransform` 在编码前烘焙进几何点（SVG 文档里 group 变换移动的是图形而不是
  它所在的盒子），与节点的视觉 `transform` 是两回事。

:::preview elements-path
:::

## Svg：文档子集

`createSvg(markup)` 用手写解析器而不是 `DOMParser`——引擎要在浏览器、Worker 与 headless
差分测试里产出完全一致的几何，而 `DOMParser` 在 Worker 里不存在。子集就是图标集实际
包含的内容：

- 形状元素：`path` `circle` `ellipse` `rect` `line` `polyline` `polygon`；
- 结构元素：`svg` `g` `title` `desc` `defs` `metadata`；
- 属性：`fill` `stroke` `stroke-width` `fill-rule` `transform`
  （`translate`/`scale`/`rotate`/`matrix`，skew 不在子集内）。

子集之外的元素**按名拒绝**并抛出 `PingoSvgError`——调用方会明确知道丢了什么，而不是
面对一个空白盒子。命名 CSS 颜色同样被拒绝：半张颜色表会让一部分文档正常、另一部分
悄悄变黑。十六进制颜色、`none`、`transparent` 与 `currentColor` 都在子集内；
`currentColor` 解析为"继承节点颜色"，因此图标可以像文字一样跟随主题换色（预览中的
做法）。

`Svg` 组件把文档展开成**每个形状一个 path 节点**，形状之间用绝对定位叠加；既填充又
描边的形状会变成两个节点——填充与描边是两种 paint，不是一个节点的两半。

```ts
import { createSvg, loadSvg, Svg } from "@dopejs/pingo";

const icon = createSvg(`<svg viewBox="0 0 24 24" stroke="currentColor" …>…</svg>`);
createElement(Svg, { source: icon, width: 24, height: 24, style: { color: "#3157df" } });

const remote = await loadSvg("/assets/logo.svg");
```

需要程序化访问时，`PingoSvg.shapes` 给出每个形状的 `d`、`transform`、填充/描边与
`fillRule`；`shapeData(name, attributes)` 可以把单个形状元素转成等价的 path 数据。

## Props（Path）

| Prop                | 类型                                                        | 默认值      | 说明                                        |
| ------------------- | ----------------------------------------------------------- | ----------- | ------------------------------------------- |
| `d`                 | `string`                                                    | —           | SVG path 数据（必填，仅路径语法，不是文档） |
| `viewBox`           | `readonly [number, number, number, number]`                 | —           | 作者空间盒子，缩放进节点盒                  |
| `strokeWidth`       | `number`                                                    | —           | 非零时描边而不填充                          |
| `fillRule`          | `"nonzero" \| "evenodd"`                                    | `"nonzero"` | 填充规则                                    |
| `geometryTransform` | `readonly [number, number, number, number, number, number]` | 单位矩阵    | 编码前烘焙进几何的变换                      |

## Props（Svg）

| Prop     | 类型       | 默认值 | 说明                                         |
| -------- | ---------- | ------ | -------------------------------------------- |
| `source` | `PingoSvg` | —      | `createSvg` / `loadSvg` 解析出的文档（必填） |

两者都继承 [CommonProps](/api)（`width`/`height`、事件、语义 props 等）。

## 无障碍

矢量图形本身没有语义。装饰性图标不需要标注；可点击的图标按钮请给它
`semanticRole: "button"` 与 `semanticLabel`，详见[无障碍](/guide/accessibility)。
