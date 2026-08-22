---
title: SCSS / Less
description: 用 SCSS 或 Less 编写 pingo 样式表：构建期编译管线、Vite 插件、安全边界与错误诊断。
---

# SCSS / Less

pingo 的 CSS subset（见[样式指南](/guide/styling)）在运行时只接受 CSS 文本或对象。
想用变量、mixin、`@use` / import 等作者体验，走 **构建期编译**：SCSS/Less 在 Node 侧
由 `@dopejs/pingo-style-preprocess` 编译成 CSS，再经现有 `compileStyleSheet` 校验，
生成默认导出 `PingoStyleSheet` 的 JavaScript 模块。

**Sass 和 Less 不会进入浏览器 bundle、facade 或 Core**——运行时没有任何预处理器，
只有原本就存在的轻量 CSS 编译器。子集边界也不会因此扩大：后代选择器、`@media`、
`var()`、`calc()`、`em/rem/vw/vh` 等仍按现有诊断拒绝，构建失败而不是静默放行。

## 两种导入语义必须分开

### 普通 DOM 样式（Vite 原生）

```ts
import "./site.scss";
import "./probe.less";
```

这条路径是 Vite 自带的 CSS 预处理能力，输出 **DOM CSS**，由 Vite 注入或抽取。
它只适用于文档站、Storybook 外壳这类 DOM 页面，**不会产生 `PingoStyleSheet`**，
也不要把它用于 canvas 内的样式。

### pingo 样式表（`?pingo-style`）

```ts
import { createHostedCanvasRoot } from "@dopejs/pingo";
import buttonSheet from "./button.scss?pingo-style";
import themeSheet from "./theme.less?pingo-style";

const root = await createHostedCanvasRoot(canvas, {
  styleSheets: [buttonSheet, themeSheet],
});
```

`?pingo-style` 是显式的类型边界：构建期先预处理再按 CSS subset 校验，生成的 ESM
模块默认导出 `PingoStyleSheet`，**不会向 DOM 注入任何 CSS**。

## Vite 插件

安装 Node-only 工具包（需要 Node >= 22.12，Vite ^8）：

```sh
pnpm add -D @dopejs/pingo-style-preprocess
```

在 `vite.config.ts` 注册：

```ts
import { pingoStylePreprocess } from "@dopejs/pingo-style-preprocess/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    pingoStylePreprocess({
      // 可选：额外的 Sass load paths / Less paths
      scssLoadPaths: ["styles"],
      lessPaths: ["styles"],
      // 可选：依赖必须落在这些目录内（默认只有 entry 所在目录与 load paths）
      allowRoots: ["src", "styles"],
    }),
  ],
});
```

类型声明由包的 `./client` 入口提供，在 `tsconfig.json` 里引用一次即可：

```json
{
  "compilerOptions": {
    "types": ["@dopejs/pingo-style-preprocess/client"]
  }
}
```

插件的行为约定：

- 只匹配精确 query flag `pingo-style` 加 `.scss` / `.less` 扩展名；其余文件不受影响。
- 通过 virtual module 隔离 Vite 原生 CSS pipeline，不会重复预处理或注入 DOM CSS。
- entry 与全部 partial/import 都进入 watch graph——**改 token 或 mixin 会触发
  HMR 与生产重构建**，不需要手动清缓存。
- 任一 error 级诊断让构建失败关闭；warning 带源位置输出。HMR 编译失败时保留上一个
  已提交模块并在 dev server 报错。
- 生成的模块在初始化时校验 `CSS_SUBSET_VERSION`：如果运行时 facade 与构建期校验
  使用的 subset 版本不一致，模块加载即抛错，不会让两套语义混跑。
- dev、production、SSR 三种环境生成语义一致的样式表。

## Node 编译 API

非 Vite 的构建系统（CLI、codegen）可以直接用 Node API：

```ts
import {
  compileLessString,
  compilePingoStyleFile,
  compileScssString,
  createStyleSheetFromLess,
  createStyleSheetFromScss,
} from "@dopejs/pingo-style-preprocess";
```

- `compileScssString(source, options)`：同步，因此**只处理无 import 的源码**；
  有 import 时返回 `file-api-required` 诊断。
- `compileLessString(source, options)`：异步（Less 的 `render` 是 Promise）；只有提供
  绝对路径的 `sourceName` 后才解析相对 import。
- `compilePingoStyleFile(filename, options)`：异步文件 API，Vite 插件走的就是它，
  相对解析基准明确，依赖图完整。
- `compile*` 系列对作者输入错误**不抛异常**，返回 `styleSheet: null` 与稳定排序的
  diagnostics；`createStyleSheetFromScss` / `createStyleSheetFromLess` 是抛异常的
  便捷封装，作者错误统一抛 `StylePreprocessError` 并保留全部 diagnostics。

返回的 `StylePreprocessResult` 包含 `cssText`、`styleSheet`、`diagnostics` 与
`dependencies`（完整依赖文件列表，可用于自建 watch）。

## Source map 与错误诊断

每个诊断都带阶段标记：

| `stage`       | 来源                                       |
| ------------- | ------------------------------------------ |
| `"scss"`      | Sass 编译异常（语法错误、未定义变量等）     |
| `"less"`      | Less 编译 rejection                        |
| `"pingo-css"` | 产物超出 CSS subset 的 `compileStyleSheet` 诊断 |

两个编译器都开启 source map，pingo CSS 诊断的生成位置会**尽力映射回原始
SCSS/Less 文件与行列**（`sourceLocation`）；无法映射时保留生成位置
（`generatedLocation`）与 entry 名，不会伪造原始位置。诊断按生成位置与 code
稳定排序，CI 输出与 snapshot 可复现。

## 安全边界

预处理器在构建期执行作者代码，因此默认收紧：

- **Sass**：不开放 custom importer、custom function 或 Node package importer；
  只接受 `file:` 依赖。
- **Less**：固定 `javascriptEnabled: false`，不传 plugins，预扫描拒绝 `@plugin`；
  不允许 HTTP(S) 或协议相对导入。
- **共同限制**：依赖 canonicalize 后必须位于 allow roots（entry 所在目录 + 显式
  load paths）内；symlink 逃逸、非文件依赖、远程依赖一律拒绝。编译后 CSS 先过
  1,048,576 code-unit 上限再进 subset 校验；entry、依赖数量与依赖总字节都有显式
  预算，超限产生稳定构建错误。
- 编译器版本由 lockfile 固定，fixture 的 CSS、diagnostics 与依赖列表做
  reproducibility snapshot；升级 Sass/Less 需要显式审查输出差异。

这些限制只约束 `?pingo-style` 工具链；普通 DOM 的 `.scss` / `.less` 仍遵循 Vite
自己的配置。

## 颜色函数

预处理器常输出颜色函数，subset 为此支持 `rgb()` / `rgba()` / `hsl()` / `hsla()`
（legacy 逗号与现代 space/slash 两种形式），统一归一到 8-bit RGBA。超出这个集合的
输出——`color(display-p3 ...)`、CSS 自定义属性、`calc()`——继续构建失败。
