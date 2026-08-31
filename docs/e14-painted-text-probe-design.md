# E14 设计门：painted-text 探针

- 状态：Accepted（已实现）
- 日期：2026-08-31
- 关联：[`AGENTS.md`](../AGENTS.md) 测试要求「semantic-tree-driven E2E coverage；
  pixel snapshots are supplementary」、[`design.md`](design.md) §14 无障碍与可测试性、§15 测试策略、
  [`e11-viewport-culling-design.md`](e11-viewport-culling-design.md) 裁剪归属
- 定位：**今天要断言「这一帧真的把这段字画出去了」，只剩像素快照。**

## 1. 现状取证

### 1.1 已有的语义出口是 Scene 派生的，不是 paint 派生的

`pingo-core/src/engine.rs:2204` 的 `semantics()` 遍历 `scene.ids()`，按
`excluded_by_display` / `visible` / 有无 geometry 过滤，导出 role、label、value、
bounds。`packages/a11y` 把它镜像成 DOM，`getByRole` / `queryAllByRole` 从 facade 导出。

它回答的是「这个节点在语义树里、带这个 label」，**不回答「这一帧真的把这段字发出
去了」**。两者之间隔着 paint：子树缓存、Picture 复用、`display_none`、虚拟化占位、
字形资源降级，任何一环出错都不会让 `semantics()` 变化。

语义 E2E 选择器 `getByRole` / `queryAllByRole` 已经有消费者
（`packages/facade/src/m4-a11y.browser.ts`、`m8-controls.browser.ts`），但它们断言的
始终是语义树。**没有任何一条断言说得出「这段字这一帧被画出去了」。**

### 1.2 Picture 模式下扫 DisplayList 找文本，什么也扫不到

`pingo-paint/src/engine.rs:676` 的 `build_picture_graph` 把子 picture 的
`DrawPicture` 引用 push 进**父 picture 的 payload**，顶层 DisplayList 只剩一条根
`DrawPicture`（[`e11`](e11-viewport-culling-design.md) §2 已论证过同一件事）。

### 1.3 主路径的文本指令里没有字符串

`pingo-abi/src/display_list.rs:159` 的 `DrawGlyphRun` 只有
`font_id / size / origin / glyph_span_id`。只有两条 fallback 分支
（`DrawTextFallback` / `DrawTextInlineFallback`）带得到字符串。

**所以「从 DisplayList 反推本帧文本」在生产主路径上不成立。**

### 1.4 但字符串在 paint 时是在手上的

`pingo-paint/src/engine.rs:1137`：

```rust
if visible && let Some(text_run) = scene.text_run(node) {
    typed_resource(scene, text_run.string_id, ResourceKind::Utf8String)?;
    ...
    if let Some(glyph_run) = text.glyph_run(node) { /* :1153 DrawGlyphRun   */ }
    else if let Some(inline) = text.inline_fallback(node) { /* :1163 Inline */ }
    else { /* DrawTextFallback */ }
}
```

字符串在 wire 上丢了，在 paint 时没丢。整个方案架在这一点上。

### 1.5 pingo 的文本漏斗是结构性的

`:1137` 是引擎里唯一的文本发射点，三个分支。外部引擎需要靠纪律维持的「所有文本走
同一个 funnel」，本仓库在结构上已经成立。**缺的不是漏斗，是漏斗没有可观测出口。**

## 2. 目标与非目标

**目标**：能查询「本帧 Core 发出了哪些文本」——按绘制顺序，带节点、字符串、基线
坐标、走的哪条绘制通道；Rust 测试与 JS 都能用；**生产路径零成本**。

**非目标**：

- 不替代 a11y 语义树。语义树是**意图** oracle，探针是**渲染** oracle，价值在交叉验证。
- 不做「回放侧最终可见」判定（E11 的裁剪在 backend，见 §8）。
- 不改 DisplayList ABI，不加 opcode，不进 wire。
- 不做文本分组（相邻同父文本节点合并成一行）与选择语义，那是独立不变量。

## 3. 方案：拉取式探针，复用已缓存的子树

### 3.1 被否决的方案：在 paint 时记录

