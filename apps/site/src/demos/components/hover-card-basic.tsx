/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Button, HoverCard } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { anchorStage, column } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 260,
  render: (context): PingoNode =>
    anchorStage(context, [
      <HoverCard
        onOpenChange={() => {}}
        content={column(
          [<text value="pingo" />, <text value="Canvas 渲染引擎与 UI 组件库。" />],
          8,
        )}
      >
        <Button variant="ghost" onPress={() => {}}>
          @pingo
        </Button>
      </HoverCard>,
    ]),
};

export default demo;
