import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { DataTable, type SortState } from "@dopejs/pingo-ui";

import type { PreviewDemo } from "../../preview/contract";
import { stage } from "../../preview/layout";

type Member = {
  readonly name: string;
  readonly role: string;
  readonly commits: number;
  readonly active: string;
};

const MEMBERS: readonly Member[] = [
  { name: "林晚", role: "设计", commits: 132, active: "2026-08-21" },
  { name: "沈舟", role: "前端", commits: 214, active: "2026-08-22" },
  { name: "顾北", role: "后端", commits: 98, active: "2026-08-18" },
  { name: "苏叶", role: "前端", commits: 176, active: "2026-08-20" },
  { name: "陆离", role: "测试", commits: 54, active: "2026-08-15" },
  { name: "何夕", role: "后端", commits: 187, active: "2026-08-22" },
];

const COMPARATORS: Record<string, (left: Member, right: Member) => number> = {
  name: (left, right) => left.name.localeCompare(right.name, "zh-Hans-CN"),
  commits: (left, right) => left.commits - right.commits,
  active: (left, right) => left.active.localeCompare(right.active),
};

// DataTable reports sort changes instead of reordering rows itself (it is
// virtualised, so the rows may not even exist locally). This component owns
// the sort state and feeds reordered rows back through getRow — and, being a
// function component, it also keeps the pure builder's useTheme() read inside
// a render scope so the preview follows the site's theme switch.
function SortableTable(_props: Record<string, never>): PingoNode {
  const sort = useSignal<SortState | undefined>({ key: "commits", direction: "descending" });
  const current = sort.get();
  let rows: readonly Member[] = MEMBERS;
  if (current !== undefined) {
    const compare = COMPARATORS[current.key];
    if (compare !== undefined) {
      const sign = current.direction === "ascending" ? 1 : -1;
      rows = [...MEMBERS].sort((left, right) => sign * compare(left, right));
    }
  }
  return DataTable<Member>({
    columns: [
      {
        key: "name",
        header: "成员",
        sortable: true,
        cell: (row) => createElement("text", { value: row.name }),
      },
      {
        key: "role",
        header: "角色",
        width: 72,
        cell: (row) => createElement("text", { value: row.role }),
      },
      {
        key: "commits",
        header: "提交",
        width: 80,
        align: "end",
        sortable: true,
        cell: (row) => createElement("text", { value: String(row.commits) }),
      },
      {
        key: "active",
        header: "最近活跃",
        width: 120,
        align: "end",
        sortable: true,
        cell: (row) => createElement("text", { value: row.active }),
      },
    ],
    // exactOptionalPropertyTypes: sort is only passed when it is defined.
    ...(current === undefined ? {} : { sort: current }),
    onSortChange: (next) => {
      sort.set(next);
    },
    rowCount: rows.length,
    getRow: (index) => rows[index]!,
  });
}

const demo: PreviewDemo = {
  height: 380,
  render: (context): PingoNode =>
    stage(context, [
      // A column, so the table fills the width this box was given; see
      // `table-basic`.
      createElement("container", {
        width: Math.min(context.width - 48, 560),
        height: 320,
        style: { flexDirection: "column" },
        children: createElement(SortableTable, {}),
      }),
    ]),
};

export default demo;
