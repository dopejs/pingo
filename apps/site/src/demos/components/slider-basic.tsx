import { createElement, type PingoNode } from "@dopejs/pingo";
import { Slider } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 150,
  render: (context): PingoNode =>
    stage(context, [
      column(
        [
          createElement(Slider, { defaultValue: 40, semanticLabel: "音量" }),
          createElement(Slider, {
            value: 70,
            semanticLabel: "亮度",
            disabled: true,
            onValueChange: () => {},
          }),
        ],
        16,
      ),
    ]),
};

export default demo;
