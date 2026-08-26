# E13 设计门：postMessage 路径的帧率天花板

- 状态：Proposed
- 日期：2026-08-26
- 关联：[`design.md`](design.md) §2.1 高刷目标、ADR-0001 transport 降级链
- 定位：**大多数使用方拿到的那条路，跑不满 60Hz。**

## 1. 为什么这条路是主路径而不是降级路径

SAB transport 需要 cross-origin isolation，而它需要 COOP/COEP 响应头。**不能要求
所有使用方都能设置响应头**——静态托管、第三方 iframe、无头部控制的 CDN 都设不了。
本仓库的文档站就是例子：GitHub Pages 无法设置自定义响应头，实测
`crossOriginIsolated: false`、`SharedArrayBuffer` 在 Chrome 里根本不存在。

对这些部署，postMessage 不是降级路径，**是唯一的路径**。它的天花板就是引擎的
天花板。

## 2. 实测

同一场景（200 行滚动容器），每个 animation frame 发一次 `scrollTo`：

| 输入频率 | postMessage |     SAB |
| -------- | ----------: | ------: |
| 每 1 帧  | 60 → **34** | 60 → 60 |
| 每 2 帧  |     30 → 29 | 30 → 30 |
| 每 3 帧  |     20 → 19 | 20 → 20 |

30Hz 以下一比一跟满，60Hz 只出一半。本机 rAF 实际约 92Hz，换算成绝对值：

| transport   |         出帧率 | 定时器最大迟到 | overruns | 回调最大 |
| ----------- | -------------: | -------------: | -------: | -------: |
| SAB         | 92.3Hz（跟满） |          7.5ms |        0 |    2.9ms |
| postMessage |     **52.3Hz** |     **14.0ms** |        0 |    3.8ms |

## 3. 归因

**不是消息条数。** 两档在同一窗口里向 worker 发的消息数完全相同：

```
post-message   120 = 60 pingo:clock-anchor + 60 pingo:input
sab            120 = 60 pingo:clock-anchor + 60 pingo:input-wake
```

差别在**载荷**：SAB 发的是一个唤醒信号（字节已在共享环里），postMessage 发的是
`.slice()` 复制后 transfer 的 `Uint8Array`。

**不是 Core 慢。** `overruns: 0`，回调最大 3.8ms，远在预算内。

剩下的解释是 worker 的**渲染时钟被推迟**：`lastRequestedDelayMs ≈ 9.6ms` 说明时钟由
定时器驱动（Chrome 的 `DedicatedWorkerGlobalScope` 没有 `requestAnimationFrame`），
而定时器正是最容易被繁忙事件循环延后的调度方式。载荷传输让 worker 事件循环变忙，
定时器迟到从 7.5ms 翻到 14ms，有效帧率随之减半。

## 4. 候选方向

### 已证伪

**1+2：去掉 `.slice()` 与 transfer。** 实测输入载荷是 **40 字节，且 view 跨满整个
buffer**，所以当前实现为了传 40 字节要付一次分配加一次 ArrayBuffer detach/reattach。
把这条路径改成小载荷直接结构化克隆（不复制、不 transfer），三次重跑：

|             |          改动前 |              改动后 |
| ----------- | --------------: | ------------------: |
| postMessage | 34, 34, 34 / 60 | **34, 34, 34 / 60** |

**没有任何变化。** 已确认改动进入构建产物后才下的结论。所以每帧的复制与 transfer
不是天花板的成因，这两条方向排除，改动已回滚——没有实测收益的优化不留在代码里。

**5：减少回传。** 已确认 worker **无条件**每帧回传 `pingo:frame`，与应用是否订阅
`onFrame` 无关（`render-worker.ts` 的 sink 回调直接 `post`）。把这个回调改成空操作
后重测定时器迟到：

|                  | 有回传 |   抑制回传 |
| ---------------- | -----: | ---------: |
| postMessage 迟到 | 14.0ms | **13.9ms** |
| SAB 迟到         |  7.5ms |      9.8ms |

**没有变化。** 回传流量不是天花板的成因，方向 5 排除。（诊断改动已回滚。回传本身
无条件发送这件事仍然值得单独处理，但那是浪费，不是这条天花板。）

### 待验证

3. **输入走独立 `MessagePort`**：让输入流量不与 clock-anchor 争用同一队列。
4. **换时钟驱动方式**：worker rAF 不可用，`MessageChannel` 自唤醒与 `setTimeout`
   的调度优先级不同。

### 已确认：成因是硬编码的 60Hz 渲染时钟

测量 worker 时钟的实际 tick 频率（用两次 `clock-metrics` 快照之间的墙钟时间，相隔
恰好 60 tick），在一台 120Hz 显示器上：

