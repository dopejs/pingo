---
title: 变更日志
---

# Changelog

版本口径见 `docs/release.md`：15 个包同版本原子发布，npm semver 与二进制
ABI 版本独立管理。

## 0.4.0 - 2026-09-01

- 新增 `@dopejs/pingo/editor`：写文档编辑器要用的 schema、命令、输入规则，以及 HTML 和
  markdown 的双向转换。`**粗体**` 收尾时标记消失、范围加粗；段首 `## ` 变成二级标题；
  Tab 缩进列表项，空列表项上回车跳出列表；从网页粘贴保留标题、列表与加粗。
- 编辑器现在是文档，不再只是输入框：一个选区可以跨块，一张图片可以整块被选中并删除，
  caret 可以停在两张相邻图片之间打字，五千块的文档编辑起来不比五百块慢。中文输入法在
  加粗边界和块边界上组合正确。
- 撤销按一次输入突发算，不按一个字符算，自动格式化是单独的一步。
- 富文本是可选模块：默认产物不含它以守住体积上限，需要时用 `PINGO_RICH_TEXT=1` 构建。
- 新增 `@dopejs/pingo/react`：`PingoContainer` 让你在 React 应用里挂载一块 pingo canvas，
  不必自己写创建、异步竞态与清理。它自己创建 canvas——root 对 canvas 的转移是永久的，
  React StrictMode 在开发期挂载两次，交给它 React 渲染的 canvas 会失败。
- TSX 现在真的能用。此前 `@dopejs/pingo-ui` 的全部组件、context provider，以及返回类型
  标注为 `PingoNode` 的自定义函数组件，在 TSX 里都通不过类型检查。三类都已修复，文档站
  新增[《用 TSX 写 pingo》](/guide/tsx)，包含与 React 在同一仓库共存的做法。
- 新增 painted-text 探针：`onPaintedText` 逐帧给出实际画出的文本、位置与绘制通道，可以
  直接断言渲染结果，而不必依赖像素快照。不订阅时不产生任何开销。
- 修复：在没有结构变化的帧里新增 `z-index`、`position`、flex 尺寸或 `box-shadow` 会被
  忽略——属性读回正确，但不生效。
- 把 canvas 交给第二个 root 时的报错改为可操作的说明。

## 0.3.1 - 2026-08-25

- `@dopejs/pingo-ui` 开始发布到 npm，与引擎同版本。它此前只存在于仓库与文档站，
  发布集里没有它，所以 46 个组件有文档却装不到。纳入发布集也同时打开了它的产物
  校验：必需文件、法律文件、workspace 依赖改写与依赖闭包。

## 0.3.0 - 2026-08-25

- 虚拟列表的项现在跨列表拉伸，表体行因此与表头列宽对齐。包装盒的布局归 Core，不进入
  样式级联——给它加样式会让整棵子树从直接属性默认值切到 CSS 默认值。
- 可滚动容器里被拉伸的子节点重新拿回确定的交叉尺寸与百分比基准：滚动面板里的盒子不再
  退回收缩包裹，虚拟项里的 `100%` 不再解析成 0。
- flex 项获得 CSS 的 automatic minimum size（仅块轴，行内轴仍需显式 `min-width`）：
  一个巨大的兄弟节点不再把内容尺寸的项压到 0。CSS 子集升至 1.8.0，`min-width`/
  `min-height` 初始值由 `0px` 改为 CSS 的 `auto`。
- 组件：Skeleton 加上 shadcn 的脉冲动画；NavigationMenu 不再套用 Menubar 的边框外观
  并带上会翻转的 chevron；表格表头不可压缩；StatCard/TopBar/ListRow 的伸缩基准由 0
  改为内容宽，无宽度挂载时不再塌陷。
- 发布链：npm 发布集与产物清单改为从校验器的 `RELEASE_PACKAGES` 派生，未经校验的包
  发不出去；可复现构建校验移到门禁链尾，证据与真正发布的产物绑定。

- 实施 M9“生产资格、增量合成与发布硬化”：ABI 17 增加事务式 immutable Picture 资源，
  保留 inline D3 oracle/kill switch；产品 Core 恢复到 384 KiB 工程门禁并固定可复现工具链；
  新增可复算、会过期、失败关闭的平台资格 v2、加速 soak 和无外部副作用候选发布门禁。
  缺少正式真机证据的平台继续明确标为 `unqualified`。
