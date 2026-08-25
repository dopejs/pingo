---
title: Data Table
description: 정렬 가능한 헤더를 갖춘 가상 스크롤 테이블로, 정렬은 콜백으로 보고되며 pingo canvas에서 렌더링됩니다.
---

# Data Table

[Table](/components/table) 위에 정렬 가능한 헤더를 추가합니다. 정렬은 **실행이 아닌 보고** 방식입니다. 컴포넌트는 `onSortChange`를 통해 새 정렬 상태를 알려 주며, `getRow`의 데이터 소스를 직접 재정렬해야 합니다. 가상 테이블의 행 데이터는 서버나 store에 있는 경우가 많으므로, 컴포넌트는 정렬을 위해 모든 행을 구체화하지 않습니다. 아래 프리뷰는 pingo 엔진이 실시간으로 렌더링합니다. 「멤버」「커밋」「최근 활동」 헤더를 클릭하면 오름차순 → 내림차순 → 취소 순으로 순환하며, 사이트 테마에 따라 밝거나 어두운 모드가 적용됩니다.

:::preview data-table-sortable
:::

## 사용법

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { DataTable, type SortState } from "@dopejs/pingo-ui";

function MemberTable(): PingoNode {
  const sort = useSignal<SortState | undefined>(undefined);
  const current = sort.get();
  const rows = sortMembers(members, current); // 데이터 소스를 직접 재정렬합니다.
  return DataTable<Member>({
    columns: [
      {
        key: "name",
        header: "멤버",
        sortable: true,
        cell: (row) => createElement("text", { value: row.name }),
      },
      {
        key: "commits",
        header: "커밋",
        width: 80,
        align: "end",
        sortable: true,
        cell: (row) => createElement("text", { value: String(row.commits) }),
      },
    ],
    sort: current,
    onSortChange: (next) => sort.set(next),
    rowCount: rows.length,
    getRow: (index) => rows[index],
  });
}
```

정렬된 열을 클릭하면 오름차순 → 내림차순 → 취소 순으로 순환합니다(`nextSort` 규칙). 세 번째 상태가 존재하는 이유는 정렬을 잘못 클릭한 사용자가 데이터의 원래 순서로 돌아갈 방법이 필요하기 때문입니다. Table과 마찬가지로 테이블 본문은 가상 목록이므로 부모 컨테이너에 높이를 지정해야 합니다.

## Props

### DataTableProps\<Row\>

`TableProps<Row>`의 모든 필드를 상속합니다(`columns`는 정렬 가능한 버전으로 대체).

| Prop                 | 타입                                     | 기본값          | 설명                                                                                                  |
| -------------------- | ---------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------- |
| `columns`            | `readonly DataTableColumn<Row>[]`        | —               | 열 정의(필수). `TableColumn`보다 `sortable`이 하나 더 있습니다.                                       |
| `sort`               | `SortState`                              | —               | 현재 정렬 상태. 생략하면 정렬되지 않음을 의미합니다.                                                  |
| `onSortChange`       | `(sort: SortState \| undefined) => void` | —               | 정렬 변경 콜백. `undefined`는 정렬 취소를 의미합니다. 전달하지 않으면 헤더를 클릭할 수 없습니다.      |
| `rowCount`           | `number`                                 | —               | 전체 행 수(필수)                                                                                      |
| `getRow`             | `(index: number) => Row`                 | —               | 행 번호로 행 데이터를 가져옵니다(필수).                                                               |
| `estimatedRowHeight` | `number`                                 | `44`            | 예상 행 높이                                                                                          |
| `onRowPress`         | `(index: number) => void`                | —               | 행 클릭 콜백                                                                                          |
| `emptyLabel`         | `string`                                 | `"데이터 없음"` | 빈 상태 문구                                                                                          |
| `renderHeaderCell`   | `(column, index) => PingoNode`           | —               | 타입에는 존재하지만, 컴포넌트 내부에서 정렬 가능한 헤더를 구현하는 데 사용하므로 전달하면 덮어씁니다. |
| `className`          | `string`                                 | —               | 컴포넌트 클래스 이름 뒤에 추가됩니다.                                                                 |

### DataTableColumn\<Row\>

`TableColumn<Row>`의 확장으로, 다음이 추가됩니다.

| 필드       | 타입      | 기본값  | 설명                                  |
| ---------- | --------- | ------- | ------------------------------------- |
| `sortable` | `boolean` | `false` | 헤더를 클릭하여 정렬할 수 있는지 여부 |

### SortState

| 필드        | 타입                          | 설명            |
| ----------- | ----------------------------- | --------------- |
| `key`       | `string`                      | 정렬 열의 `key` |
| `direction` | `"ascending" \| "descending"` | 정렬 방향       |

현재 정렬 열의 헤더에는 `▲` / `▼` 표시가 나타납니다.

## 접근성

헤더 셀은 `columnheader` 시맨틱을 가집니다. 정렬 가능한 열의 정렬 상태(`ascending` / `descending` / `none`)는 시맨틱 값을 통해 보조 기술에 노출되며, 클릭 전에 헤더로 포커스가 이동합니다. 자세한 내용은 [접근성 가이드](/guide/accessibility)를 참조하세요.
