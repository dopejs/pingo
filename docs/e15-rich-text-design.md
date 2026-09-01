# E15 设计门：富文本编辑（inline marks + 块结构）

- 状态：Proposed
- 日期：2026-09-01
- 关联：[`AGENTS.md`](../AGENTS.md) scope 排除项与「Editable text is a Core
  subsystem」不变量、[`design.md`](design.md) 编辑子系统、
  [`m10-capability-decisions.md`](m10-capability-decisions.md) §重新评审条件
- 定位：**当前 ABI 里，「把一段话中间三个字加粗」没有任何表示方式。**

## 1. 现状取证

### 1.1 一个文本节点只有一个 style

`pingo-scene/src/scene.rs:73`：

```rust
pub struct TextRun {
    pub string_id: u32,
    pub style_id: u32,
}
```

`pingo-abi/src/mutation.rs:89` 的 `SetTextRun { node_id, string_id, style_id }`
是唯一的文本装配指令。**一个节点一个字符串、一个样式**，段落内的样式变化只能靠拆成
多个 Scene 节点表达——而那样它们就是彼此独立的可编辑单元。

### 1.2 shaping 是单字体单字号的

`pingo-text/src/layout.rs:802`：

```rust
fn shape(context: &mut ShapeContext, font: &FontFace, text: &str, font_size: f32)
```

`TextLayout`（`:190`）里没有 run 表，`PositionedGlyph`（`:137`）也不带样式或字体标识。
换行、caret stop、cluster 全部建立在「整段同一字体」的前提上。

### 1.3 编辑会话是一个扁平 String

`pingo-edit/src/session.rs:36`：

```rust
pub struct EditSession {
    text: String,
    index: TextIndex,
    selection: Selection,
    composition: Option<Composition>,
    ...
}
```

没有 mark，没有块，没有属性。`EditDelta`（`types.rs:129`）只有
`{ range: Utf16Range, text: String }`——事务模型能表达的全部变化就是「用一段文本替换
一个范围」。

### 1.4 撤销没有分组，一次按键就是一步

`pingo-edit/src/session.rs:499` 的 `push_undo` 对每一次文本变更无条件入栈，没有任何
合并条件。**敲五个字就是五步撤销**——这在纯文本输入框里已经不符合预期，在块编辑器里
会让 Ctrl+Z 不可用。

### 1.5 paint 每个节点只发一条文本指令

`pingo-paint/src/engine.rs:1137` 的分支对每个节点发且仅发一条
`DrawGlyphRun` / `DrawTextFallback` / `DrawTextInlineFallback`。

### 1.6 这条能力目前被 scope 明确排除

`AGENTS.md`：「The current scope explicitly excludes ... business-level rich-text
document semantics such as collaboration, formulas, or Markdown commands.」

本文的作用就是把 A/B/U 三档从排除项里拿出来、变成有门禁的已批准范围。仍然排除的是
§2.3 那一组：协同、行内原子对象、表格、插件体系。

## 2. 目标与非目标

目标形态是 tiptap / 飞书文档那样的所见即所得块编辑器：输入 `## ` 当场变成标题，标记符号
消失，而不是一个显示 markdown 源码的编辑器。

分类的依据是**需不需要 Core 新增能力**，而不是功能听起来大不大。

### 2.1 本门禁的范围：Core 能力

**A 档（inline marks）**：单个可编辑区域内，文本携带有序的样式分段，支持粗体/斜体/
下划线/删除线/行内代码/链接的开关与查询，caret、选区、IME、undo/redo 全部保持正确。

**B 档（块结构）**：文档由有序块组成（段落、标题、列表项、引用、代码块），回车分块、
块首退格合并、跨块选区与跨块删除，块级属性（层级、列表类型）可切换。

**U 档（undo 分组）**：见 §1.4 的取证——今天每一次文本变更都单独入栈，敲五个字就是五步
撤销。这在纯文本输入框里已经不对，在块编辑器里是硬阻塞：Ctrl+Z 必须撤销一次输入突发或
一次自动格式化，而不是一个字符。

### 2.2 不在本门禁范围：Shell 侧编辑器功能

这些是 tiptap / 飞书手感的主要来源，但它们**不需要 A/B/U 之外的任何 Core 能力**，因此
属于 `@dopejs/pingo-editor` 而不是本文：

- **行内输入规则**（`**粗体**`、`*斜体*`、`` `代码` ``、`~~删除线~~`、`[文字](链接)`）：
  在收尾定界符提交时，删掉标记字符并对剩下的范围施加 mark。用到的全部是 **A 档**能力，
  因此它比块级规则早一整档到位——A2 完成后就能有一个可用的行内格式化编辑器，此时块模型
  还没开始。
