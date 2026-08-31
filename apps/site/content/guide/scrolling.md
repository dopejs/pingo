# 滚动与虚拟化

## 滚动来自 overflow

任何 View 只要在某个轴上把 `overflow-x` / `overflow-y` 声明为 `auto`、`scroll` 或
`hidden`，它就是那个轴上的滚动容器。不需要换成别的元素：

```ts
View({
  style: { height: 480, overflowY: "auto" },
  children: rows,
});
```

手势、滚轮、滚动链与滚动条都由这一条声明推导：命中路径向上找最近的滚动祖先，滚动条由
Core 用它已经持有的滚动状态绘制，所以滚动帧不进入 Shell。`hidden` 与 CSS 一致——不给
用户滚动条，程序化滚动仍然有效。

**滚动不等于虚拟化。** overflow 只让盒子滚动，它不会去猜你要不要把数据窗口化；下面的
`virtual` 是一份显式契约，绝不从 overflow 或已经物化的子节点推断出来。

## 为什么虚拟化放在引擎里

DOM 虚拟列表的长尾问题来自：滚动事件要回到主线程 → 触发 setState → diff → 重排。
主线程一忙，帧就掉。

pingo 把窗口计算放进 Core：滚动稳态**完全不调用 Shell**。Shell 只负责按 Core 规划的
预热窗口物化可见区间；数据没准备好时先画占位，后续帧补建。

## 给 View 一份数据窗口

虚拟化是 View 上的一个属性，不是另一种组件——同一个滚动的盒子既可以装普通子节点，也
可以装一百万行：

```ts
View({
  style: { width: 480, height: 640, overflowY: "auto" },
  virtual: {
    axis: "y",
    itemCount: 1_000_000,
    estimatedItemSize: 32,
    getItemKey: (index: number) => `order-${index}`,
    renderItem: (index: number) =>
      View({
        style: { height: 32 },
        children: Text({ value: `第 ${index} 行` }),
      }),
  },
});
```

`estimatedItemSize` 只是初始估计。真实尺寸测量出来后，Core 通过前缀和树（Fenwick）
纠正锚点位置，滚动条不会跳。

`axis` 是单轴的：一个窗口负责 `x` 或 `y`，不同时负责两个。

`VirtualList` 组件仍然可用，它是纵向列表的简写，落到同一套 Core 契约上；需要横向、需要
`getItemKey`，或者想让同一个盒子既滚动普通内容又开窗口时，用 View 上的 `virtual`。

## 可调项

| `virtual` 字段           | 作用                                   |
| ------------------------ | -------------------------------------- |
| `axis`                   | 窗口所在的单轴，`x` 或 `y`（默认 `y`） |
| `itemCount`              | 逻辑项总数                             |
| `estimatedItemSize`      | 初始尺寸估计，测量后由 Core 纠正       |
| `getItemKey`             | 稳定的项标识，用于跨窗口复用           |
| `renderItem`             | 物化单项，只对预热窗口内的下标调用     |
| `baseOverscanViewports`  | 对称预热范围（视口倍数）               |
| `velocityHorizonSeconds` | 速度投影时长，用于方向预测             |
| `maximumAheadViewports`  | 单方向预热上限                         |

方向预测会在快速 fling 时优先预热运动方向，而不是对称浪费两侧预算。

## 程序化滚动

`scrollX` / `scrollY` 是 View 自己的属性，与是否虚拟化无关，值变化时才发出一次
`ScrollTo`：

```ts
View({ style: { height: 480, overflowY: "auto" }, scrollY: 500_000 * 32, children: rows });
```

或用 root 上的直接操纵 API（用于自定义手势）：

```ts
root.beginScroll(handle);
root.scrollBy(handle, 0, deltaY, elapsedMs);
root.endScroll(handle); // 交给 Core 估算 fling 速度
```

`handle` 来自元素的 `ref` 回调（`NodeHandle`）。

## 滚轮与触控板

滚轮的**位移**与浏览器原生一致，但传递曲线按输入源分流：高精度 delta（触控板）即时 1:1 应用，
惯性仍由操作系统的事件流提供；离散滚轮格则累加到动画目标并按指数缓出逼近，像浏览器那样硬夹到
内容边界，不产生 overscroll。

## 嵌套与编辑

滚轮滚动最近的滚动祖先——也就是最近一个声明了 overflow 的 View。指针拖动落在可编辑
文本上时，文本选择优先于滚动拖拽；这个优先级由命中路径深度决定，不需要业务干预。

## 性能口径

固定 fixture（百万行、20,000 帧）的自动 benchmark 是合并门禁的一部分。
当前 P95/P99 为亚微秒级重放，30 分钟连续滚动无不可控内存增长。

真机 P95/P99 与输入延迟属于平台资格采集，不作为工程出口条件——这条界线是刻意的，
避免用无法复现的设备数据阻塞工程进度，也避免用工程数据冒充设备承诺。

在 [Playground 的滚动演示](/playground#/scroll)里可以看到实时帧指标。
