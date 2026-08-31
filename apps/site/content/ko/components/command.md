---
title: Command
description: 검색 및 필터링이 가능한 명령 팔레트로, 키보드 선택과 Enter 확인을 지원합니다.
---

# Command

Command는 검색창이 있는 명령 팔레트입니다. 입력 즉시 항목을 필터링하고, 방향키로 커서를 이동하며, Enter로 확인합니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다. 검색창에 직접 입력하여 필터링할 수 있으며, 사이트 테마에 따라 밝은 모드와 어두운 모드가 전환됩니다.

:::preview command-basic
:::

## 사용법

```tsx
import { Command } from "@dopejs/pingo-ui";

root.render(
  <Command
    items={[
      { value: "open", label: "파일 열기" },
      { value: "save", label: "파일 저장" },
    ]}
    onSelect={(value) => run(value)}
    onDismiss={() => closePalette()}
  />,
);
```

필터링은 대소문자를 구분하지 않는 라벨 부분 문자열 매칭입니다. 의도적으로 퍼지 매칭을 사용하지 않습니다. 정렬 전략은 제품 차원의 결정이므로 컴포넌트가 호출자를 대신해 결정하지 않습니다. `onDismiss`는 탐색 키가 일치하지 않을 때 `Escape`에 응답하므로, 패널을 Dialog로 감싸 '⌘K' 경험을 구현하는 데 적합합니다.

## Props

| Prop          | 타입                      | 기본값        | 설명                              |
| ------------- | ------------------------- | ------------- | --------------------------------- |
| `items`       | `readonly CommandItem[]`  | —             | 명령 항목 (필수)                  |
| `onSelect`    | `(value: string) => void` | —             | 항목 선택 콜백 (클릭 또는 Enter)  |
| `onDismiss`   | `() => void`              | —             | `Escape` 콜백                     |
| `placeholder` | `string`                  | `"검색"`      | 검색창의 접근성 이름              |
| `emptyLabel`  | `string`                  | `"결과 없음"` | 필터링 결과가 없을 때의 안내 문구 |
| `className`   | `string`                  | —             | 추가 클래스명                     |

### CommandItem

| 필드    | 타입     | 설명                     |
| ------- | -------- | ------------------------ |
| `value` | `string` | 항목 값 (필수)           |
| `label` | `string` | 표시 및 매칭 문구 (필수) |

## 접근성

컨테이너는 search 시맨틱을 가지며, 항목은 option 시맨틱을 가지고 selected 상태를 노출합니다. 위아래 방향키로 커서를 이동하고, `Enter`로 확인하며, `Escape`는 `onDismiss`를 트리거합니다.