- **块级输入规则**（`## ` → 标题、`- ` → 列表、`>` → 引用、` ``` ` → 代码块）：观察已
  提交的 `EditTransaction` 流，匹配到就发一次「改块类型 + 删除标记字符」的文档变更。
  用到的是 **B 档**能力。
- **斜杠菜单、工具栏、块拖拽重排**：弹层与命中测试已有（M6 的 overlay/absolute
  positioning 已 Adopt），触发的动作同样是文档变更。
- **markdown 与 HTML 的序列化/反序列化**：纯 Shell 侧的文档模型转换，Core 不参与。

上一版把「Markdown 输入规则」列进不做的事，是把「不是 Core 能力」误当成「不在范围」。
这里更正。

### 2.3 仍然排除（C 档）

- **协同编辑与 CRDT**：会改变文档所有权模型，需要单独的门禁。
- **行内原子对象**（图片、mention、公式夹在文字流里）：caret 要能整体跨过一个非文本
  原子，这是 A/B 之外的 Core 能力。**B 档完成后最可能的下一个候选**，但不在本文。
- **表格**：跨单元格选区是又一套选区模型。
- **第三方插件体系与 schema 校验框架**。

本文不为 C 档预留 API。

## 3. 缺口清单

Core 必须新增的能力，按档分：

| 档  | 缺口                         | 影响                                                         |
| --- | ---------------------------- | ------------------------------------------------------------ |
| A   | 文本节点携带多个 styled run  | `pingo-scene` 存储、`pingo-abi` 新增/扩展装配指令            |
| A   | 分段 shaping 与跨段换行      | `pingo-text` 的 shape/line-break/caret 全部要按 run 切分     |
| A   | glyph 带 run 标识            | `PositionedGlyph` 加字段；glyph span 资源按 run 切分         |
| A   | paint 每节点发多条 glyph run | `pingo-paint` 文本分支，E14 探针的 funnel 不变量随之扩展     |
| A   | 会话携带 mark 并随编辑变换   | `pingo-edit`：插入/删除要移动 mark 边界，切换要分裂/合并 run |
| A   | 事务表达属性变化             | `EditDelta` 之外需要 mark delta，ABI 版本递增                |
| U   | undo 分组                    | `pingo-edit` 历史栈；事务需要能声明「与上一步合并」          |
| B   | 文档 = 有序块，选区跨块      | 会话模型从「一个节点一个 session」上移到文档级               |
| B   | 回车分块 / 退格合并          | 结构性编辑要与 Scene 的节点增删原子对齐                      |
| B   | 长文档的块虚拟化             | 未物化的块必须仍能参与选区与 caret 计算                      |

## 4. 提议的模型

### 4.1 Inline：run 表挂在文本节点上

文本节点从 `(string_id, style_id)` 变为 `(string_id, runs)`，`runs` 是**按字节升序、
不重叠、覆盖全长**的 `(byte_range, style_id)` 列表。单 run 是它的退化情形，因此现有
场景的表示与开销不变。

选这个而不是「样式即字符属性」的理由：run 表与 shaping 的分段边界天然一致，且
`style_id` 已经是 interned 资源，重复样式不额外占空间。

**未决：带属性的 mark 归谁。** 链接需要一个 href，而 href 不是样式——它不影响绘制（影响
绘制的只有颜色和下划线，那些是 `style_id` 的事）。两条路：让 Core 的 run 携带一个不透明
的属性 id，或者让 Core 只管样式、由 Shell 的文档模型持有 href 与范围。后者更干净，但
Shell 必须自己按 `EditTransaction` 变换这些范围，于是范围变换逻辑在 Core 和 Shell 各有
一份——两份不一致就是链接在编辑时错位。**A2 定案**，与 §4.2 同理，不在本文拍板。

### 4.2 Block：文档级会话，块是它的投影

两个方案：

**方案 1 —— 每块一个 EditSession + 文档级协调器。** 复用现有会话，跨块操作由协调器
拆成多个会话事务。优点是增量小；缺点是跨块 undo 必须由协调器合成一个原子步骤，而
undo 栈在会话里，这条很容易出现「撤销撤了一半」。

**方案 2 —— 文档级会话，块是投影。** 会话持有块序列与统一的 revision/undo 栈，caret
用 `(block_index, utf16_offset)` 表达。增量大，但跨块原子性是构造性的。

**倾向方案 2**，理由是方案 1 的失败模式（部分撤销、块间 revision 漂移）正是编辑器最
不能出的错。但这条**必须由 A 档的实现经验来确认**，不在本文定案。

## 5. 为什么不能只在 Shell 做

`AGENTS.md` 的不变量：「Editable text is a Core subsystem. Business code must not
create or position per-widget HTML inputs」，以及「The engine does own caret,
selection, IME composition, clipboard, undo/redo」。

caret 几何来自 `TextLayout` 的 caret stop 表，IME composition 是 Core 会话状态，
undo 栈在 Core。把 mark 或块结构放在 Shell，等于让两边各持一份文档并要求它们不漂移——
而 Shell/Core 的分工原则恰恰是「Shell 拥有持久数据，Core 拥有活动编辑会话」。

## 6. 出口门禁

`m10-capability-decisions.md` 的重新评审条件要求六项齐备。本文对每项给出口径：

| 要求             | 口径                                                                           |
| ---------------- | ------------------------------------------------------------------------------ |
| 真实业务 fixture | 一份真实文档录制（不少于 5,000 块、混合 mark 密度），驱动全部性能与差分门禁    |
| 性能与包体上限   | 帧时按 `design.md` §2.1 现有预算；WASM 增量必须在 M9 的 384 KiB 余量内单独归因 |
| API/ABI diff     | ABI 版本递增 + golden 字节 + 跨语言 round trip + 畸形输入 + fuzz               |
| oracle           | 单 run 场景与现状**逐字节相同**；多 run 与「拆成多节点」的朴素实现像素差分     |
| 平台资格         | 真实 IME 在 mark 边界与块边界的 composition 录制；属平台资格，不阻塞工程出口   |
| kill switch      | `richTextEnabled` 优化级开关，关闭后回到单 run 单会话，文档降级为纯文本        |

**最重要的一条是 oracle 的第一句**：单 run 必须逐字节等于今天的输出。这让整个 A 档的
第一刀成为纯增量，任何回归都会被现有 M3/M4 门禁抓到。

## 7. 切片顺序

每一刀都要能独立合入并留下可断言的出口：

0. **U undo 分组**：`pingo-edit` 的历史栈支持输入突发与自动格式化合并成一步。
   不依赖 A/B，可以先做；它同时修好今天 `Input`/`TextArea` 一次按键一步撤销的缺陷。
   出口：合并规则的属性测试；现有编辑门禁不变。
1. **A1 多 run 渲染（只读）**：Scene/ABI/text/paint 支持多 styled run，编辑仍是单 run。
   出口：单 run 逐字节不变；多 run 与多节点朴素实现像素一致。
2. **A2 mark 编辑**：会话携带 mark，插入/删除变换边界，切换分裂/合并。
   出口：mark 边界的属性测试；IME composition 跨 mark 边界的录制回放。
3. **B1 块分裂与合并**：回车/退格的结构编辑与 Scene 节点增删原子对齐。
4. **B2 跨块选区**：选区、删除、复制粘贴跨块正确。
5. **B3 块虚拟化**：未物化块参与选区与 caret。

`@dopejs/pingo-editor` 作为 Shell 侧包，最早在 A2 之后才有意义；在此之前它没有可以
封装的东西。但**A2 之后它就是一个能用的产品**：行内输入规则、选中文字后的浮动工具栏、
快捷键，全部只需要 A 档。块级能力是第二个产品阶段，不是第一个可交付物的前提。

## 8. 风险

| 风险                        | 判据                                       | 处置                           |
| --------------------------- | ------------------------------------------ | ------------------------------ |
| 分段 shaping 破坏连字与整形 | 与单 run 输出的差分在同字体同字号下不一致  | run 边界不切断 shaping cluster |
| 多 run 让文本缓存命中率崩塌 | 缓存命中率门禁下降                         | 按 run 而不是按节点缓存        |
| 跨块 undo 撤销一半          | 属性测试：任意跨块操作的 undo 回到前一状态 | 采用 §4.2 方案 2               |
| WASM 体积吃掉 M9 余量       | 归因超出 384 KiB 门禁                      | 富文本作为可选模块，或暂停扩张 |
| 虚拟化与选区不一致          | 未物化块的 caret 与物化后不同              | B3 之前不宣称长文档支持        |

## 9. 本文不做的事

不实现任何一档；不定案 §4.1 的 mark 属性归属与 §4.2 的会话模型（两者都留给 A2）；不
设计 `@dopejs/pingo-editor` 的 API；不为 C 档预留接口。本文固定问题边界、给出现状取证、列出必须新增的 Core 能力与出口门禁口径，
并把 A/B 两档从 scope 排除项转为**待批准的候选范围**——批准以 §6 六项齐备为条件。
