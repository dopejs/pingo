<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/brand/pingo-mark-dark.svg">
    <img src="assets/brand/pingo-mark.svg" alt="Pingo" width="96" height="96">
  </picture>
</p>

<h1 align="center">Pingo</h1>

<p align="center">在 canvas 上写 TSX。</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@dopejs/pingo"><img alt="npm" src="https://img.shields.io/npm/v/@dopejs/pingo?color=2f6bff&label=%40dopejs%2Fpingo"></a>
  <a href="docs/changelog.md"><img alt="changelog" src="https://img.shields.io/badge/changelog-read-2f6bff"></a>
  <a href="LICENSE"><img alt="license" src="https://img.shields.io/badge/license-Apache--2.0-blue"></a>
  <a href="https://pingo.dopejs.com"><img alt="docs" src="https://img.shields.io/badge/docs-pingo.dopejs.com-2f6bff"></a>
</p>

Pingo 用函数组件、hooks 和 CSS 描述界面，但不生成 DOM：Rust/WASM 核心负责布局、
文本、命中、滚动、绘制与动画，TypeScript 外壳负责组件树与样式，两者之间只通过版本化
的二进制协议通信。写法是熟悉的，跑的是一条不经过 DOM 的渲染管线。

它适合这些场景：

- **长列表与表格**——窗口由核心规划，百万行的代价等于一屏，滚动稳态完全不回调 JS。
- **主线程会被阻塞的应用**——UI 时钟与渲染时钟相互独立，主线程卡住 200ms 画面仍然连续。
- **canvas 内的文本编辑**——caret、选区、IME 组合、剪贴板与撤销重做由引擎实现，业务
  不必再为输入能力叠一层 HTML 控件。

想先看效果，[Playground](https://pingo.dopejs.com/playground) 里有百万行滚动、编辑与
IME、命中测试与双时钟的实时演示，右侧是逐帧指标。

## 安装

```sh
pnpm add @dopejs/pingo
```

业务只依赖 `@dopejs/pingo` 一个包。`@dopejs/pingo-host`、`@dopejs/pingo-jsx` 等是内部
实现包，不属于公开契约。

## 第一个画布

```ts
import { createElement, createHostedCanvasRoot } from "@dopejs/pingo";

const canvas = document.querySelector<HTMLCanvasElement>("#app")!;
canvas.width = 800;
canvas.height = 600;

const root = await createHostedCanvasRoot(canvas);

root.render(
  createElement("container", {
    width: 800,
    height: 600,
    backgroundColor: "#ffffffff",
    padding: 24,
    children: createElement("text", {
      value: "Hello pingo",
      fontSize: 24,
      lineHeight: 32,
      color: "#1f2329ff",
    }),
  }),
);
```

`createHostedCanvasRoot` 自己探测浏览器能力，在 SharedArrayBuffer、`postMessage` 与
主线程 Canvas2D 之间选路，你不需要为降级写分支；`root.mode` 会告诉你实际选中了哪条。

配好 `tsconfig.json` 就能写 TSX：

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@dopejs/pingo"
  }
}
```

```tsx
function OrderRow({ index }: { index: number }) {
  return (
    <container width={480} height={32} padding={[6, 12, 6, 12]}>
      <text value={`订单 #${index}`} fontSize={13} lineHeight={20} />
    </container>
  );
}
```

完整入门见[快速开始](https://pingo.dopejs.com/guide/getting-started)。

## 组件库

`@dopejs/pingo-ui` 提供 46 个与 shadcn/ui 对齐的组件，明暗主题、键盘导航与语义角色都
已接好，其中 `Table` / `DataTable` 自带虚拟滚动。每个组件的用法、可用属性与已知缺口见
[组件文档](https://pingo.dopejs.com/components/button)。

它**还没有发布到 npm**：包在仓库里（`packages/ui`）并随每次门禁验证，但公开发布集目前
只有引擎的 12 个包。要用它先从源码构建，或在
[组件文档](https://pingo.dopejs.com/components/button)里看它现在的样子。

## 能力与边界

已经实现并由自动门禁覆盖的：

| 能力       | 说明                                                               |
| ---------- | ------------------------------------------------------------------ |
| 组件运行时 | TSX 函数组件、hooks 与 signal、`memo`、context                     |
| 样式       | 69 个 CSS 属性的版本化子集（当前 `1.8.0`），逐属性 feature bit     |
| 布局       | flex 单行、`position: absolute` + inset、`z-index`、overflow       |
| 虚拟滚动   | 窗口由核心规划，x/y 单轴，滚动帧不进入 Shell                       |
| 文本与编辑 | 引擎自绘文本、caret、选区、IME 组合、剪贴板、撤销重做              |
| 矢量       | SVG 路径与文档子集，图标可用 `createSvg` 直接接入                  |
| 动画       | 核心内的 transition 与 keyframes，可 retarget/cancel，尊重减弱动效 |
| 无障碍     | 语义树随帧导出到旁路 DOM，键盘导航与角色贯穿组件库                 |
| 降级链     | SharedArrayBuffer → `postMessage` → 主线程 Canvas2D                |

**目前没有**：CSS 选择器与层叠的完整兼容、SSR 与 HTML 首屏、`flex-wrap`、渐变与图案
填充、图表。样式子集的逐条偏差见
[样式支持表](https://pingo.dopejs.com/style-support)。

## 参与开发

前置要求：Node.js 22.12+、pnpm 10.33.2、Rust 1.96.0，并安装 `wasm32-unknown-unknown`
target。

```bash
pnpm install --frozen-lockfile
pnpm check           # 构建、lint、类型、测试、覆盖率与帧时基准
pnpm check:full      # 加上协议/API/迁移/后端差分/动画/soak 等全部门禁
pnpm storybook:dev   # 组件库展区
```

技术决策以 [`docs/design.md`](docs/design.md) 为准，交付顺序与门禁见
[`docs/plan.md`](docs/plan.md)。改架构或行为前先读 [`AGENTS.md`](AGENTS.md)。

真机帧时、真实输入法与跨浏览器矩阵属于**平台资格认证**，与工程门禁分离：未认证的平台
不对外宣称已达到对应指标，口径见 [`docs/m0-probes.md`](docs/m0-probes.md)。

## 许可证

[Apache License 2.0](LICENSE)，自 0.3.0 起生效；v0.2.1 及以前的已发布版本继续适用其
原有的 MIT 许可证。

`packages/ui` 内联了少量 Lucide 图标路径（ISC），声明见
[`packages/ui/src/icons.ts`](packages/ui/src/icons.ts)。