最直觉的做法是在 `:1137` 的漏斗里 push 一条记录，存进 `CachedSubtree`。**否决**，
因为它在探针关闭时仍然要付：每次子树构建一次 `Arc::from([])` 分配（`Arc<[T]>` 即
使空切片也分配 `ArcInner`）、每个缓存子树 +16 字节常驻、`build_node` 里一个分支。

AGENTS.md：「Avoid per-frame object, string, closure, listener, or proxy
allocation.」一个默认关闭的调试探针不得往 paint 热路径塞分配。

### 3.2 采纳的方案：数据已经全被缓存住了

`pingo-paint/src/engine.rs:333` 的模式分派是关键：

```rust
let mut built = if self.incremental_pictures_enabled {
    build_picture_graph(...)   // :676
} else {
    build_display_list(...)    // :528
};
```

两条路**都**填同一个 `subtrees: HashMap<NodeId, Arc<CachedSubtree>>`，都调同一个
`build_node`（`:550` 与 `:700`），都产出同样的 `local` / `post` / `children`。区别
只是有没有分配 picture id、以及根列表怎么组装。

而 `CachedSubtree.local` 是 `Arc<[DisplayInstruction]>`——**已解码**的指令；
`children` 来自 `children_in_paint_order`（`:571` / `:721`）——**已是绘制序**。

`build_display_list` 在 `:644` 的 `FlattenItem` 栈机就是所需的遍历：

```rust
instructions.extend_from_slice(&subtree.local);
stack.push(FlattenItem::Restore);
if !subtree.post.is_empty() { stack.push(FlattenItem::Post(subtree)); }
for child in subtree.children.iter().rev() { stack.push(FlattenItem::Subtree(child)); }
```

**探针是这棵已存在的树的第二个消费者**：同一个遍历，同一份数据，产出文本记录而不
是指令。它是一个 `&self` 的纯读函数，不调用就不存在。

### 3.3 这样做换来什么

| 维度              | 记录式（§3.1）       | 拉取式（§3.2）           |
| ----------------- | -------------------- | ------------------------ |
| 关闭时每帧分配    | 每子树 1 次          | **0**                    |
| 关闭时常驻内存    | +16B × 节点数        | **0**                    |
| `build_node` 改动 | 加分支               | **不动**                 |
| 开启时每帧成本    | 每文本节点 1 条 push | **0**（拉取式）          |
| 两条 paint 路一致 | 靠测试证明           | **构造上恒等**           |
| 缓存命中帧漏记    | 靠设计规避           | **不可能**，读的就是缓存 |

第五行是白捡的：记录式需要一项差分测试去*证明* Picture 路与 inline 路输出一致；拉
取式下两条路读的是同一个数据结构，一致性是构造性的，差分测试从「证明」降级为「回
归护栏」。

### 3.4 没有 Core 侧的开关

Core 侧没有「开启」这个状态：`CoreEngine::painted_text()` 是纯读函数，不调用就不
存在。开关只在 Host 侧，用来决定要不要每帧调用它——沿用 `layout_geometry` 的
「active 标志 + 每帧推送」形状，因此 worker 与主线程两条 transport 都能用。

原设计预留了一个编译期 feature `painted-text-probe` 以控制 WASM 体积。**实测后没有
启用**：整套探针 +2,152 gzip bytes（§6.3），距工程上限仍有 14,625 bytes 余量。不加
feature 的收益是 E2E 测的就是发布产物本身。若日后体积吃紧，把 `probe.rs` 与
`CoreEngine::painted_text` 一起 `#[cfg]` 掉即可——帧路径不引用它们，摘除是机械的。

## 4. 结构改动：一个都不需要

遍历要给每条记录标节点，但 `CachedSubtree`（`pingo-paint/src/engine.rs:178`）**不存
自己的 node id**。`child_ids` 是文档序、`children` 是绘制序，两者不能按下标对应，
恢复不出来。

原设计打算加一个 `node: NodeId`，并断言它填进现有 padding。**实测否决**：改动前
`size_of::<CachedSubtree>()` 是 96 字节（5 个 `Arc` 胖指针 + `usize` +
`Option<u32>`），没有可用 padding，加 4 字节会涨到 104——每个活节点 +8 字节。

