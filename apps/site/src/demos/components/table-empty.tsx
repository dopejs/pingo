import { createElement, type PingoNode } from "@dopejs/pingo";
import { Table } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

type FileRow = {
  readonly name: string;
  readonly kind: string;
  readonly size: string;
};

// See table-basic for why Table is invoked inside a function component.
function EmptyTableScene(_props: Record<string, never>): PingoNode {
  return Table<FileRow>({
    columns: [
      {
        key: "name",
        header: "名称",
        cell: (row) => createElement("text", { value: row.name }),
      },
      {
        key: "kind",
        header: "类型",
        width: 88,
        cell: (row) => createElement("text", { value: row.kind }),
      },
      {
        key: "size",
        header: "大小",
        width: 96,
        align: "end",
        cell: (row) => createElement("text", { value: row.size }),
      },
    ],
    rowCount: 0,
    getRow: (index) => ({ name: `文件 ${String(index + 1)}`, kind: "文档", size: "0 KB" }),
    emptyLabel: "没有匹配的文件",
  });
}

const demo: PreviewDemo = {
  height: 180,
  render: (context): PingoNode =>
    stage(context, [
      createElement("container", {
        width: Math.min(context.width - 48, 560),
        // A styled column, so the table fills the width this box was given;
        // see `table-basic`.
        style: { flexDirection: "column" },
        children: createElement(EmptyTableScene, {}),
      }),
    ]),
};

export default demo;
