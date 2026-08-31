/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Menubar, MenubarMenu } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 120,
  render: (context): PingoNode =>
    stage(context, [
      <Menubar>
        <MenubarMenu value="file" label="文件">
          <text value="新建" />
        </MenubarMenu>
        <MenubarMenu value="edit" label="编辑">
          <text value="撤销" />
        </MenubarMenu>
        <MenubarMenu value="view" label="视图">
          <text value="缩放" />
        </MenubarMenu>
      </Menubar>,
    ]),
};

export default demo;
