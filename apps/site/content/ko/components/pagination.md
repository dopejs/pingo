---
title: Pagination
description: shadcn 스타일의 페이지네이션 컨트롤로, 페이지 번호 생략과 경계 비활성화 상태를 지원하며 pingo 캔버스에 렌더링합니다.
---

# Pagination

페이지네이션 컨트롤: 현재 페이지가 강조 표시되고, 길어진 페이지 번호 시퀀스는 자동으로 생략 부호로 접히며, 첫 페이지/마지막 페이지에 도달하면 해당 화살표가 비활성화됩니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다. 페이지 번호와 화살표를 클릭하여 페이지를 넘길 수 있으며, 사이트 테마에 따라 밝은/어두운 모드가 전환됩니다.

:::preview pagination-basic
:::

## 사용법

페이지 번호는 **제어 방식**입니다. `page`는 1부터 시작하며, 페이지 전환은 `onPageChange`로 보고되므로 직접 값을 다시 기록해야 합니다.

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { Pagination } from "@dopejs/pingo-ui";

function PagedList(): PingoNode {
  const page = useSignal(1);
  return createElement(Pagination, {
    page: page.get(),
    pageCount: 12,
    onPageChange: (next) => page.set(next),
  });
}
```

## 예시

### 컴팩트 모드

`siblingCount`는 현재 페이지 양옆에 표시할 페이지 번호 수를 제어합니다(첫 페이지와 마지막 페이지는 제외하며, 첫 페이지와 마지막 페이지는 항상 표시됩니다). `0`으로 설정하면 첫 페이지, 마지막 페이지, 현재 페이지만 유지됩니다. 첫 페이지에서는 이전 페이지 화살표가 비활성화됩니다.

:::preview pagination-compact
:::

페이지 번호 시퀀스의 접기 규칙은 내보낸 순수 함수 `paginationRange(page, pageCount, siblingCount)`로 구현되며, 테스트에 단독으로 사용할 수 있습니다.

## Props

| Prop            | 타입                     | 기본값 | 설명                                                                                                                      |
| --------------- | ------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| `page`          | `number`                 | —      | 현재 페이지로, 1부터 시작합니다(필수). 범위를 벗어나면 `[1, pageCount]`로 보정됩니다.                                     |
| `pageCount`     | `number`                 | —      | 전체 페이지 수입니다(필수). 1보다 작으면 페이지 번호를 렌더링하지 않습니다.                                               |
| `onPageChange`  | `(page: number) => void` | —      | 페이지 전환 콜백입니다. 현재 페이지를 클릭하거나 범위를 벗어난 대상을 클릭하면 트리거되지 않습니다.                       |
| `siblingCount`  | `number`                 | `1`    | 현재 페이지 양옆에 각각 표시할 페이지 번호 수입니다.                                                                      |
| `previousLabel` | `string`                 | —      | 타입에 예약된 이전 페이지 텍스트입니다. 현재 버전에서는 아이콘으로 렌더링되며, 이 필드는 아직 렌더링에 사용되지 않습니다. |
| `nextLabel`     | `string`                 | —      | 타입에 예약된 다음 페이지 텍스트입니다. 현재 버전에서는 아이콘으로 렌더링되며, 이 필드는 아직 렌더링에 사용되지 않습니다. |
| `className`     | `string`                 | —      | 컴포넌트 클래스 이름 뒤에 추가됩니다.                                                                                     |

## 접근성

컨트롤 전체는 `navigation` 시맨틱을 가집니다. 현재 페이지는 `current` 시맨틱 값을 가지며, 이전/다음 페이지 버튼의 접근성 이름은 "previous page" / "next page"입니다. 경계에 도달하면 비활성화되고 포인터에 응답하지 않습니다. 키보드에서는 컨트롤 내부의 어느 포커스에서든 `ArrowLeft` / `ArrowRight`로 페이지를 넘길 수 있습니다. 자세한 내용은 [접근성 가이드](/guide/accessibility)를 참조하세요.
