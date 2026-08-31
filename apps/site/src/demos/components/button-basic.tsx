/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Button } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { row, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 160,
  render: (context): PingoNode =>
    stage(context, [
      row(
        [
          <Button onPress={() => {}}>Default</Button>,
          <Button variant="secondary" onPress={() => {}}>
            Secondary
          </Button>,
          <Button variant="outline" onPress={() => {}}>
            Outline
          </Button>,
          <Button variant="ghost" onPress={() => {}}>
            Ghost
          </Button>,
          <Button variant="destructive" onPress={() => {}}>
            Destructive
          </Button>,
        ],
        12,
      ),
    ]),
};

export default demo;
