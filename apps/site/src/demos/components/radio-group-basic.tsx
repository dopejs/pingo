/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { RadioGroup, RadioGroupItem } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 180,
  render: (context): PingoNode =>
    stage(context, [
      <RadioGroup defaultValue="b">
        {column(
          [
            <RadioGroupItem value="a" label="选项 A" />,
            <RadioGroupItem value="b" label="选项 B" />,
            <RadioGroupItem value="c" label="选项 C" />,
          ],
          10,
        )}
      </RadioGroup>,
    ]),
};

export default demo;
