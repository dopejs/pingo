/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Button, Tooltip } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 160,
  render: (context): PingoNode =>
    stage(context, [
      <Tooltip content="这是一段说明文字。">
        <Button variant="ghost" onPress={() => {}}>
          悬停我
        </Button>
      </Tooltip>,
    ]),
};

export default demo;
