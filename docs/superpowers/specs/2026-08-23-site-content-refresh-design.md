# 站点内容刷新设计：Components 栏目、CSS 与基础组件文档

> 状态：已批准（2026-08-23）
> 范围：apps/site（pingo 官网）+ dopejs-page（组织主页，仅文案）
> 背景：自上版官网完成后，引擎新增了基础组件、CSS（含 SCSS/Less 构建期管线）与
> shadcn 对齐的 UI 组件库（packages/ui，~45 个组件）。官网与 dopejs-page 介绍均未反映。

## 已确认的决策

| 决策点           | 结论                                                                       |
| ---------------- | -------------------------------------------------------------------------- |
| 组件预览渲染方式 | Pingo Canvas 渲染（dogfooding），复用 Playground 的 hosted canvas 路径     |
| 预览嵌入架构     | 页面内嵌懒加载 Canvas（IntersectionObserver + 动态 import 单例）           |
| 内容组织         | shadcn 模型：markdown 页面 + 独立 demo tsx 文件 + `:::preview <name>` 引用 |
| 组件文档覆盖     | 全量 ~45 个组件一次完成                                                    |
| i18n             | 10 语言全量同步（en 为源语言，遵循现有 locale 后缀约定）                   |
| dopejs-page      | 仅更新 11 个语言文件中 pingo 的 tagline/summary，不动 projects.ts 结构     |

## A. CSS 文档（用户向，新增）

现有 CSS 内容（`docs/style-support.md` 生成表、`docs/scss-less-support.md`）是内部
设计/参考文档，缺用户向指南。新增：

1. `docs/guide/styling.md` — 样式使用指南：CSS subset 用法、类选择器/继承/计算样式
   的边界、与内联 prop 的优先级、动画支持标注。
2. `docs/guide/scss-less.md` — SCSS/Less 使用指南：构建期编译管线、Vite 插件用法、
   安全边界（Sass/Less 不进浏览器 bundle/Core）、source map 与错误诊断。
3. `docs/style-support.md`（脚本生成，勿手改）挂入导航作为参考页，标注 subset 版本；
   `scss-less-support.md` 保持内部设计文档，不进导航。

## B. 基础组件文档（Guide 新增小节）

覆盖引擎级元素（@dopejs/pingo-jsx）与 widgets（@dopejs/pingo-widgets）：

- View / Text / Image：布局容器、文本渲染、图片（PingoImage）与字体（PingoFont）。
- Input / TextArea：canvas 原生编辑、EditContext、revision 事务契约。
- SVG / Path：矢量图标与图形。
- Widgets（TextField 等装饰场）：与 UI 组件库的关系和边界
  （widgets = 无样式引擎级构件，ui = 带主题成品组件）。
- 每页使用与 Components 栏目相同的 `:::preview` 实时渲染设施。

## C. UI 组件栏目（顶级导航）

- 顶部导航新增 **Components**：`/components/`（索引）+ `/components/<name>/`。
- Sidebar 分组：Form / Layout / Overlay / Data / Feedback，覆盖全部组件。
- 每页结构对标 shadcn：标题 + 描述 → Preview/Code 双 Tab → Usage → 示例
  （variants/sizes/状态）→ Props 表 → Accessibility。

### 内容管线

- 每组件一个 markdown：`docs/components/<name>.md`（+ 各 locale 后缀版本）。
- Demo 为独立 tsx：`apps/site/src/demos/components/<name>-<variant>.tsx`，导出
  标准 `Demo` 接口（复用 `apps/site/src/playground/demo.ts` 契约）。
- markdown 内 `:::preview <demo-name>` 容器引用 demo；构建期从 registry 提取源码
  字符串供 Code tab 展示，运行期懒挂载渲染 Preview tab。
- 构建期校验：每个 `:::preview` 引用必须命中 registry，否则构建失败。

### 预览运行时

- `ComponentPreview` React 组件：复用 `createHostedCanvasRoot`
  （@dopejs/pingo 动态 import，模块级单例 promise 全页共享）。
- IntersectionObserver 懒挂载，滚入视口才初始化 canvas。
- 单页 preview 数量受控（≤ ~8 个），每个 preview 独立 hosted root。
- 降级：WASM/Worker 不可用时显示静态占位 + 错误提示，不影响 prose 阅读。

## D. 首页与现有页面更新

- `docs/index.md` hero/features：补充基础组件、CSS/SCSS/Less、UI 组件库三个能力点。
- `docs/guide/getting-started.md`、`docs/guide/architecture.md`：更新能力描述，
  交叉链接新页面。
- `apps/site/content.mjs` 的 `navigationOrder()` 加入 styling/scss-less/基础组件/
  Components 入口。

## E. dopejs-page 文案

- 更新 `src/data/copy/*.ts`（11 个语言文件）中 pingo 的 tagline/summary：
  移除「M0–M3 已完成、M4 将来」的过时里程碑表述，改为当前能力：基础组件、
  CSS（SCSS/Less）支持、shadcn 对齐 UI 组件库、实时渲染文档。
- 不动 `projects.ts` 结构（status 等字段保持）。

## 验证

- 构建期：`:::preview` 引用完整性校验脚本 + pingo 站点构建 + dopejs-page 构建。
- 浏览器抽查：Button/Dialog/DataTable（UI 组件）、Input 编辑（基础组件）、
  styling 指南页，确认 canvas 实际渲染且 Code tab 源码正确。
- i18n：每个新页面 10 语言文件存在且 frontmatter 合法；dopejs-page 11 语言渲染检查。

## 失败模式与回滚

- 预览运行时失败仅影响 preview 区域，prose 可读；`:::preview` 渲染为带错误提示的
  占位块。
- Components 栏目为纯增量路由与内容，回滚 = 移除导航入口 + 内容目录，不影响既有
  Guide/API 页面。
- dopejs-page 为纯文案变更，git revert 即可。
