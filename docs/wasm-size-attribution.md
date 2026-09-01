# M9 产品 Core WASM 体积归因

本报告固定 M9 候选门禁的构建口径和可回滚优化。产品硬上限仍为 `< 400 KiB` gzip；
M9 另设 `≤ 384 KiB` 工程门禁，以保留至少 16 KiB 的维护余量。

## 可复现口径

- Rust：`rustc 1.96.0 (ac68faa20 2026-05-25)`，由仓库 `rust-toolchain.toml` 固定；
- 打包：`wasm-pack 0.14.0`，target `web`，workspace release profile；
- Binaryen：`wasm-opt 117`，pass 列表写入生成的 `packages/host/wasm/manifest.json`；
- 冷环境：第一次 `wasm-pack build` 先原子填充它自带的 Binaryen cache，构建器随后验证
  cache 中的实际 `wasm-opt --version` 必须精确为 117；错误或缺失版本仍失败关闭；
- 命令：`pnpm core:wasm:repro` 在两个独立临时 target/output 目录 clean build，要求
  SHA-256、raw bytes 和 gzip bytes 三者完全一致；
- 冷启动：同一门禁实例化候选 WASM，并要求 `< 50ms`。

M8 基线 commit `b564140` 为 409,197 gzip bytes。M9 两次 clean build 均为
1,115,466 raw bytes、389,844 gzip bytes，SHA-256
`8ec99e23d010a33e725fe484fe83602391b5486505afd7c065b0872df61f6c78`。相对基线减少
19,353 gzip bytes；距离 384 KiB 工程上限仍有 3,372 bytes，距离 400 KiB 产品上限
有 19,756 bytes。

## 2026-08-22：有序容器回收

M9 之后只剩 3,372 bytes 余量，E5（flex 主轴）与 E1（keyboard）落地后余量降到
**42 bytes**，触发本文"gzip 超过 384 KiB：停止新增 Rust 能力，先按 section 和依赖树
归因"这一条。归因结果与处理如下。

### 归因方法

`scripts/attribute-wasm-code.mjs` 把 code section 的每个函数体按 name section 归给
函数与 crate。它是**诊断脚本，不是门禁**——门禁仍由 `measure-wasm-budget.mjs`
按 section 总量把关。产品构建被 strip，所以要单独构建一个保留 name section 的模块
（命令写在脚本头部注释里）；该构建不过 wasm-opt，绝对值比产品模块高约 12%，
本节只用它的**相对权重**。

### 归因结论

回收前 code bodies 共 972,953 bytes / 4,281 个函数。最大单项不是任何渲染代码：

| 归属                        |   bytes |  占比 |
| --------------------------- | ------: | ----: |
| `alloc::collections::btree` | 216,100 | 22.2% |
| `core`（fmt/slice/num 等）  | 110,090 | 11.3% |
| pingo-core                  |  95,991 |  9.9% |
| swash（shaping）            |  83,823 |  8.6% |
| hashbrown                   |  50,025 |  5.1% |

`BTreeMap`/`BTreeSet` 按 (K, V) 单态化，每一对都会生成完整的节点平衡、分裂、
合并与导航代码。Core 里有约 20 个不同的 (K, V) 组合，平均每个约 10.8 KB。

### 处理

新增 `core/pingo-collections`：`OrderedMap` / `OrderedSet`，用**有序 Vec + 二分查找**
提供同样的有序迭代与 `O(log n)` 查找，插入/删除改为移动元素而非重平衡节点。
每个单态化约几百字节而非 10.8 KB。

**只替换小的或批量重建的映射**，插入密集的大映射（`BTreeMap<NodeId, PlanNode>`、
`BTreeMap<u32, Resource>`）仍是 `BTreeMap`——有序 Vec 在那里会把提交变成 `O(n²)`。
已替换：interaction 的 pointer/capture/mask、scroll 的 state/materialized、
animation 的 durable/transition/keyframe、editing 的 session、
scene 的 `Prop` 通道与 interaction state。

`OrderedMap::from_iter` 一开始逐条 `insert`，对乱序输入是 `O(n²)`；这在 m1 上表现为
p95 +3.6%。改为一次排序后，m1 回到基线的 ±1% 内（噪声范围）。

### 结果

