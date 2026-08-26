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

### 待验证

3. **输入走独立 `MessagePort`**：让输入流量不与 clock-anchor、报告回传争用同一队列。
4. **换时钟驱动方式**：worker rAF 不可用，但 `MessageChannel` 自唤醒的宏任务循环
   与 `setTimeout` 的调度优先级不同，值得对比。
5. **减少回传**：`onFrame` 每帧回传一条报告。未订阅时是否仍然回传，需要确认。

三条都不改 ABI，也不改降级链语义，属于 transport 实现内部。

**注意**：1+2 被证伪，说明「载荷传输让事件循环变忙」这个归因**至少是不完整的**。
§3 里由 `maximumTimerLatenessMs` 翻倍推出的因果仍然成立于现象层面，但成因不是复制
与 transfer 本身。下一步应先确认剩余三条里哪一条能改变 `maximumTimerLatenessMs`，
再谈实现。

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
