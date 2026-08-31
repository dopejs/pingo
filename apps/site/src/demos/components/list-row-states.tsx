/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Avatar, ListRow } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 200,
  render: (context): PingoNode =>
    stage(context, [
      <container
        width={Math.min(context.width - 48, 480)}
        // A flex container with no style prop is on the direct-prop path,
        // where align-items is flex-start; the CSS initial `stretch` is what
        // makes the component inside fill this width.
        style={{ flexDirection: "column" }}
      >
        {column(
          [
            <ListRow
              title="王五"
              description="当前选中"
              leading={<Avatar fallback="王" size={32} />}
              trailing={<text value="›" />}
              selected
              onPress={() => {}}
            />,
            <ListRow
              title="赵六"
              description="已停用"
              leading={<Avatar fallback="赵" size={32} />}
              disabled
            />,
          ],
          4,
        )}
      </container>,
    ]),
};

export default demo;
