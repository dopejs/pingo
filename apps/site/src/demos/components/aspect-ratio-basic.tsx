/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { AspectRatio } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 240,
  render: (context): PingoNode =>
    stage(context, [
      <container
        width={320}
        // A flex container with no style prop is on the direct-prop path,
        // where align-items is flex-start; the CSS initial `stretch` is what
        // makes the component inside fill this width.
        style={{ flexDirection: "column" }}
      >
        <AspectRatio ratio={16 / 9}>
          <container
            backgroundColor="#3b82f6ff"
            style={{
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <text value="16 : 9" color="#ffffffff" fontSize={18} />
          </container>
        </AspectRatio>
      </container>,
    ]),
};

export default demo;
