import { createElement, memo, useSignal, type PingoNode } from "@dopejs/pingo";
import {
  Breadcrumb as BreadcrumbComponent,
  Calendar as CalendarComponent,
  DataTable as DataTableComponent,
  Pagination as PaginationComponent,
  Table as TableComponent,
  createPingoUiStyleSheet,
  setTheme,
  type CalendarDate,
  type DataTableColumn,
  type PingoUiTheme,
  type SortState,
  type TableColumn,
} from "@dopejs/pingo-ui";
import type { Meta, StoryObj } from "@storybook/html-vite";

import { frame, frameBox, stateful } from "./layout";
import { mountStory } from "./mount";

// Story export names must equal component names, so the components are
// imported under a `Component` suffix to avoid a name collision with their
// story exports.

const meta: Meta = { title: "Data" };
export default meta;

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

type FileRow = {
  readonly name: string;
  readonly kind: string;
  readonly size: string;
};

const FILES: readonly FileRow[] = [
  { name: "年度规划.docx", kind: "文档", size: "2.4 MB" },
  { name: "封面.jpg", kind: "图片", size: "1.1 MB" },
  { name: "会议录音.m4a", kind: "音频", size: "18.7 MB" },
  { name: "宣传片.mp4", kind: "视频", size: "256 MB" },
  { name: "安装包.zip", kind: "压缩包", size: "88.5 MB" },
  { name: "报价单.xlsx", kind: "文档", size: "0.3 MB" },
];

const FILE_COLUMNS: readonly TableColumn<FileRow>[] = [
  {
    key: "name",
    header: "名称",
    // Explicit, not flexible: a body row is a virtual item and is not
    // stretched across its list, so a `flex` column has no remainder to take
    // there and collapses while the header's keeps its share. See
    // `columnStyle` and docs/design.md.
    width: 288,
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
];

interface TableArgs {
  theme: PingoUiTheme;
  estimatedRowHeight: number;
  emptyLabel: string;
  empty: boolean;
}

export const Table: StoryObj<TableArgs> = {
  render: (args) => {
    setTheme(args.theme);
    return mountStory(
      () =>
        frameBox(
          520,
          300,
          // Table is a pure builder, not a memo component: it is invoked
          // directly inside the render scope rather than via createElement.
          TableComponent<FileRow>({
            columns: FILE_COLUMNS,
            rowCount: args.empty ? 0 : FILES.length,
            getRow: (index) => FILES[index]!,
            estimatedRowHeight: args.estimatedRowHeight,
            emptyLabel: args.emptyLabel,
          }),
        ),
      { width: 520, height: 340, styleSheets: [createPingoUiStyleSheet()] },
    );
  },
  args: {
    theme: "light",
    estimatedRowHeight: 44,
    emptyLabel: "暂无数据",
    empty: false,
  },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    estimatedRowHeight: { control: { type: "range", min: 32, max: 64, step: 4 } },
    emptyLabel: { control: "text" },
    empty: { control: "boolean" },
  },
};

// ---------------------------------------------------------------------------
// DataTable
// ---------------------------------------------------------------------------

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

const MEMBER_COLUMNS: readonly DataTableColumn<Member>[] = [
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
];

const MEMBER_COMPARATORS: Record<string, (left: Member, right: Member) => number> = {
  name: (left, right) => left.name.localeCompare(right.name, "zh-Hans-CN"),
  commits: (left, right) => left.commits - right.commits,
  active: (left, right) => left.active.localeCompare(right.active),
};

type SortableDataTableProps = {
  readonly estimatedRowHeight: number;
};

// DataTable reports sort changes instead of reordering rows itself (it is
// virtualised, so the rows may not exist locally). This wrapper owns the sort
// state and feeds reordered rows back through getRow.
const SortableDataTable = memo(function SortableDataTable(
  props: SortableDataTableProps,
): PingoNode {
  const sort = useSignal<SortState | undefined>({ key: "commits", direction: "descending" });
  const current = sort.get();
  let rows: readonly Member[] = MEMBERS;
  if (current !== undefined) {
    const compare = MEMBER_COMPARATORS[current.key];
    if (compare !== undefined) {
      const sign = current.direction === "ascending" ? 1 : -1;
      rows = [...MEMBERS].sort((left, right) => sign * compare(left, right));
    }
  }
  return DataTableComponent<Member>({
    columns: MEMBER_COLUMNS,
    ...(current === undefined ? {} : { sort: current }),
    onSortChange: (next) => {
      sort.set(next);
    },
    rowCount: rows.length,
    getRow: (index) => rows[index]!,
    estimatedRowHeight: props.estimatedRowHeight,
  });
});

