import { createElement, type PingoNode } from "@dopejs/pingo";
import { Button, DialogDescription, DialogHeader, DialogTitle, Sheet } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 340,
  render: (context): PingoNode =>
    stage(context, [
      createElement(Sheet, {
        open: true,
        side: "right",
        onOpenChange: () => {},
        children: column(
          [
            createElement(DialogHeader, {
              children: column([
                createElement(DialogTitle, { children: "筛选" }),
                createElement(DialogDescription, {
                  children: "按条件缩小结果范围。",
                }),
              ]),
            }),
            createElement(Button, { children: "应用", onPress: () => {} }),
          ],
          12,
        ),
      }),
    ]),
};

export default demo;
