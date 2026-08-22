import { createElement, type PingoNode } from "@dopejs/pingo";
import { Button, Toast, ToastViewport } from "@dopejs/pingo-ui";

import type { PreviewDemo, PreviewDemoContext } from "../../preview/contract";
import { stage } from "../../preview/layout";

// The toast's open state lives in module scope; the Button toggles it and the
// root re-renders the scene. ToastViewport is absolutely positioned against
// the stage, so the toast lands in the top-right corner of the preview.
let open = false;
let lastContext: PreviewDemoContext | undefined;
let rerender: (() => void) | undefined;

function scene(context: PreviewDemoContext): PingoNode {
  return stage(context, [
    createElement(Button, {
      children: open ? "隐藏通知" : "显示通知",
      variant: "outline",
      onPress: () => {
        open = !open;
        rerender?.();
      },
    }),
    createElement(ToastViewport, {
      children: createElement(Toast, {
        open,
        title: "已保存",
        description: "配置已写入本地。",
      }),
    }),
  ]);
}

const demo: PreviewDemo = {
  height: 200,
  render: (context): PingoNode => {
    lastContext = context;
    return scene(context);
  },
  activate: (root) => {
    rerender = () => {
      if (lastContext !== undefined) root.render(scene(lastContext));
    };
    return () => {
      rerender = undefined;
      open = false;
    };
  },
};

export default demo;
