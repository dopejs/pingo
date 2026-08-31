# 无障碍与可测试性

## 从第一天进架构

canvas 内容天然对屏幕阅读器不可见。pingo 不把无障碍当作发布后再补的覆盖层：
Core 维护语义树（role / label / value / bounds / focusable），
`@dopejs/pingo-a11y` 把它增量映射为 canvas 旁的绝对定位 DOM 影子树。

影子元素视觉透明但存在于无障碍树与 tab 顺序中；聚焦它会转发到引擎的编辑会话，
所以键盘用户能真正操作 canvas 内的输入框。

## 声明语义

```tsx
<container semanticRole="region" semanticLabel="结算面板">
  <text value="结算" semanticRole="heading" semanticLabel="结算" />
  {TextField({ semanticLabel: "收件人", value, revision })}
</container>
```

`editableText` 默认具备 textbox 语义。密码框的值**永远不进入**语义树。

## 用语义做 E2E

因为语义树被镜像成真实 DOM，E2E 可以按角色和名称选中元素，而不是比对像素：

```ts
import { getByRole, queryAllByRole } from "@dopejs/pingo";

const email = getByRole(document.body, "textbox", { name: "收件人" });
email.focus(); // 转发到引擎编辑会话
expect(queryAllByRole(document.body, "textbox")).toHaveLength(2);
```

像素快照仍然保留，但作为渲染正确性的**补充证据**，不是唯一断言。
这条选择让 UI 测试在字体渲染或抗锯齿变化时不会成片失败。

## 断言画出来的文本

语义树回答「这个节点是什么」，它不回答「这一帧真的把这段字画出去了」。两者之间隔着
可见性、绘制顺序、虚拟化与子树缓存，而主绘制路径的指令里根本不带字符串。
`onPaintedText` 补上后一半：

```ts
let painted: PaintedTextSnapshot | undefined;
const root = await createHostedCanvasRoot(canvas, {
  onPaintedText: (snapshot) => (painted = snapshot),
});

// 语义树说按钮在，探针说它这一帧被画了出来。
getByRole(document.body, "button", { name: "保存" });
expect(painted?.records.some((record) => record.text === "保存")).toBe(true);
```

快照每帧送达一次，`root.paintedText()` 读最近一帧。每条记录给出 `nodeId`、`text`、
设备坐标 `origin`、绘制通道 `channel` 与 `originClipped`。不传 `onPaintedText` 时引擎
完全不计算它，帧成本与没有这项能力时一致。

两条边界要记住：它报告的是 **Core 发出的**，不是回放后仍然可见的——视口裁剪发生在
后端；密码框报告的是掩码 `•`，因为那就是被画出去的内容。

## 观测语义树

```ts
const root = await createHostedCanvasRoot(canvas, {
  onSemantics: (nodes) => inspect(nodes),
  accessibility: true, // 默认开启；设为 false 可关闭影子树
});
```

每个节点给出 `nodeId`、`role`、`label`、`value`、世界 `bounds`、`focusable`、`focused`、
`password` 标志。帧诊断里的 `dirtySemanticsNodes` 可以观察语义失效频率。

## 平台资格

自动化覆盖的是语义树导出、影子树映射、role/label 选择器与键盘契约。
**真实屏幕阅读器（VoiceOver、NVDA、TalkBack）的行为矩阵属于平台资格采集**，
单独跟踪，不计入工程出口——这条界线避免用未验证的设备结论冒充支持承诺。

在 [Playground 的语义演示](/playground#/semantics)里可以直接读取当前语义树。
