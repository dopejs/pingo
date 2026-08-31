/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Menubar, MenubarMenu } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 220,
  render: (context): PingoNode =>
    stage(context, [
      <Menubar value="file" onValueChange={() => {}}>
        <MenubarMenu value="file" label="文件">
          {column([<text value="新建" />, <text value="打开…" />, <text value="保存" />], 8)}
        </MenubarMenu>
        <MenubarMenu value="edit" label="编辑">
          <text value="撤销" />
        </MenubarMenu>
      </Menubar>,
    ]),
};

export default demo;
