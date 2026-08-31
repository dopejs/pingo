/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import {
  Button,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, row, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 320,
  render: (context): PingoNode =>
    stage(context, [
      <Dialog open onOpenChange={() => {}}>
        {column(
          [
            <DialogHeader>
              {column([
                <DialogTitle>编辑资料</DialogTitle>,
                <DialogDescription>修改会立即同步到你的公开资料。</DialogDescription>,
              ])}
            </DialogHeader>,
            <text value="对话框内容放在这里。" />,
            <DialogFooter>
              {row([
                <Button variant="outline" onPress={() => {}}>
                  取消
                </Button>,
                <Button onPress={() => {}}>保存</Button>,
              ])}
            </DialogFooter>,
          ],
          12,
        )}
      </Dialog>,
    ]),
};

export default demo;