- 完成 M8：ABI 16 增加 Video/VideoFrame 资源契约，Host 提供 HTMLMediaElement 加载、
  CORS、媒体控制/事件与 main-thread/VideoFrame/ImageBitmap 降级；Worker protocol 升至 v11。
  每个视频一帧在途、丢旧保新、资源回收/后台暂停与复制/掉帧诊断均有自动门禁；新增
  `Pressable`/`Button` 和语义镜像 Enter/Space 默认动作，保留 `videoEnabled` 独立回滚。
- 完成 M7：`View.virtual` 支持 x/y 单轴与 `ViewHandle` 滚动 API；Core 新增 ABI 15
  immutable animation resource、opacity/transform transition 与 keyframes、retarget/cancel、
  连续 pause/resume、实时 reduced motion、稳定诊断和逻辑帧录制回放。三 transport 的
  Worker stall、native/WASM 字节差分、500 动画性能/内存预算与 WASM 体积门禁已自动化。
- 完成 M6：foundation facade、单源 CSS subset、typed computed style、display/overflow、
  原生事件状态/伪类、迁移诊断与独立回滚开关全部通过 `pnpm m6:check`。
- 项目许可证自 0.3.0 起由 MIT 切换为 Apache-2.0；v0.2.1 及以前的已发布版本仍保持 MIT。

## 0.2.1 - 2026-08-20

- 公开幂等且可重试的 `initializeWasm`，业务可以自行编排 WASM loading；默认 Storybook
  loading 改为轻量延迟展示，Worker 初始化复用同一入口。
- 双时钟 Playground 改为进入页面即持续的百万行虚拟滚动；按钮只阻塞主线程，不再
  启动或重置滚动状态。
- 新增 Core/Worker 时钟持有的恒速程序化滚动 `setScrollVelocity`；Input Stream
  增加对应命令，ABI 版本 10 → 11。

## 0.2.0 - 2026-08-20

- 滚轮传递曲线对齐浏览器原生：离散滚轮格改为动画滚动，高精度（触控板）delta 保持即时 1:1；
  Input Stream 的 `DispatchEvent` 新增 flags 字段，ABI 版本 1 → 2。
- 官网提供简体中文、繁体中文、西班牙语、法语、德语、俄语、希伯来语、阿拉伯语、日语与韩语。

## 0.1.0

首个可发布版本。P0–M5 全部工程里程碑完成，`pnpm m5:check`（M0→M5 全链
自动门禁）全绿。

- 确定性 Rust/WASM Core + TypeScript Shell：单源 schema、版本化二进制
  Mutation/Input/DisplayList/反向流，畸形输入原子拒绝。
- 双时钟渲染：SAB → postMessage → 主线程 Canvas2D 降级链，主线程阻塞
  200ms 时 Worker 连续呈现。
- 原生虚拟滚动（百万行 P95/P99 亚微秒级重放）与文本子系统（显式字体
  shaping、glyph atlas、系统字体 fallback）。
- canvas 原生编辑：EditContext/输入代理双路径、IME composition、指针与
  键盘 caret 导航、剪贴板、undo/redo、密码遮罩、caret scroll-into-view。
- 命中测试（增量 BVH + 朴素 oracle 属性测试）与 capture/target/bubble
  三阶段事件、non-passive 区域同步 `preventDefault` 协议。
- 无障碍：语义树导出、DOM 影子树镜像、`getByRole` 语义 E2E 选择器、
  键盘聚焦转发。
- 迁移与生产化：`@dopejs/pingo-compat` 按页面灰度/回退、迁移扫描器、
  发布包与 WASM SHA-256 完整性验证、诊断与运行手册。
- WebGPU 隔离原型与 headless oracle 零失配差分（ADR-0006：
  Continue Experiment，默认关闭）。

显式延后：bidi 视觉导航、widgets placeholder、WebGPU 默认启用。
平台资格（真机性能、真实 IME、屏幕阅读器）另行跟踪，不随包版本承诺。