采纳的做法不加字段：**缓存子树由 `Arc::clone` 共享，所以分配地址就是节点身份**。
查询时从 `PaintEngine::subtrees` 建一张 `Arc::as_ptr().addr() -> NodeId` 的表，遍历
时按指针查。零字节、零帧成本，且一个可达却查不到的子树会**报错而不是被标错节点**。

该断言仍然保留，方向反过来——它现在守的是「探针没有把结构撑大」：

```rust
#[cfg(target_pointer_width = "64")]
const _: () = assert!(size_of::<CachedSubtree>() == 96);
#[cfg(target_pointer_width = "32")]
const _: () = assert!(size_of::<CachedSubtree>() == 52);
```

按指针宽度分别固定，因为 `wasm32` 才是发布目标，也是有体积预算的那个。

## 5. 实现细节

### 5.1 坐标：从指令流累积，不查第二张表

`build_node` 自己把 `Save` / `Transform([f32; 6])` / `ClipRect([f32; 4])` 发进了
`local`（`pingo-abi/src/display_list.rs:41`、`:43`），遍历时维持一个 CTM 栈即可：每
节点 12 次浮点乘加，且**与真实绘制同源**。

不要用 `hit.geometry()`——那是第二个真相来源，会出现「探针算的坐标和画出来的不一
致」而无人能判定谁对。

CTM 栈里同时累积 `ClipRect`，于是「基线是否落在裁剪区内」是免费的，给记录带一个
`clipped` 标志，可抓「画了但被裁没了」这一类。

### 5.2 字符串解析：绝不回查 Scene

| 通道                     | 来源                               | 查找次数  |
| ------------------------ | ---------------------------------- | --------- |
| `DrawTextInlineFallback` | 指令自带 `text`                    | 0         |
| `DrawTextFallback`       | 指令自带 `string_id`               | 1（资源） |
| `DrawGlyphRun`           | `CoreTextSystem::text_value(node)` | 2         |

前两条通道的指令自带字符串，`pingo-paint` 直接照抄。第三条**不能**用
`scene.text_run(node).string_id`：一个正在编辑的节点画的是文本子系统覆盖后的内容，
所以 `pingo-paint` 只标记 `PaintedTextSource::NodeContent`，由 `pingo-core` 用
`text_value` 解析——`edit_overrides` 优先，Scene 字符串兜底。这正是原设计里最危险的
一条，见 §5.3。

### 5.3 密码：靠单一真相来源，不靠第二道过滤

原设计要在查询层按 `session_is_password(node)` 抹掉字符串。**实现时否决了这个方案，
因为它解决的是错误的问题。**

Core 本来就不画密码明文：`display_overrides()`
（`pingo-core/src/editing.rs:260`）给密码会话下发的是与字素数等长的 `•`，
`editable_batches_are_atomic_and_password_display_never_contains_plaintext` 已经断言
DisplayList 里不含明文。**探针只报告被画出去的东西，因此天然安全。**

真正的风险在 §5.2 那一条：如果 shaped run 的字符串从 `Scene::text_run` 反查，探针就
会报出一个**从未被画出的值**——对密码框而言正是明文。所以防线是「解析必须走画出内容
的那个来源」，不是「事后再抹一遍」。少一道可能腐化的过滤，多一条被测试钉住的不变量
（`painted_text_never_reports_a_password_value`）。

### 5.4 输出格式

沿用 `semantics()`（`pingo-core/src/engine.rs:2204`）的形状，字段由
`schemas/protocol.v1.json` 的 `paintedTextBatch` 生成，Rust 与 TypeScript 共用：

```
u32 version | u32 flags | u32 record_count
每条: node_id | flags(channel|clipped|unattributed) | x.to_bits() | y.to_bits() | text_bytes
      + UTF-8 bytes + 补齐到 4 字节
```

比 `semantics()` 多一个头部 flags 字，用来报告记录数触顶被截断——AGENTS.md 的
「No silent caps」不接受静默截断。

出口链路：`CoreEngine::painted_text()` → `WasmCore::painted_text()` →
`CanvasFrameSink.setPaintedTextActive` + `onPaintedText` → `HostedCanvasRoot`
的 `onPaintedText` 选项与 `paintedText()` 读取器。Host 侧沿用 `layout_geometry`
的 active 标志 + 每帧推送形状，因此 worker 与主线程两条 transport 都可用；
`parsePaintedText` 是与其他解码器同级的信任边界。

