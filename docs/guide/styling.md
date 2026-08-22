---
title: 样式
description: pingo 的 CSS subset：类选择器、层叠与优先级、继承边界，以及 pingo-ui 的主题与覆盖约定。
---

# 样式

pingo 的样式是一个**版本化的 CSS subset**（当前 1.6.0）：CSS 文本在 Shell 侧解析与计算，
Core 只消费规范化后的类型化值——CSS 文本和选择器匹配永远不会进入 Core。
完整的属性支持表见 [CSS subset 支持](/style-support)，本页讲用法与边界。

## 创建与注册样式表

用 `createStyleSheet` 编译 CSS 文本（输入非法时抛 `StyleSheetCompileError`），
在创建 root 时注册：

```ts
import { createElement, createHostedCanvasRoot, createStyleSheet } from "@dopejs/pingo";

const sheet = createStyleSheet(
  `
  .card {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 16px;
  }
  `,
  { sourceName: "app.css" },
);

const root = await createHostedCanvasRoot(canvas, { styleSheets: [sheet] });

root.render(
  createElement("container", {
    className: "card",
    width: 320,
    children: createElement("text", { value: "你好", fontSize: 14 }),
  }),
);
```

不想处理异常时可以用 `compileStyleSheet`：它对作者输入不抛异常，返回稳定的
diagnostics。样式表也可以写成类型安全的对象形式（`PingoStyleSheetObject`），键是
带不带前导点都可以的类选择器，值是 `PingoStyle`：

```ts
const sheet = createStyleSheet({
  card: { backgroundColor: "#ffffffff", borderRadius: 8, padding: 16 },
  "card:hover": { backgroundColor: "#f5f5f5ff" },
});
```

元素通过 `className` prop 挂类（ASCII 空白分隔的多个类名），通过 `style` prop
写内联声明（`PingoStyle`，由 Shell 解析后再进 Core）。

## 选择器与层叠

子集只支持**同一节点上的类选择器**，以及四个交互状态伪类：

- 单类 `.card`；复合类 `.pui-card.pui-dark`（节点同时具备全部类才命中）。
- 状态 `:hover`、`:active`、`:focus`、`:focus-visible`，可与类复合，如 `.btn:hover`。

不支持：元素选择器、后代/子代等组合器、`@media` / `@supports` / `@keyframes`、
`var()` / `calc()`。长度单位只有 `px` 与 `%`（`em` / `rem` / `vw` / `vh` 会被拒绝）；
颜色写 hex 或 `rgb()` / `rgba()` / `hsl()` / `hsla()`（两种新老语法都接受），
颜色关键字（如 `red`）不受支持。

层叠规则与 CSS 同构但更简单：

1. **优先级（specificity）= 类数 + 状态数**。`.pui-card.pui-dark`（2）胜过 `.card`（1）。
2. **同优先级按 source order**：后注册的样式表、同表内靠后的规则生效。
3. **内联 `style` prop 胜过一切样式表规则**；元素上的直接 props（如 `width`、
   `backgroundColor`）优先级最高，胜过 `style`。

注意第 2 条的推论：覆盖生效的依据是**样式表的注册顺序**，与类名在 `className`
字符串里的先后无关。

## 继承与计算样式边界

只有少量属性继承：`color`、`visibility`、`font-family` / `font-size` / `font-weight` /
`font-style`、`line-height`、`text-align`、`white-space`、`overflow-wrap`、
`pointer-events`、`cursor`。其余属性（包括全部布局属性）每个节点都从初始值开始，
不写就是没有——不存在"从父级继承宽度"这类行为。

每个属性在单源 schema 里声明自己的失效域（布局/绘制/命中/语义）。改 `opacity`
不会触发重排，改 `width` 会；这与[架构](/guide/architecture)里的失效模型是同一套机制。

### 交互状态声明的属性受限

状态规则（如 `.btn:hover`）里只允许写绘制类属性：`background-color`、`color`、
`opacity`、各边 `border-*-color`、`border-radius`、`box-shadow`、`visibility`、
`transform` / `transform-origin`、`pointer-events`、`cursor`。在状态规则里写布局属性
会在编译期被拒绝——状态切换不能触发布局变化。

## 与 CSS 的主要偏差

子集有意不做完整 CSS 兼容，关键偏差（完整清单见 [CSS subset 支持](/style-support)）：

- `position: absolute` 的包含块是**父节点**而不是最近的 positioned 祖先；
  没有 `position: relative`，视觉偏移用 `transform`。
- 没有 `flex-wrap`：flex 容器单行，主轴溢出裁剪或滚动。
- flex item 没有 automatic minimum size，可被压缩到 0（等价于浏览器里写 `min-width: 0`）；
  `min-width: auto` / `min-height: auto` 直接编译失败。
- 主轴尺寸不确定时百分比解析为 `0` 而不是 CSS 的 `auto`。
- `box-shadow` 只支持外阴影、每节点最多 4 层，`inset` 被拒绝。
- `z-index` 只在兄弟之间稳定重排，没有 stacking context。

## pingo-ui 的主题与覆盖约定

`@dopejs/pingo-ui` 组件库的皮肤就是一张用上述机制编译的样式表：

```ts
import { createHostedCanvasRoot, createStyleSheet } from "@dopejs/pingo";
import { createPingoUiStyleSheet } from "@dopejs/pingo-ui";

const myOverrides = createStyleSheet(`
  .pui-button { border-radius: 4px; }
`);

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [createPingoUiStyleSheet(), myOverrides], // 顺序不能反
});
```

- **`createPingoUiStyleSheet()` 为每个 root 创建一份独立的不可变 sheet**。
- **用户 sheet 必须注册在 pingo-ui sheet 之后**：同优先级按 source order 覆盖，
  写在后面的生效。组件的 `className` prop 追加在组件自身类名之后
  （如 `pui-input pui-input--disabled mine`），但能否覆盖只取决于上面的注册顺序。
- 想提高覆盖的优先级，用复合类提高 specificity（如 `.pui-button.mine`），而不是
  依赖书写位置。

### 明暗主题

```ts
import { setTheme, useTheme } from "@dopejs/pingo-ui";

setTheme("dark"); // 所有订阅组件自动重渲染
useTheme();       // 在组件 render 内读取并订阅
```

主题是模块级 signal：组件 render 中 `useTheme()` 自动订阅，`setTheme` 触发全部
订阅组件重渲染。深色通过 compound class 实现——dark 主题下组件挂 `pui-dark`
标记类，皮肤里的 `.pui-x.pui-dark` 复合规则命中（如 `.pui-card.pui-dark`）。

**品牌定制是构建期行为**：新建 preset 用
`@use "@dopejs/pingo-ui/styles/tokens" with ($primary: ...)` 覆盖 token，再经
`@dopejs/pingo-style-preprocess` 的 Vite 插件重新编译组件皮肤——改品牌色 = 重新
构建，运行时不可换。token 值的颜色同样只能写 hex 或
`rgb()` / `rgba()` / `hsl()` / `hsla()`。SCSS/Less 管线见
[SCSS / Less 指南](/guide/scss-less)。
