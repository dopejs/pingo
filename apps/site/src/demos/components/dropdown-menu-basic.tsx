/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { anchorStage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 260,
  render: (context): PingoNode =>
    anchorStage(context, [
      <DropdownMenu onValueChange={() => {}}>
        <DropdownMenuTrigger>
          <Button variant="outline" onPress={() => {}}>
            打开菜单
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem value="profile">个人资料</DropdownMenuItem>
          <DropdownMenuItem value="billing">账单</DropdownMenuItem>
          <DropdownMenuItem value="settings">设置</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    ]),
};

export default demo;