| 指标               |               回收前 |      回收后 |
| ------------------ | -------------------: | ----------: |
| gzip               |              393,174 | **362,853** |
| 384 KiB 余量       |                   42 |  **30,363** |
| code section       |              869,844 |     727,730 |
| 函数数（带名构建） |                4,281 |       3,586 |
| m1 p95             | 3.026 ms（基线均值） |    3.057 ms |
| m3 p95             |              0.79 µs |     0.75 µs |

即使把 E5+E1 新增的能力算进去，产品模块也比 M9 基线（389,844）小 26,991 bytes。

### 下一批候选（尚未动手）

- `core float formatting`（flt2dec，约 16 KB）：错误类型的 `Display` 用 `{self:?}`
  打印带 `f32` 字段的结构，拉进了完整的最短浮点表示算法。
- `hashbrown`（约 50 KB）：paint 的 `HashMap<NodeId, Arc<CachedSubtree>>` 等；
  改有序容器还能顺带去掉一处哈希序依赖，但 n 较大，需要先测。
- 剩余 `alloc::btree`（约 63 KB）：即上面刻意保留的大映射，要换需要先解决
  批量插入的复杂度。

## 主要来源与优化

当前 raw section 归因由构建器直接解析 WASM v1 section，并断言总和等于文件大小：

| section          |   bytes | 说明                                        |
| ---------------- | ------: | ------------------------------------------- |
| code             | 767,674 | Core、布局、文本、协议和 Picture 指令实现   |
| data             | 248,495 | 静态表、字符串、字体/Unicode 相关数据       |
| function         |   3,344 | 函数索引表                                  |
| 其余全部 section |   2,159 | type/export/element/import/custom/header 等 |

上表为 2026-08-25 复核值（见本文末节）；M9 出口时的对应值为 862,006 / 247,479 /
3,915 / 2,066，差额来自其后的有序容器回收。

体积恢复来自三项可独立回滚的构建/依赖调整：移除重复的直接 `ttf-parser` 依赖，使用稳定
WASM operator 编码避免额外兼容实现，以及在固定 Binaryen 版本上采用定点
duplicate-function-elimination、vacuum、DAE 和 instruction optimization。没有删除 ABI
解码校验、fallback、inline reference、编辑、无障碍或媒体能力，也没有放宽 fuzz、差分、
覆盖率或浏览器门禁。

同一依赖清理也让 `pingo-probe-wasm-budget` 的 aarch64 macOS 固定口径从
377,967/148,458 raw/gzip bytes 变为 377,807/148,428（分别减少 160/30 bytes）；
`docs/evidence/wasm-budget.v2.json` 已显式重审这一 host baseline，300 KiB 探针上限不变。

> **2026-09-01 更正**：这 160 bytes 不是依赖清理省下来的，是构建机路径长度的差异。
> 见下文《探针基线对构建机路径敏感》。300 KiB 探针上限的结论不受影响。

## 2026-08-22：E8 布局回读通路

| 阶段                                                | gzip bytes | 增量   |
| --------------------------------------------------- | ---------- | ------ |
| E8 之前                                             | 369,999    | —      |
| E8-1/E8-2 `ObserveGeometry` + `layoutGeometryBatch` | 371,101    | +1,102 |
| E8-3…E8-7 Core 导出、观察集、诊断字段               | 371,133    | +32    |

**合计 +1,134 bytes**，工程预算 393,216 仍余 22,083。远低于立项时 5–15 KB 的预估，
原因是新增的 Rust 代码几乎全是编解码与集合操作，没有引入新依赖，也没有新的
monomorphisation 面——观察集用的是既有的 `pingo-collections::OrderedSet`，几何重算
复用 `pingo-hit` 已有的仿射与裁剪折叠，`WorldGeometry` 一个字节都没加宽。

因此**没有动用**工程预算到产品预算之间那 16,384 的余量。子计划 E8-8 允许动用它，
但这次不需要，这条记录是为了让"允许"不被读成"已经用了"。

## 2026-08-25：M9 后置复核与 E9/E10 之后的增量

E8 之后又落地了 E9、E10 和一批布局/滚动/样式修复，本文的时间线却停在 371,133，
出现了**记账缺口**。本节按同一固定口径复核，把缺口补齐。

### 权威口径

