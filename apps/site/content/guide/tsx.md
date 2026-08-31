---
title: TSX
description: 用 TSX 写 pingo 组件，以及在同一个仓库里与 React 共存。
---

# 用 TSX 写 pingo

## 配置

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@dopejs/pingo"
  }
}
```

`jsx` 用的是 TypeScript 的自动运行时；`jsxImportSource` 把它指向 pingo 的
`jsx-runtime`，而不是 React 的。名字里的 `react-jsx` 只是转换模式的名称，与 React 无关。

## 什么可以当标签

```tsx
import { createContext, memo, Text, useState, View, type PingoNode } from "@dopejs/pingo";
import { Button } from "@dopejs/pingo-ui";

const Theme = createContext("light");

function Row({ label }: { readonly label: string }): PingoNode {
  const [count, setCount] = useState(0);
  return (
    <View width={240} padding={8}>
      <text value={`${label} ${count}`} />
      <Button onPress={() => setCount(count + 1)}>加一</Button>
    </View>
  );
}

root.render(
  <Theme.Provider value="dark">
    <Row label="点击次数" />
  </Theme.Provider>,
);
```

五种形式都可以：

| 形式              | 例子                                                  |
| ----------------- | ----------------------------------------------------- |
| 内建元素          | `<container>`、`<text>`、`<scroll>`、`<editableText>` |
| 基础组件          | `<View>`、`<Text>`、`<Image>`、`<Input>`              |
| 自己写的函数组件  | `<Row label="…" />`                                   |
| `memo` 包装的组件 | `@dopejs/pingo-ui` 的全部组件                         |
| context provider  | `<Theme.Provider value={…}>`                          |

::: warning 用 hooks 的组件必须挂载，不能直接调用
`Row({ label })` 能通过类型检查，但会以
`hooks may only run in a function component` 失败——hooks 需要 reconciler 建立的
组件作用域。写成 `<Row label="…" />` 就对了。
:::

返回类型标 `PingoNode` 是可以的。它包含 `undefined`，`PingoNode` 与 JSX 标签的兼容
由引擎的 `JSX.ElementType` 声明，不需要你改写签名。

## 与 React 共存

一个仓库里同时有 React 和 pingo 的 TSX 文件是常见情况——例如用 React 写外壳、用
pingo 画高性能区域。

### 机制是文件头声明

`jsxImportSource` 的粒度是**文件**。把 pingo 文件的第一行写成：

```tsx
/** @jsxImportSource @dopejs/pingo */
```

项目的 `tsconfig.json` 保持 React 配置，加了这行的文件走 pingo 运行时。`tsc`、
esbuild/Vite、babel 都认这一条。

**其它两种想法都不成立**，实测：

| 做法                                                  | 结果                                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| 目录里放一个改了 `jsxImportSource` 的 `tsconfig.json` | `tsc` 完全忽略它，而 Vite 会认——构建与类型检查结论不一致                     |
| 用 `exclude` 按文件名排除                             | `exclude` 只影响根文件选择；React 文件一 `import`，它就被拉回来按 React 编译 |

要让文件名真正驱动工具链，需要 composite project references（pingo 项目产出
`.d.ts`，React 项目消费声明而不是源码）。

忘了写这一行不会静默出错，而是编译期报错：

```
error TS2322: Type 'Element' is not assignable to type 'PingoNode'.
error TS2786: 'View' cannot be used as a JSX component.
```

### 文件名后缀是约定

两种文件放在同一个目录时，建议给 pingo 文件加后缀，例如 `scene.pingo.tsx`——文件
列表里一眼能分辨，也方便 babel `overrides` 之类按文件名做配置。它是给人和配置看的
约定，**不能代替文件头声明**。整个目录都是 pingo 的时候，目录本身就是信号，再加后缀
只是噪音。

### 边界就是文件边界

一个文件只能有一种 JSX，所以 **React 组件里写不了 pingo 标签**。pingo 文件导出场景，
React 文件引入它：

```tsx
/** @jsxImportSource @dopejs/pingo */
// scene.pingo.tsx
import { Text, View, type PingoNode } from "@dopejs/pingo";

export function scene(label: string): PingoNode {
  return (
    <View width={240} height={80} padding={12}>
      <Text value={label} />
    </View>
  );
}
```

### 用 `PingoContainer` 挂载

```tsx
// App.tsx —— 这个文件的标签是 React 的
import { PingoContainer } from "@dopejs/pingo/react";

import { scene } from "./scene.pingo";

export function App() {
  return <PingoContainer scene={scene("Hello")} style={{ height: 320, width: 480 }} />;
}
```

场景通过 `scene` 属性而不是 children 传入——这个文件的标签属于 React，写不出 pingo
的 children。

`PingoContainer` 自己创建 canvas，而不是让 React 渲染 canvas 再取 ref。这一条是**必须**
的：root 会把 canvas 转移给 OffscreenCanvas，转移是永久的，而 React StrictMode 在开发
环境把 effect 跑两遍——React 拥有的那个 canvas 会被交给第二个 root，然后失败：

```
this canvas already transferred control to an OffscreenCanvas and cannot host
a second root; create a new canvas element per root
```

组件内部创建的 canvas 会随被丢弃的那次挂载一起丢掉，所以不会遇到这件事。尺寸也不用管：
root 会跟随 canvas 自己的盒子，用 CSS 给容器尺寸就够了。

需要拿到 root（滚动控制、诊断回调）时用 `onRoot`；启动失败用 `onStartupError`，运行期
错误仍然走 `options.onHostError`。

### 两棵树不共享状态

React 的 state 与 context 不会流进 pingo 组件树，反过来也一样。它们是两个独立的
reconciler。跨边界通信就是普通的数据流：React 侧算好值，作为 `scene` 传进去；pingo 侧
通过事件回调把结果送回来。

## 本仓库就是例子

`apps/site` 是一个 React 应用，同时包含 73 个 pingo TSX 组件预览。混放的目录是
[`apps/site/src/interop`](https://github.com/dopejs/pingo/tree/main/apps/site/src/interop)，
它的测试在 `StrictMode` 下运行。
