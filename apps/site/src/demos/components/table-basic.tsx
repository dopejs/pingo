import { createElement, type PingoNode } from "@dopejs/pingo";
import { Table } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

type FileRow = {
  readonly name: string;
  readonly kind: string;
  readonly size: string;
};

const KINDS = ["文档", "图片", "音频", "视频", "压缩包"] as const;

// Table is a pure builder rather than a memo component, so it is invoked
// inside this function component: the useTheme() read then happens in a
// render scope, and the preview follows the site's light/dark switch.
function TableScene(_props: Record<string, never>): PingoNode {
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
    rowCount: 10000,
    getRow: (index) => ({
      name: `文件 ${String(index + 1)}`,
      kind: KINDS[index % KINDS.length]!,
      size: `${String((index % 900) + 100)} KB`,
    }),
    onRowPress: () => {},
  });
}

const demo: PreviewDemo = {
  height: 320,
  render: (context): PingoNode =>
    stage(context, [
      createElement("container", {
        width: Math.min(context.width - 48, 560),
        height: 260,
        children: createElement(TableScene, {}),
      }),
    ]),
};

export default demo;
