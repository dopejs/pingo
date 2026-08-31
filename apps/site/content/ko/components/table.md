---
title: Table
description: 가상 스크롤 데이터 테이블, 열 정의가 헤더와 행을 함께 구동하며 pingo 캔버스에 렌더링합니다.
---

# Table

가상 스크롤 테이블: 열 정의가 헤더와 각 행을 함께 구동하므로 만 행과 한 화면 분량 행의 렌더링 비용이 같습니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다. 스크롤하거나 행을 클릭할 수 있으며 사이트 테마 전환에 따라 밝고 어두운 모드가 함께 바뀝니다.

:::preview table-basic
:::

## 사용법

`Table`은 memo 컴포넌트가 아닌 순수 빌더 함수이므로 직접 호출하면 씬 노드를 반환합니다. 컴포넌트 렌더링 스코프 안에서 호출해야(아래 함수 컴포넌트처럼) 테마 읽기가 사이트 테마 전환을 구독합니다.

```tsx
import type { PingoNode } from "@dopejs/pingo";
import { Table } from "@dopejs/pingo-ui";

type FileRow = { name: string; size: string };

function FileTable(): PingoNode {
  return Table<FileRow>({
    columns: [
      {
        key: "name",
        header: "名称",
        cell: (row) => <text value={row.name} />,
      },
      {
        key: "size",
        header: "大小",
        width: 96,
        align: "end",
        cell: (row) => <text value={row.size} />,
      },
    ],
    rowCount: files.length,
    getRow: (index) => files[index],
    onRowPress: (index) => open(files[index]),
  });
}
```

테이블 본체는 [VirtualList](/guide/scrolling)이며 부모 컨테이너가 높이를 지정해야 합니다(예시에서는 바깥 컨테이너 `height: 260`).

## 예시

### 빈 상태

`rowCount`가 `0`이면 `emptyLabel`(기본값 「暂无数据」)을 렌더링하고 가상 리스트를 생성하지 않습니다.

:::preview table-empty
:::

## Props

### TableProps\<Row\>

| Prop                 | 타입                                                     | 기본값       | 설명                                                                    |
| -------------------- | -------------------------------------------------------- | ------------ | ----------------------------------------------------------------------- |
| `columns`            | `readonly TableColumn<Row>[]`                            | —            | 열 정의. 헤더와 행을 함께 구동합니다(필수)                              |
| `rowCount`           | `number`                                                 | —            | 전체 행 수(필수). `0`이면 빈 상태를 렌더링합니다                        |
| `getRow`             | `(index: number) => Row`                                 | —            | 행 번호로 행 데이터를 가져옵니다. 보이는 창에 대해서만 호출됩니다(필수) |
| `estimatedRowHeight` | `number`                                                 | `44`         | 가상 스크롤 계획에 사용하는 예상 행 높이                                |
| `onRowPress`         | `(index: number) => void`                                | —            | 행 클릭 콜백. 전달하면 행에 포커스할 수 있습니다                        |
| `emptyLabel`         | `string`                                                 | `"暂无数据"` | 빈 상태 문구                                                            |
| `renderHeaderCell`   | `(column: TableColumn<Row>, index: number) => PingoNode` | —            | 특정 열의 기본 헤더 셀을 대체합니다                                     |
| `className`          | `string`                                                 | —            | 컴포넌트 클래스 이름 뒤에 추가합니다                                    |

### TableColumn\<Row\>

| 필드     | 타입                                     | 기본값    | 설명                                                                |
| -------- | ---------------------------------------- | --------- | ------------------------------------------------------------------- |
| `key`    | `string`                                 | —         | 열 식별자. 노드의 key로 사용됩니다(필수)                            |
| `header` | `string`                                 | —         | 헤더 문구(필수)                                                     |
| `width`  | `number`                                 | —         | 고정 너비(논리 픽셀). 생략하면 `flex`에 따라 남은 너비를 분배합니다 |
| `flex`   | `number`                                 | `1`       | `width`를 설정하지 않았을 때 남은 너비에 대한 분배 몫               |
| `align`  | `"start" \| "center" \| "end"`           | `"start"` | 열 콘텐츠의 수평 정렬. 헤더와 셀이 함께 사용합니다                  |
| `cell`   | `(row: Row, index: number) => PingoNode` | —         | 셀 콘텐츠 빌더 함수(필수)                                           |

가상 테이블은 콘텐츠에 따라 열 너비를 측정할 수 없습니다. 렌더링되지 않은 행은 측정에 참여하지 않으므로 열 너비는 오직 열 정의에서만 나옵니다. 이것이 헤더와 행이 자연스럽게 정렬되는 이유이기도 합니다.

## 접근성

테이블에는 `table` 시맨틱이 적용되며 헤더는 `columnheader`, 각 행은 `row`입니다. `onRowPress`를 전달하면 행을 포인터로 포커스하고 활성화할 수 있습니다. 자세한 내용은 [접근성 가이드](/guide/accessibility)를 참조하세요.