`pnpm core:wasm:repro` 在两个独立临时目录 clean build，结果字节一致：

| 指标                 | 值                                                                 |
| -------------------- | ------------------------------------------------------------------ |
| gzip                 | **376,313**                                                        |
| raw                  | 1,021,672                                                          |
| SHA-256              | `cc80db8da80641f480c749f24a8cf4105d0e2a98c886e69faaa3bc676dc8e72e` |
| 冷启动               | 1.220ms（门禁 `< 50ms`）                                           |
| 384 KiB 工程预算余量 | **16,903**                                                         |
| 400 KiB 产品上限余量 | 33,287                                                             |

### 增量归因

按同一构建脚本在四个历史提交上各构建一次测得。**方法自校验**：在 E8 出口提交
`07898f7` 上重建得到 371,133 gzip，与本文上一节记录的值逐字节相同，说明口径没有漂移，
下面的差值可以直接相减。

| 阶段                                                    | commit    | gzip bytes |   增量 |
| ------------------------------------------------------- | --------- | ---------: | -----: |
| E8 出口（本文上一节）                                   | `07898f7` |    371,133 |      — |
| E9 contextmenu + E10 矢量路径（资源布局、d 解析、描边） | `c78e770` |    372,852 | +1,719 |
| 渲染/文本/编辑修复批 + 文本节点的 padding/border/圆角   | `7225064` |    373,437 |   +585 |
| 绝对定位包含块 + Core 绘制滚动条 + `scrollbar-color`    | `1512c75` |    375,366 | +1,929 |
| 虚拟项拉伸、flex 自动最小尺寸、表头不可压缩             | `f0bdb6f` |    376,313 |   +947 |

**合计 +5,180 bytes**。最大单段 1,929 bytes，**没有任何一段触及本文 4 KiB 的显式
审阅线**——这是补记而不是超支。E10 引入了完整的路径资源、`d` 语法解析和描边光栅化，
只花掉 1,719 bytes，因为它复用了既有的资源槽位（`ResourceKind::Path = 3` 在 ABI 里
早已占号）与 Canvas2D 后端已有的 `Path2D` 重放路径，没有新增依赖。

### 当前构成

带 name section 的诊断构建（`scripts/attribute-wasm-code.mjs`，未过 wasm-opt，绝对值
比产品模块高约 12%，只看相对权重）：code bodies 854,145 bytes / 3,684 个函数。

| 归属                            |   bytes |  占比 |
| ------------------------------- | ------: | ----: |
| `core`（fmt/slice/num/flt2dec） | 143,620 | 16.8% |
| `alloc`（vec/raw_vec/btree 等） | 103,321 | 12.1% |
| pingo-core                      |  87,783 | 10.3% |
| swash（shaping）                |  79,725 |  9.3% |
| pingo-abi                       |  54,936 |  6.4% |
| ttf-parser                      |  47,070 |  5.5% |
| hashbrown                       |  46,566 |  5.5% |
| pingo-scene                     |  33,666 |  3.9% |
| pingo-layout                    |  26,554 |  3.1% |
| pingo-paint                     |  23,596 |  2.8% |

这张表按 **crate** 汇总，粒度与「有序容器回收」一节那张表不同：那里把
`alloc::collections::btree` 单列为 216,100 bytes / 22.2%，这里它被并入 `alloc` 的
103,321 bytes。因此只能得出一个方向性结论——btree 的份额必然低于 103,321，不再是
最大单项——而不能与 216,100 直接相减。函数数从回收后的 3,586 增至 3,684（+98）。

本文「下一批候选」一节列出的三项（float formatting、hashbrown、剩余 btree）仍然
成立且**均未动手**；`core` 升到首位与其中的 flt2dec 一项相符，但本节没有做函数级
拆分去坐实这一点。

## 2026-08-31：E14 painted-text 探针

同一 `pnpm core:wasm` 口径，改动前后各一次 clean build：

| 阶段                                                    | raw bytes | gzip bytes | 增量       |
| ------------------------------------------------------- | --------- | ---------- | ---------- |
| E14 之前                                                | 1,022,063 | 376,439    | —          |
| `pingo-paint::probe` + `CoreEngine::painted_text` + ABI | 1,030,512 | 378,591    | **+2,152** |

