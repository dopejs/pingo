/** @jsxImportSource @dopejs/pingo */
import type { PingoNode } from "@dopejs/pingo";
import { Avatar, Badge, ListRow } from "@dopejs/pingo-ui";

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
              title="张三"
              description="zhangsan@example.com"
              leading={<Avatar fallback="张" size={32} />}
              trailing={<Badge>管理员</Badge>}
              onPress={() => {}}
            />,
            <ListRow
              title="李四"
              description="lisi@example.com"
              leading={<Avatar fallback="李" size={32} />}
              trailing={<Badge variant="secondary">只读</Badge>}
              onPress={() => {}}
            />,
          ],
          4,
        )}
      </container>,
    ]),
};

export default demo;
