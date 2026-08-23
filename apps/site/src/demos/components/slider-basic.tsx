import { createElement, type PingoNode } from "@dopejs/pingo";
import { Slider } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, frame, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 150,
  render: (context): PingoNode =>
    stage(context, [
      // A slider takes its width from its container; without a definite one it
      // has nothing to be a fraction of.
      frame(320, [
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
    ]),
};

export default demo;
