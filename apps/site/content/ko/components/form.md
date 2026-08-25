---
title: Form
description: 폼 컨테이너와 필드 래퍼로, 레이아웃·시맨틱·오류/설명 정보 위치를 담당하며 pingo 캔버스에 렌더링합니다.
---

# Form

`Form`은 폼 컨테이너이고, `FormField`는 라벨, 컨트롤, 오류/설명 정보를 하나의 필드로 조립합니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다. 필드 안의 입력 상자는 실제로 편집할 수 있으며, 사이트 테마에 따라 밝은 모드와 어두운 모드를 전환합니다.

:::preview form-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { Form, FormField, Input } from "@dopejs/pingo-ui";

root.render(
  createElement(Form, {
    children: createElement(FormField, {
      label: "이메일",
      required: true,
      error: emailError, // 검증 규칙은 호출 측이 보유합니다
      children: createElement(Input, {
        semanticLabel: "이메일",
        onValueChange: (value) => validate(value),
      }),
    }),
  }),
);
```

검증은 컴포넌트 안에서 하지 않습니다. 언제 검증할지, 어떤 오류를 표시할지, 어떻게 조합할지는 모두 제품 결정 사항입니다. 호출 측이 규칙을 보유하고 `error`를 전달하며, 컴포넌트는 레이아웃, 시맨틱, 정보 위치만 담당합니다.

## 예제

### 오류와 설명

`error`가 존재하면 필드가 무효로 표시되고 설명 텍스트를 **대체**합니다. 두 줄의 안내 중 한 줄이 실패 정보라면 다른 한 줄이 그것을 묻어버리기 때문입니다. `required`는 라벨 뒤에 `*` 표시를 추가합니다.

## Props

### Form

| Prop        | 타입        | 기본값 | 설명                           |
| ----------- | ----------- | ------ | ------------------------------ |
| `children`  | `PingoNode` | —      | 폼 내용(필수)                  |
| `className` | `string`    | —      | 컴포넌트 클래스 이름 뒤에 추가 |

### FormField

| Prop          | 타입        | 기본값  | 설명                                                         |
| ------------- | ----------- | ------- | ------------------------------------------------------------ |
| `label`       | `string`    | —       | 필드 라벨(필수)                                              |
| `children`    | `PingoNode` | —       | 필드 컨트롤(필수)                                            |
| `error`       | `string`    | —       | 오류 정보. 존재하면 필드를 무효로 표시하고 설명을 대체합니다 |
| `description` | `string`    | —       | 보조 설명 텍스트                                             |
| `required`    | `boolean`   | `false` | 필수 표시. 라벨 뒤에 `*`를 추가합니다                        |
| `className`   | `string`    | —       | 컴포넌트 클래스 이름 뒤에 추가                               |

## 접근성

`Form`은 `form` 시맨틱 역할을 가지며, `FormField`는 `group` 시맨틱을 가지고 라벨로 이름이 지정됩니다. 무효 상태일 때 시맨틱 값은 `invalid`입니다. 시맨틱 표기는 컨트롤이 아니라 그룹에 부여합니다. 컨트롤은 호출 측의 것이며, 그룹은 존재가 보장되는 유일한 요소이기 때문입니다.
