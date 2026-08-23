---
title: Input OTP
description: 정길이 일회용 인증번호 입력으로, 칸별 입력과 전체 붙여넣기를 지원하며 pingo canvas에 렌더링합니다.
---

# Input OTP

일회용 인증번호 입력으로, 여러 개의 정길이 칸으로 구성됩니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다. 칸마다 숫자를 입력하거나 인증번호 전체를 붙여넣을 수 있으며, 사이트 테마에 따라 밝고 어두운 모드가 전환됩니다.

:::preview input-otp-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { InputOTP } from "@dopejs/pingo-ui";

root.render(
  createElement(InputOTP, {
    length: 6,
    semanticLabel: "일회용 인증번호",
    onValueChange: (value) => console.log(value),
    onComplete: (code) => verify(code),
  }),
);
```

내부 값은 **정길이이며 공백으로 채워진** 문자열입니다. 공백은 빈 칸을 나타냅니다. `onValueChange`는 이렇게 채워진 값을 전달받으며, `onComplete`는 모든 칸이 채워졌을 때 한 번 호출되고 공백을 제거한 완전한 인증번호를 전달받습니다. 붙여넣기는 현재 칸부터 시작하는 전체 채우기로 처리되며, 삭제는 현재 칸만 비우고 뒤따르는 숫자를 왼쪽으로 이동시키지 않습니다.

## 예제

### 길이

`length`는 칸 수를 결정합니다(기본값 6). 각 칸은 숫자 소프트 키보드를 사용합니다(`inputMode: "numeric"`).

## Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `length` | `number` | `6` | 칸 수 |
| `value` | `string` | — | 제어되는 현재 값(공백으로 채워짐) |
| `defaultValue` | `string` | — | 비제어 초기값 |
| `onValueChange` | `(value: string) => void` | — | 값 변경 콜백, 값은 공백으로 채워진 정길이 문자열 |
| `onComplete` | `(value: string) => void` | — | 모두 채워졌을 때 호출되는 콜백, 값은 공백을 제거한 완전한 인증번호 |
| `disabled` | `boolean` | `false` | 모든 칸 비활성화 |
| `semanticLabel` | `string` | — | 그룹의 접근성 이름 |
| `className` | `string` | — | 컴포넌트 클래스 이름 뒤에 추가됨 |

## 접근성

컴포넌트는 `group` 시맨틱 역할을 가집니다. 각 칸은 자동으로 `순번/전체` 형식의 접근성 이름(예: `3/6`)을 가지며, `semanticLabel`을 통해 그룹 전체의 이름을 지정할 수도 있습니다.
