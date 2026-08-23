---
title: Toggle Group
description: 두 가지 상태를 전환하는 버튼 모음으로, 단일 선택 또는 다중 선택이 가능하며 방향키 탐색을 지원하고 pingo 캔버스에 렌더링됩니다.
---

# Toggle Group

토글 버튼 그룹은 여러 [Toggle](/components/toggle)을 하나의 단일 선택 또는 다중 선택 모음으로 묶습니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다. 클릭하여 전환하고, 방향키로 항목 사이를 이동하며, 사이트 테마에 따라 밝은 모드와 어두운 모드를 따릅니다.

:::preview toggle-group-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { ToggleGroup, ToggleGroupItem } from "@dopejs/pingo-ui";

root.render(
  createElement(ToggleGroup, {
    type: "single",
    defaultValue: ["center"],
    onValueChange: (value) => console.log(value),
    children: [
      createElement(ToggleGroupItem, { value: "left", children: "左对齐" }),
      createElement(ToggleGroupItem, { value: "center", children: "居中" }),
      createElement(ToggleGroupItem, { value: "right", children: "右对齐" }),
    ],
  }),
);
```

`ToggleGroup`은 context를 통해 `ToggleGroupItem`에 선택 모음을 전달하며, 둘 다 반드시 `createElement`로 컴포넌트 형태로 마운트해야 합니다. `type: "single"`이면 새 선택이 이전 선택을 지우고, `"multiple"`이면 항목별로 추가됩니다.

## 예제

### 다중 선택

`type="multiple"`을 사용하면 텍스트 서식 도구 모음처럼 여러 항목을 동시에 누를 수 있습니다.

:::preview toggle-group-multiple
:::

## Props

### ToggleGroup

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `"single" \| "multiple"` | `"single"` | 단일 선택은 이전 선택을 지우고, 다중 선택은 항목별로 추가합니다 |
| `value` | `readonly string[]` | — | 제어되는 선택 값 모음 |
| `defaultValue` | `readonly string[]` | `[]` | 비제어 초기 선택 모음 |
| `onValueChange` | `(value: readonly string[]) => void` | — | 선택 모음 변경 콜백 |
| `children` | `PingoNode` | — | `ToggleGroupItem` 목록 (필수) |
| `className` | `string` | — | 컴포넌트 클래스 이름 뒤에 추가합니다 |

### ToggleGroupItem

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 항목 값 (필수) |
| `children` | `string` | — | 항목 텍스트 (필수) |
| `disabled` | `boolean` | `false` | 개별 항목을 비활성화합니다 |
| `className` | `string` | — | 컴포넌트 클래스 이름 뒤에 추가합니다 |

## 접근성

그룹 컨테이너는 `group` 시맨틱을 가지며, 각 항목은 Toggle의 button 시맨틱과 `on` / `off` 시맨틱 값을 상속합니다. 키보드 처리는 그룹에 집중됩니다. `←`/`→`는 초점을 인접한 항목으로 이동시키고, `Enter`/`스페이스`는 현재 항목을 전환합니다. 항목의 추가나 제거는 이 탐색에 영향을 주지 않습니다.