interface DataTableArgs {
  theme: PingoUiTheme;
  estimatedRowHeight: number;
}

export const DataTable: StoryObj<DataTableArgs> = {
  render: (args) => {
    setTheme(args.theme);
    return mountStory(
      () =>
        frameBox(
          520,
          300,
          createElement(SortableDataTable, {
            estimatedRowHeight: args.estimatedRowHeight,
          }),
        ),
      { width: 520, height: 340, styleSheets: [createPingoUiStyleSheet()] },
    );
  },
  args: {
    theme: "light",
    estimatedRowHeight: 44,
  },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    estimatedRowHeight: { control: { type: "range", min: 32, max: 64, step: 4 } },
  },
};

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

interface CalendarArgs {
  theme: PingoUiTheme;
  selectedDay: number;
  disableWeekends: boolean;
}

function isWeekend(date: CalendarDate): boolean {
  const weekday = new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay();
  return weekday === 0 || weekday === 6;
}

export const Calendar: StoryObj<CalendarArgs> = {
  render: (args) => {
    setTheme(args.theme);
    return mountStory(
      () =>
        // Calendar has no intrinsic width (its 7×36px cells do not size the
        // root), so a fixed-width column wrapper keeps it from collapsing.
        frame(
          280,
          stateful({ year: 2026, month: 8, day: args.selectedDay }, (value, set) =>
            createElement(CalendarComponent, {
              defaultMonth: { year: 2026, month: 8, day: 1 },
              value: value,
              onSelect: set,
              ...(args.disableWeekends ? { isDisabled: isWeekend } : {}),
            }),
          ),
        ),
      { width: 300, height: 360, styleSheets: [createPingoUiStyleSheet()] },
    );
  },
  args: {
    theme: "light",
    selectedDay: 22,
    disableWeekends: false,
  },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    selectedDay: { control: { type: "range", min: 1, max: 31, step: 1 } },
    disableWeekends: { control: "boolean" },
  },
};

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

interface PaginationArgs {
  theme: PingoUiTheme;
  page: number;
  pageCount: number;
  siblingCount: number;
}

export const Pagination: StoryObj<PaginationArgs> = {
  render: (args) => {
    setTheme(args.theme);
    return mountStory(
      () =>
        // Pagination reports the page it was asked for and renders the one it
        // was given: with nowhere to put it, pressing a number did nothing.
        stateful(args.page, (page, set) =>
          createElement(PaginationComponent, {
            page: page,
            pageCount: args.pageCount,
            siblingCount: args.siblingCount,
            onPageChange: set,
          }),
        ),
      { width: 560, height: 100, styleSheets: [createPingoUiStyleSheet()] },
    );
  },
  args: {
    theme: "light",
    page: 3,
    pageCount: 12,
    siblingCount: 1,
  },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    page: { control: { type: "range", min: 1, max: 24, step: 1 } },
    pageCount: { control: { type: "range", min: 1, max: 24, step: 1 } },
    siblingCount: { control: { type: "range", min: 0, max: 3, step: 1 } },
  },
};

// ---------------------------------------------------------------------------
// Breadcrumb
// ---------------------------------------------------------------------------

interface BreadcrumbArgs {
  theme: PingoUiTheme;
  separator: string;
}

export const Breadcrumb: StoryObj<BreadcrumbArgs> = {
  render: (args) => {
    setTheme(args.theme);
    return mountStory(
      () =>
        createElement(BreadcrumbComponent, {
          separator: args.separator,
          items: [
            { label: "首页", onNavigate: () => {} },
            { label: "组件", onNavigate: () => {} },
            { label: "数据展示", onNavigate: () => {} },
            { label: "Breadcrumb" },
          ],
        }),
      { width: 480, height: 100, styleSheets: [createPingoUiStyleSheet()] },
    );
  },
  args: {
    theme: "light",
    separator: "/",
  },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    separator: { control: "text" },
  },
};
