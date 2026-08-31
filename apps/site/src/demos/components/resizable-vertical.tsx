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
  height: 280,
  render: (context): PingoNode =>
    stage(context, [
      <container width={320} height={200}>
        <Resizable
          direction="column"
          defaultSplit={0.35}
          first={pane("编辑器", "#3b82f6ff")}
          second={pane("终端", "#6366f1ff")}
        />
      </container>,
    ]),
};

export default demo;
