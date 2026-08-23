import { createElement, type PingoNode } from "@dopejs/pingo";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { frame, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 300,
  render: (context): PingoNode =>
    stage(context, [
      // The trigger takes its width from its container, so the preview gives it
      // a definite one instead of leaving it to fill the whole stage.
      frame(280, [
        createElement(Select, {
          defaultOpen: true,
          value: "pingo-ui",
          onValueChange: () => {},
          children: [
            createElement(SelectTrigger, { placeholder: "选择一个包" }),
            createElement(SelectContent, {
              children: [
                createElement(SelectItem, { value: "pingo", children: "@dopejs/pingo" }),
                createElement(SelectItem, { value: "pingo-ui", children: "@dopejs/pingo-ui" }),
                createElement(SelectItem, {
                  value: "pingo-editing",
                  children: "@dopejs/pingo-editing",
                }),
                createElement(SelectItem, {
                  value: "pingo-style",
                  children: "@dopejs/pingo-style",
                }),
              ],
            }),
          ],
        }),
      ]),
    ]),
};

export default demo;
