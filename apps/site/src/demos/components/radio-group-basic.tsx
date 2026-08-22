import { createElement, type PingoNode } from "@dopejs/pingo";
import { RadioGroup, RadioGroupItem } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 180,
  render: (context): PingoNode =>
    stage(context, [
      createElement(RadioGroup, {
        defaultValue: "b",
        children: column(
          [
            createElement(RadioGroupItem, { value: "a", label: "选项 A" }),
            createElement(RadioGroupItem, { value: "b", label: "选项 B" }),
            createElement(RadioGroupItem, { value: "c", label: "选项 C" }),
          ],
          10,
        ),
      }),
    ]),
};

export default demo;
