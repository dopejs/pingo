import { createElement, type PingoNode } from "@dopejs/pingo";
import { AspectRatio } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 240,
  render: (context): PingoNode =>
    stage(context, [
      createElement("container", {
        width: 320,
        children: createElement(AspectRatio, {
          ratio: 16 / 9,
          children: createElement("container", {
            backgroundColor: "#3b82f6ff",
            style: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center" },
            children: createElement("text", {
              value: "16 : 9",
              color: "#ffffffff",
              fontSize: 18,
            }),
          }),
        }),
      }),
    ]),
};

export default demo;