工程预算 393,216 仍余 14,625。

E14 的设计（[`e14-painted-text-probe-design.md`](e14-painted-text-probe-design.md)
§3.4）为体积预留了一个编译期 feature，**这次没有启用**：+2,152 在余量之内，而不启用
的收益是端到端测的就是发布产物本身，而不是一份只在测试里存在的构建。

增量的来源是一个新遍历器加一个二进制编码器，没有新依赖、没有新的 monomorphisation
面——它复用 `pingo-paint` 已有的 `HashMap<NodeId, Arc<CachedSubtree>>` 与 `pingo-abi`
的字批布局。若余量吃紧，把 `probe.rs` 与 `CoreEngine::painted_text` 一起 `#[cfg]`
掉即可全额回收：帧路径不引用它们，摘除是机械的。

## 2026-09-01：E15 富文本

同一 `pnpm core:wasm` 口径，三次构建：

| 构建                                 | raw bytes | gzip bytes | 相对基线 |
| ------------------------------------ | --------- | ---------- | -------- |
| E15 之前（`f0ce23a`）                | 1,031,280 | 378,668    | —        |
| E15，`--no-default-features`（默认） | 1,072,096 | 392,103    | +13,435  |
| E15，`PINGO_RICH_TEXT=1`             | 1,124,402 | 410,959    | +32,291  |

带上 `rich-text` 的构建 **超出 384 KiB 工程门禁 17,743 bytes，也超出 400 KiB 产品硬上限
1,359 bytes**。这正是 E15 设计 §10 风险表里写好的那一行——"WASM 体积吃掉 M9 余量
→ 富文本作为可选模块"——所以按它处置：

- `pingo-core` 的 `rich-text` feature 默认开启，`cargo test --workspace` 因此测的是
  完整能力；
- `pnpm core:wasm` 默认传 `--no-default-features`，发布产物 **不含** 该模块，落在
  392,103，工程门禁下仅余 **1,113 bytes**；
- `PINGO_RICH_TEXT=1 pnpm core:wasm` 产出含该模块的产物，此时按产品上限计量，manifest
  的 `richText: true` 记录了产物是哪一种。**这一产物当前 410,959，超出产品上限 1,359
  bytes**：产物会先写出（开发与端到端构建可以用），随后构建失败——它说的是这份产物在
  Core 把字节还回来之前不能发布。

**13,435 的常驻增量**（feature 关掉也在）来自不能按能力摘除的部分：ABI 新增的
`StyledRuns` 资源、`SetRichText`、编辑事务上的 mark/映射负载、三条文档输入指令、
`ConfigureDocument` 的块列表，以及 `Structure`/`DocumentSelection` 反向记录；Scene 的
`documents` lane 与 run 表校验；`EditSession` 里织进去的 mark 表与位置映射。把这些也做成 feature 会让**解码器出现两种
方言**——同一个 ABI 版本号，两套可接受的指令集——这是信任边界上不该引入的歧义，所以没有
做。

由此工程余量从 14,625 降到 **1,113**。**下一次 Rust 能力新增必须先回收再动手**：常驻
路径已经没有空间了，任何新增都会直接顶破工程门禁。可回收的部分按代价排序：

1. 把 ABI 的文档指令与 `Structure`/`DocumentSelection` 记录一并 feature 化（约 4–6 KiB，
   但引入双方言）；
2. 把 `EditSession` 的 mark 表与 `PositionMap` 拆到 feature 后（约 3–4 KiB，需要把
   undo 历史里的 marks 一起拆开）；
3. 重新审视 `pingo-text` 的多 run 机器（约 1–2 KiB）。

**富文本产物要发布，还差 1,359 bytes。** 试过的两项：

- 把 `pingo-core::text` 里解析 Scene run 表与解析会话 mark 表的两份实现合成一份，省
  **79 bytes**（已保留——它本来就该是一份，两份就是两个地方可以让同一段文字在已提交帧
  和正在编辑的帧里解析出不同的样式）；
- 把 `pingo-edit::document` 的 `Debug` derive 在 release 下摘掉，省 **1 byte**——那些
  impl 早已被死代码消除，这条**无效**，不必再试。

