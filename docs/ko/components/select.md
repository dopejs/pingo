---
title: Select
description: 조합형 드롭다운 선택기로 키보드 탐색을 지원하며 pingo canvas에 렌더링됩니다.
---

# Select

드롭다운 선택기는 `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`으로 구성됩니다. 아래 미리보기는 pingo 엔진으로 실시간 렌더링됩니다. 목록이 이미 펼쳐져 있으며, 방향키로 탐색하고 Enter로 선택할 수 있으며, 사이트 테마에 따라 밝은 모드와 어두운 모드가 전환됩니다.

:::preview select-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@dopejs/pingo-ui";

root.render(
  createElement(Select, {
    value: "pingo-ui",
    onValueChange: (value) => console.log(value),
    children: [
      createElement(SelectTrigger, { placeholder: "패키지 선택" }),
      createElement(SelectContent, {
        children: [
          createElement(SelectItem, { value: "pingo", children: "@dopejs/pingo" }),
          createElement(SelectItem, { value: "pingo-ui", children: "@dopejs/pingo-ui" }),
        ],
      }),
    ],
  }),
);
```

모든 부분은 context를 통해 협력하며, 반드시 `createElement`를 사용해 컴포넌트 형태로 마운트해야 합니다. 트리거는 현재 선택된 `value`를 표시합니다. 선택되지 않은 경우 `placeholder`를 표시합니다.

## 예시

### 기본 펼침

`defaultOpen`은 목록을 처음부터 펼쳐지게 합니다(위 미리보기 참조). `onOpenChange`로 열림/닫힘을 감지합니다.

## Props

### Select

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | `string` | — | 선택 값으로, 트리거에 표시됩니다 |
| `defaultOpen` | `boolean` | `false` | 처음부터 펼침 |
| `onValueChange` | `(value: string) => void` | — | 선택 변경 콜백(선택 후 자동으로 닫힘) |
| `onOpenChange` | `(open: boolean) => void` | — | 열림/닫힘 콜백 |
| `children` | `PingoNode` | — | 트리거와 콘텐츠(필수) |
| `className` | `string` | — | 컴포넌트 클래스 이름 뒤에 추가됩니다 |

### SelectTrigger

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | 사용자 정의 트리거 콘텐츠. 없으면 선택 값 또는 플레이스홀더 텍스트를 렌더링합니다 |
| `placeholder` | `string` | — | 선택되지 않았을 때 표시할 플레이스홀더 텍스트 |
| `className` | `string` | — | 컴포넌트 클래스 이름 뒤에 추가됩니다 |

### SelectContent

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | `SelectItem` 목록(필수) |
| `className` | `string` | — | 컴포넌트 클래스 이름 뒤에 추가됩니다 |

### SelectItem

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | `string` | — | 옵션 값(필수) |
| `children` | `string` | — | 옵션 텍스트(필수) |
| `className` | `string` | — | 컴포넌트 클래스 이름 뒤에 추가됩니다 |

## 접근성

트리거는 button 의미론을 가지며 `expanded`와 `collapsed` 사이를 전환합니다. 콘텐츠는 menu 의미론을 가집니다. 방향키로 하이라이트를 이동하고, `Enter`/`스페이스`로 선택하며, `Esc`로 닫습니다. 선택 후에는 포커스가 트리거로 돌아갑니다.
