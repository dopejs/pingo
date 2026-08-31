---
title: Radio Group
description: 단일 선택 옵션 그룹으로, 방향키 탐색을 지원하며 pingo canvas에 렌더링됩니다.
---

# Radio Group

라디오 그룹은 상호 배타적인 옵션 중 하나를 선택할 때 사용합니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다. 옵션을 클릭하거나 방향키로 선택을 이동할 수 있으며, 사이트 테마에 따라 밝은 모드와 어두운 모드가 전환됩니다.

:::preview radio-group-basic
:::

## 사용법

```tsx
import { RadioGroup, RadioGroupItem } from "@dopejs/pingo-ui";

root.render(
  <RadioGroup defaultValue="b" onValueChange={(value) => console.log(value)}>
    <RadioGroupItem value="a" label="옵션 A" />
    <RadioGroupItem value="b" label="옵션 B" />
    <RadioGroupItem value="c" label="옵션 C" />
  </RadioGroup>,
);
```

`RadioGroup`은 context를 통해 `RadioGroupItem`에 현재 값을 전달하므로, 둘 다 JSX로 컴포넌트 형태로 마운트해야 합니다. `value`를 전달하면 제어 모드가 되고, 그렇지 않으면 `defaultValue`를 사용해 컴포넌트가 자체적으로 상태를 유지합니다.

## 예제

### 비활성화

`RadioGroup`에 `disabled`를 전달하면 그룹 전체가 비활성화되며, 개별 항목의 시맨틱 값은 `disabled`가 됩니다.

## Props

### RadioGroup

| Prop            | 타입                      | 기본값  | 설명                           |
| --------------- | ------------------------- | ------- | ------------------------------ |
| `value`         | `string`                  | —       | 제어되는 선택 값               |
| `defaultValue`  | `string`                  | —       | 비제어 초기 선택 값            |
| `onValueChange` | `(value: string) => void` | —       | 선택 변경 콜백                 |
| `disabled`      | `boolean`                 | `false` | 그룹 전체 비활성화             |
| `children`      | `PingoNode`               | —       | `RadioGroupItem` 목록 (필수)   |
| `className`     | `string`                  | —       | 컴포넌트 클래스 이름 뒤에 추가 |

### RadioGroupItem

| Prop        | 타입     | 기본값 | 설명                           |
| ----------- | -------- | ------ | ------------------------------ |
| `value`     | `string` | —      | 옵션 값 (필수)                 |
| `label`     | `string` | —      | 옵션 텍스트                    |
| `className` | `string` | —      | 컴포넌트 클래스 이름 뒤에 추가 |

## 접근성

그룹 컨테이너는 `radiogroup` 시맨틱을 가지며, 개별 항목은 `radio` 시맨틱을 가지고 `checked` / `unchecked` / `disabled` 사이를 전환합니다. WAI-ARIA를 준수합니다. 라디오 그룹은 레이아웃 방향과 관계없이 두 방향키 모두로 선택을 이동하고 포커스를 동기화할 수 있습니다.
