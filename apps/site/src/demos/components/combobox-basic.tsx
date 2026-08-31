/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Combobox } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { anchorStage, frame } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 320,
  render: (context): PingoNode =>
    anchorStage(context, [
      // The trigger takes its width from its container, so the preview gives it
      // a definite one instead of leaving it to fill the whole stage.
      frame(280, [
        <Combobox
          items={[
            { value: "next", label: "Next.js" },
            { value: "remix", label: "Remix" },
            { value: "astro", label: "Astro" },
            { value: "nuxt", label: "Nuxt" },
          ]}
          defaultValue="astro"
          placeholder="选择框架"
          onValueChange={() => {}}
        />,
      ]),
    ]),
};

export default demo;
