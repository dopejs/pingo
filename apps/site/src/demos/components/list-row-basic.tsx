import { createElement, type PingoNode } from "@dopejs/pingo";
import { Avatar, Badge, ListRow } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { column, stage } from "../../preview/layout";

const demo: PreviewDemo = {
  height: 200,
  render: (context): PingoNode =>
    stage(context, [
      createElement("container", {
        width: Math.min(context.width - 48, 480),
        children: [
          column(
            [
              createElement(ListRow, {
                title: "张三",
                description: "zhangsan@example.com",
                leading: createElement(Avatar, { fallback: "张", size: 32 }),
                trailing: createElement(Badge, { children: "管理员" }),
                onPress: () => {},
              }),
              createElement(ListRow, {
                title: "李四",
                description: "lisi@example.com",
                leading: createElement(Avatar, { fallback: "李", size: 32 }),
                trailing: createElement(Badge, { children: "只读", variant: "secondary" }),
                onPress: () => {},
              }),
            ],
            4,
          ),
        ],
      }),
    ]),
};

export default demo;
