/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { anchorStage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 220,
  render: (context): PingoNode =>
    anchorStage(context, [
      <Popover>
        <PopoverTrigger>
          <Button variant="outline" onPress={() => {}}>
            打开浮层
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <text value="锚定在触发器下方。" />
        </PopoverContent>
      </Popover>,
    ]),
};

export default demo;