## 6. 收益口径与性能验证

收益不以毫秒计——探针不改变任何生产行为。收益是**可断言性**：一条「文本确实被画出」
的机械判据，替换掉像素快照。

以下四项全部实测完成，同 workload、同 build mode、同采样方法。

### 6.1 热路径无回归

`scripts/check-workload-performance.mjs`，改动前后各 4 次，取中位数（P95 ms）：

| workload             | 改动前 | 改动后 |
| -------------------- | -----: | -----: |
| dense-ui             |  1.973 |  1.776 |
| scattered-mixed-5000 |  9.203 |  9.198 |
| reflow-head-5000     |  9.320 |  9.260 |

无回归。paint 热路径**逐字节未变**——没有新字段、没有新分支、没有新分配，探针的代码
在帧路径上根本不被引用。`dense-ui` 上那 10% 的下降不作为收益主张，它是代码布局造成
的运行间波动。

唯一进入提交路径的改动来自 §9 那条 Scene 修复：非结构提交在**定义了 computed style
时**才重算一次能力位，滚动与动画帧不付任何代价。

### 6.2 结构未增长

§4 的 `size_of::<CachedSubtree>()` 编译期断言，64 位 96 字节、32 位 52 字节，两者
都由 `cargo check` 守住。

### 6.3 WASM 体积

同一 `pnpm core:wasm` 口径，clean build：

| 构建     |  raw bytes | gzip bytes |
| -------- | ---------: | ---------: |
| 改动前   |  1,022,063 |    376,439 |
| 改动后   |  1,030,512 |    378,591 |
| **增量** | **+8,449** | **+2,152** |

距 [`wasm-size-attribution.md`](wasm-size-attribution.md) 的 384 KiB 工程上限仍有
14,625 bytes。因此不启用编译期 feature（§3.4），发布产物即 E2E 所测产物。

### 6.4 查询成本本身

`pnpm e14:perf`（`core/pingo-core/examples/e14_painted_text_benchmark.rs` +
`scripts/check-e14-painted-text-performance.mjs`），200 采样：

| 场景             | 记录数 | probe p50 | probe p95 | 同场景 frame p95 |
| ---------------- | -----: | --------: | --------: | ---------------: |
| 400 行 inline    |    400 |      92µs |     107µs |          1,108µs |
| 400 行 Picture   |    400 |      61µs |      70µs |          1,130µs |
| 4,000 行 inline  |  4,000 |     574µs |     625µs |         11,434µs |
| 4,000 行 Picture |  4,000 |     606µs |     646µs |         12,030µs |

10 倍场景对应 9.4–10.0 倍成本（三次重跑）——线性，符合「走一遍已缓存的树」的设计。
约为它所描述的那一帧的 5%，可以在 E2E 里逐帧轮询。门禁固定了三条：记录数必须等于行数
（否则「什么都没报」会显得无限快）、p95 上限、以及增长倍数上限（防止走法退化成平方）。

## 7. 测试

| 层              | 内容                                                                                                                                    |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| T1 单元         | 三条通道各产一条记录；不可见 / `display_none` 不记；改文本记录跟着改                                                                    |
| T2 漏斗完整性   | 遍历本帧全部 `local` / `post`，`DrawGlyphRun + DrawTextFallback + DrawTextInlineFallback` 的条数与顺序必须与探针记录**逐条对应**        |
| T3 两路回归护栏 | 同场景 Picture 开/关，`painted_text()` **逐字节相同**                                                                                   |
| T4 属性测试     | 随机 scene + 随机滚动/可见性变更，探针输出 == 强制全量重画后的输出                                                                      |
| T5 端到端       | 把 `onPaintedText` 与 `getByRole` 交叉断言：语义树说「button named X 可见」∧ 探针说「X 这一帧被画了」，且 `display:none` 的串两边都没有 |

T2 是这套方案的核心门禁：将来若有人新增一个画文本的 opcode 而不走 `:1137` 的漏斗，
它会立刻红——判据来自**产出的指令**，不是源码 grep，绕不过去。

T5 是第一条同时断言语义与渲染的用例：两者都由同一帧驱动，任何一侧单独通过都不足以
说明用户看见了什么（§1.1）。