`design.md` §17 风险表对「WASM 仅贴线通过产品上限」给的处置有三条，前两条（工程余量门禁、
size attribution）已经在做，第三条是**可选模块延迟加载**——把 rich-text 拆成独立加载的
第二个 wasm 模块。那是真正能让这份产物发布的路，也是一次单独的架构改动，不在 E15 范围
内。在它落地之前，富文本能力完整可测，但承载它的产物不能发布。

## 2026-09-01：探针基线对构建机路径敏感

`pnpm wasm:build` 在本机报告 `aarch64-apple-darwin` 基线不符：期望
377,807/148,428，实测 377,967/148,464。逐条排查后确认**与仓库内容无关**：

- 在记录该基线的提交 `6629f82` 上、用干净 target 目录、`--locked` 重建探针，得到的是
  377,967 —— 和当前 HEAD 逐字节相同。`6629f82..HEAD` 之间只有 `30d33e8` 碰过
  `Cargo.lock`，加的是 `pingo-collections`，不在探针的依赖图里；
- `measure-wasm-budget.mjs` 不过 wasm-opt，产物只由 源码 + `Cargo.lock` + release
  profile + rustc 1.96.0 + wasm32 std 决定，没有 `RUSTFLAGS`、没有 `.cargo/config.toml`。

真正的变量是**嵌进产物里的绝对源码路径**。panic location 会把
`$CARGO_HOME/registry/src/index.crates.io-<hash>/<crate>/src/...` 原样写进 data
section，实测：

| 构建                                          | raw bytes | 相对本机 |
| --------------------------------------------- | --------- | -------- |
| 本机（registry 前缀 64 字符）                 | 377,967   | —        |
| `--remap-path-prefix` 到 2 字符               | 376,727   | −1,240   |
| `--remap-path-prefix` 到 56 字符（短 8 字符） | 377,791   | −176     |

即前缀每短 1 个字符，产物少约 22 bytes——探针里有 22 处这样的路径。记录下来的
377,807 恰好对应一台 registry 前缀比本机短约 7 个字符的机器。上一节那条「依赖清理省下
160 bytes」是同一现象的误判：清理确实落地了（探针的 `Cargo.toml` 现在没有
`ttf-parser`），但前后两次测量不在同一台机器上，160 bytes 是路径差，不是代码差。

**处置**：只重录 `aarch64-apple-darwin` 一条为 377,967/148,464。`x86_64-unknown-linux-gnu`
不动——CI 在 ubuntu runner 上按它把关，本机没有 Linux 环境可以重测，改测量口径会作废一条
我无法验证的基线。

**遗留**：这个门禁按字节严格比对，所以它同时在量代码和量文件系统。换机器、换用户名、换
`CARGO_HOME` 都会让它失败，且失败信息看不出是哪一种。彻底的修法是给
`measure-wasm-budget.mjs` 固定 `--remap-path-prefix`（registry 根 + workspace 根都映射到
定长 token），产物随之与路径无关、大概率也与 host 无关，两条 baseline 可以合并成一条。
代价是**两个 host 的基线都要在新口径下重测一次**，其中 Linux 那次必须在 CI 上做。这项没有
在本次一并做掉，就是因为无法在本机验证 Linux 侧的新值。

再次出现同类不符时的判定顺序：先在记录基线的提交上重建，若与 HEAD 一致即为环境差异；
再用上表的 22 bytes/字符 估一下路径长度差是否对得上；两者都成立才重录，并在此追加一节。

## 失败模式与回滚

- 任一 clean build 不同：拒绝候选，保留两个产物和工具版本做差分，不更新基线掩盖差异；
- gzip 超过 384 KiB：停止新增 Rust 能力，先按 section 和依赖树归因
  （`scripts/attribute-wasm-code.mjs` 给出按函数/crate 的明细）；400 KiB 产品上限
  不得作为日常余量使用；
- Binaryen 优化改变输出语义：撤销对应 pass，并以 native/WASM 字节差分、ABI golden、
  browser vertical slice 和 inline Picture oracle 定位；
- 冷启动超过 50ms：拒绝候选并回滚最近的构建或初始化路径变化。

生成 manifest 是构建产物，不作为手工基线提交；候选报告读取其 digest、section 归因和
`reproducibleCleanBuilds: 2`，但不会 tag、发布 npm 或修改线上配置。
