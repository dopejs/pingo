/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { MenubarMenu, NavigationMenu } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 220,
  render: (context): PingoNode =>
    stage(context, [
      <NavigationMenu value="docs" onValueChange={() => {}}>
        <MenubarMenu value="products" label="产品">
          {column([<text value="渲染引擎" />, <text value="组件库" />], 8)}
        </MenubarMenu>
        <MenubarMenu value="docs" label="文档">
          {column([<text value="快速开始" />, <text value="API 参考" />], 8)}
        </MenubarMenu>
        <MenubarMenu value="community" label="社区">
          <text value="讨论区" />
        </MenubarMenu>
      </NavigationMenu>,
    ]),
};

export default demo;
