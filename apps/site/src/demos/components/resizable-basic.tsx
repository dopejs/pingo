/** @jsxImportSource @dopejs/pingo */
import type { Color, PingoNode } from "@dopejs/pingo";
import { Resizable } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

function pane(label: string, color: Color): PingoNode {
  return (
    <container
      backgroundColor={color}
      style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}
    >
      <text value={label} color="#ffffffff" fontSize={13} />
    </container>
  );
}

const demo: PreviewDemo = {
  height: 240,
  render: (context): PingoNode =>
    stage(context, [
      <container width={420} height={150}>
        <Resizable
          defaultSplit={0.4}
          first={pane("左侧栏", "#3b82f6ff")}
          second={pane("主内容", "#6366f1ff")}
        />
      </container>,
    ]),
};

export default demo;
