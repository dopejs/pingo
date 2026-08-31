/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { ToggleGroup, ToggleGroupItem } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 120,
  render: (context): PingoNode =>
    stage(context, [
      <ToggleGroup type="single" defaultValue={["center"]}>
        <ToggleGroupItem value="left">左对齐</ToggleGroupItem>
        <ToggleGroupItem value="center">居中</ToggleGroupItem>
        <ToggleGroupItem value="right">右对齐</ToggleGroupItem>
      </ToggleGroup>,
    ]),
};

export default demo;
