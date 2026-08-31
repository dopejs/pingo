/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { anchorStage, column } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 260,
  render: (context): PingoNode =>
    anchorStage(context, [
      <Popover>
        <PopoverTrigger>
          <Button variant="outline" onPress={() => {}}>
            尺寸
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          {column(
            [
              <text value="画布尺寸" />,
              <text value="宽度 1280 · 高度 720" />,
              <text value="点击触发器可收起面板。" />,
            ],
            8,
          )}
        </PopoverContent>
      </Popover>,
    ]),
};

export default demo;
