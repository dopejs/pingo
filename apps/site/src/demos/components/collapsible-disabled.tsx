/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Collapsible, Label } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 120,
  render: (context): PingoNode =>
    stage(context, [
      <container
        width={320}
        // A flex container with no style prop is on the direct-prop path,
        // where align-items is flex-start; the CSS initial `stretch` is what
        // makes the component inside fill this width.
        style={{ flexDirection: "column" }}
      >
        <Collapsible trigger="已禁用的部分" disabled>
          <Label>升级后可用。</Label>
        </Collapsible>
      </container>,
    ]),
};

export default demo;