## 8. 语义边界（必须写进 API 文档）

这三条不写进去，用起来一定误判：

1. **探针是「Core 发出侧」，不是「回放可见侧」。** E11 的裁剪在 backend
   （[`e11`](e11-viewport-culling-design.md) §2 论证了不能在 Core 生成时裁），被裁
   掉的文本**仍会出现在探针里**。要断言「确实被裁了」得等回放侧计数器。
2. **虚拟化未物化的行走 `FillPlaceholder`，没有文本记录。** 这是正确语义，但会意
   外。API 命名用 `paintedText` 而非 `allText`。
3. **密码字段报告的是 `•`，不是明文，也不是空**（§5.3）。探针报告被画出的内容，
   而密码框画的就是掩码。
4. **同一个节点最多一条记录。** 一个 Scene 节点只有一个 text run，所以「三个相邻
   文本节点」在探针里就是三条记录；把它们并成一行是消费方的事（§11）。

## 9. 落地时发现并单独修复的既有缺陷

写 T1 的 z-index 用例时，`z_index()` 在一次**只改样式**的提交后仍然返回 0，尽管
`style_length()` 已经能读到该值。

根因：`Scene::commit_non_structural`（`pingo-scene/src/scene.rs:1181`）从不调用
`refresh_style_capabilities()`；`commit_structural` 与
`commit_with_resource_releases` 都调用。而 `z_index` / `position` / flex 尺寸 /
`box_shadow` 这四个稀有属性由能力位一次性判定，能力位关着就整条被忽略。

影响面：给一个已存在的节点加上 `z-index`、`position`、`flex-grow` 或 `box-shadow`，
只要那一帧没有建/删/移动节点，也没有释放资源，**这些属性就会被静默忽略**，直到下一
次结构提交。悬停时加一个 `box-shadow` 正是这个形状。

修复是一行，并且只在该批次确实定义了 computed style 时才重算——这条路径只增不减资源，
不可能关掉某个能力位，所以增量判定是精确的，滚动与动画帧不付代价。回归测试
`a_style_only_commit_turns_on_a_rare_property_capability` 已验证在去掉修复时会失败。

这条与 E14 无关，属于独立的正确性修复，只是被本文的测试找出来。

## 10. 失败模式与回滚

| 失败模式                            | 判据                       | 处置                                 |
| ----------------------------------- | -------------------------- | ------------------------------------ |
| 探针撑大缓存条目                    | §4 的 `size_of` 断言不通过 | 停止合入；探针不得改动帧路径结构     |
| paint 阶段出现毫秒回归              | §6.1 benchmark p95 超噪声  | 回退该 PR                            |
| WASM 超预算                         | 体积归因超出 M9 headroom   | 把 `probe.rs` 与出口一起 `#[cfg]` 掉 |
| `children` / `child_ids` 语义被改动 | T2 在 z-index 重排场景失败 | 停止合入，先固定该不变量             |
| 缓存与 Scene 不一致                 | `MalformedPaintCache`      | 报错而非标错节点，属于可诊断失败     |

回滚是纯粹的：探针不进 Mutation Stream、不进 DisplayList，帧的产出字节完全不变，
Host 侧不提供 `onPaintedText` 即完全不触发。

`children` 是绘制序、`child_ids` 是文档序——这条语义差是本方案的地基，由 T2 的
z-index 场景守护。

## 11. 落地切分（已完成）

1. `probe.rs` 遍历器 + `size_of` 断言 + T1/T3/T4（纯 Rust，不碰 `build_node`，
   不碰 ABI）
2. `paintedTextBatch` schema + 生成器 + `CoreEngine::painted_text()` + T2
3. `wasm.rs` 出口 + Host 两条 transport 的 active/推送通道 + `parsePaintedText`
   信任边界与其恶意输入用例 + facade 类型导出 + WASM 体积记账
4. T5 端到端 + §6 的四项性能验证归档 + `pnpm e14:perf` 门禁

## 12. 本文不做的事

不实现回放侧「最终可见」探针；不做文本分组与 copy/search 一致性不变量（独立议题，
但探针为其提供断言手段）；不引入 chrome / content 的文本分类——本仓库当前没有对应
概念，不在此发明。
