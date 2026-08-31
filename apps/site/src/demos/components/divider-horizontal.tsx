/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Divider, Label } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 140,
  render: (context): PingoNode =>
    stage(context, [
      <container width={320} style={{ flexDirection: "column" }}>
        <Label>上方内容</Label>
        <container height={16} />
        <Divider />
        <container height={16} />
        <Label>下方内容</Label>
      </container>,
    ]),
};

export default demo;
