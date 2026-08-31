/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Button, DialogDescription, DialogHeader, DialogTitle, Drawer } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 340,
  render: (context): PingoNode =>
    stage(context, [
      <Drawer open onOpenChange={() => {}}>
        {column(
          [
            <DialogHeader>
              {column([
                <DialogTitle>移动到哪里？</DialogTitle>,
                <DialogDescription>选择一个目标文件夹。</DialogDescription>,
              ])}
            </DialogHeader>,
            <Button onPress={() => {}}>完成</Button>,
          ],
          12,
        )}
      </Drawer>,
    ]),
};

export default demo;