| transport   |     rAF | 时钟 tick |        出帧 |
| ----------- | ------: | --------: | ----------: |
| postMessage | 120.0Hz |    67.9Hz |  **67.6Hz** |
| SAB         | 120.3Hz |    67.7Hz | **120.3Hz** |

**两边时钟完全相同。** postMessage 的出帧严格等于时钟；SAB 的出帧**远超自己的时钟**。

原因在两条输入路径的处理方式不同：

- `render-worker.ts` 的 `pingo:input`：`pendingInput.push(...)`，**排队等时钟**
  （注释写明是有意的：一次突发只付一次画布重放）
- `pingo:input-wake` → `drainInputRing()`：`sink?.input(...)`，**立即应用并出帧**，
  绕过时钟

而 `HybridRenderClock` 的目标是 `targetFrameMs ?? 1000 / 60`——**硬编码 60Hz，
从不参考显示器刷新率**。

把目标临时改成 `1000 / 120` 重测：

| transport   | 改前出帧 |    改后出帧 |
| ----------- | -------: | ----------: |
| postMessage |   67.6Hz | **119.8Hz** |
| SAB         |  120.0Hz |     120.0Hz |

**postMessage 提升 1.77×，跟满 rAF。** 所以这条天花板不是 transport 的问题，是时钟
的问题；SAB 只是因为立即应用输入而意外绕开了它。

这直接打在 [`design.md`](design.md) §2.1 的 120Hz 目标上：**120Hz 屏幕上引擎时钟
仍然只跑 60Hz**，而对设不了 header 的部署（§1），渲染就封顶在那里。

### 修法与代价

正确的修法是让时钟跟随显示器刷新率，而不是写死任何一个数。worker 观察不到刷新率，
但主线程每个 rAF 都在发 `pingo:clock-anchor`，所以数据是现成的。两条路：

**A：激活时传入。** `WorkerActivateMessage` 已经带 `devicePixelRatio`（注释："worker
自己观察不到"），刷新率是完全相同的情形。主线程在 WASM 加载期间并行采样几个 rAF
间隔，激活时一并传入。**不改时钟调度数学，不做运行中变更。** 代价是 worker protocol
版本号递增。

**B：时钟自适应。** 时钟已经在收 anchor 时间戳，可以自己推算间隔。**不改协议**，但
要在运行中改 `targetFrameMs`，而相位锁定的修正夹紧值（`maximumCorrectionMs`）在
构造时是按 `targetFrameMs / 2` 校验的，运行中改会破坏这个不变量。按 AGENTS.md，
时钟变更需要确定性测试、并发模型检查、压力与 stall 注入。

倾向 **A**：收益相同，但不触碰 M5 花了大力气稳定下来的调度数学。

### 原先的解释（已废弃）

三条"成本"方向被证伪之后，剩下的差异不再是**开销**而是**时序**：

- SAB：主线程把字节 memcpy 进共享环，worker 在自己的 tick 时刻直接读，**看到的是
  写入的最新值**，与消息投递无关。
- postMessage：worker 只能看到 tick 开始前已经**投递到**的消息。主线程在 rAF 时刻
  发出的输入，如果在 tick 之后才被派发，这一帧就看不到它。

如果成因是这个，那修法不是让消息更便宜，而是让 tick 与输入到达**对齐**——属于
方向 4 的范畴，但目标从"更快的定时器"变成"不与输入错相"。

**这条已被上面的测量取代。** 它的方向是对的（差别在时序不在开销），但机制猜错了：
不是消息投递赶不上 tick，而是 tick 本身被钉在 60Hz，而 SAB 根本不等 tick。

## 5. 度量口径

以**出帧数 / 输入数**计量（跨设备恒定），辅以 `RenderClockMetrics` 的
`maximumTimerLatenessMs`、`overruns`、`maximumCallbackMs` 做归因——这三个字段正是
M5 那次时钟调查为区分「定时器晚到」与「回调太慢」而加的，这里正好复用。

门禁已经存在：`packages/facade/src/transport-throughput.browser.ts` 记录当前比例
作为地板。本项的目标就是把 postMessage 那条地板抬上去。

## 6. 失败模式

| 失败模式             | 判据                                   | 处置                     |
| -------------------- | -------------------------------------- | ------------------------ |
| 优化后输入丢失或乱序 | 三档 transport 的 Picture 生命周期差分 | 回滚，不放宽差分         |
| 提高吞吐但增大延迟   | 输入到呈现的帧数超过 2 帧              | 视为失败，延迟优先于吞吐 |
| 只在开发机成立       | CI 上比例未提升                        | 不计入成功               |

## 7. 本文不做的事

不实现任何方向；不改 ABI；不改降级链的选择逻辑。本文固定问题、给出归因证据、并
说明为什么这条路必须按主路径对待。
