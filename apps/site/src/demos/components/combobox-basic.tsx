import { createElement, type PingoNode } from "@dopejs/pingo";
import { Combobox } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 320,
  render: (context): PingoNode =>
    stage(context, [
      createElement(Combobox, {
        items: [
          { value: "next", label: "Next.js" },
          { value: "remix", label: "Remix" },
          { value: "astro", label: "Astro" },
          { value: "nuxt", label: "Nuxt" },
        ],
        defaultValue: "astro",
        defaultOpen: true,
        placeholder: "选择框架",
        onValueChange: () => {},
      }),
    ]),
};

export default demo;
