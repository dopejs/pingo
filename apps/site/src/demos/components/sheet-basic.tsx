/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Button, DialogDescription, DialogHeader, DialogTitle, Sheet } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 340,
  render: (context): PingoNode =>
    stage(context, [
      <Sheet open side="right" onOpenChange={() => {}}>
        {column(
          [
            <DialogHeader>
              {column([
                <DialogTitle>筛选</DialogTitle>,
                <DialogDescription>按条件缩小结果范围。</DialogDescription>,
              ])}
            </DialogHeader>,
            <Button onPress={() => {}}>应用</Button>,
          ],
          12,
        )}
      </Sheet>,
    ]),
};

export default demo;
