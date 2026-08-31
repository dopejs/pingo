/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Divider, Label } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 120,
  render: (context): PingoNode =>
    stage(context, [
      <container height={48} style={{ flexDirection: "row", alignItems: "center" }}>
        <Label>首页</Label>
        <container width={16} />
        <Divider orientation="vertical" />
        <container width={16} />
        <Label>文档</Label>
        <container width={16} />
        <Divider orientation="vertical" />
        <container width={16} />
        <Label>设置</Label>
      </container>,
    ]),
};

export default demo;
