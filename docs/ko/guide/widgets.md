---
title: "Widgets: 스타일 없는 엔진 부품"
description: "@dopejs/pingo-widgets가 제공하는 TextField, TextArea, Pressable, Button 같은 스타일 없는 엔진 레벨 부품과, @dopejs/pingo-ui와의 경계."
---

# Widgets: 스타일 없는 엔진 부품

`@dopejs/pingo-widgets`는 엔진 위의 첫 번째 조합 레이어입니다. [편집 가능 프리미티브](/ko/guide/elements-editing)와
포커스, 네이티브 이벤트를 조립해 쓸 수 있는 부품으로 만들되, **최소한의** 장식(테두리, 오류 상태)만
붙이고 어떤 디자인 시스템도 가정하지 않습니다. 업무 코드가 이 내부 패키지를 직접 의존하지는
않습니다——모든 export는 `@dopejs/pingo`를 통해 re-export됩니다. 아래 미리보기는 실시간으로 렌더링되며
바로 입력할 수 있습니다.

:::preview widgets-textfield
:::

## Export와 명명

| Export      | 설명                                                                         |
| ----------- | ---------------------------------------------------------------------------- |
| `TextField` | 한 줄 입력: 테두리 + 오류 상태 장식, 내부는 `editableText` 프리미티브만 조합 |
| `TextArea`  | 여러 줄 변형. Enter는 줄바꿈, submit은 호스트 폼에 양보                      |
| `Pressable` | 포커스 가능한 활성화 표면: View + 포커스 + 네이티브 click/tap                |
| `Button`    | `Pressable` + `Text`를 조합한 텍스트 버튼 편의 조합                          |

명명 주의: `@dopejs/pingo`의 `TextArea`는 이 장식 붙은 widget을 가리킵니다. 여러 줄 **프리미티브**는
`UnstyledTextArea`로 export됩니다(`TextAreaProps`도 마찬가지로 별칭 `UnstyledTextAreaProps`가 있습니다).

## TextField와 TextArea

기본 장식은 1px 테두리와 8px 패딩입니다. `error` 문자열을 넘기면 오류 색 테두리로 바뀌고 필드 아래에
`alert` 역할의 오류 설명을 한 줄 렌더링합니다. 제어 계약(`value` + `revision` + `onTransaction`)은
[편집 가능 요소](/ko/guide/elements-editing)와 완전히 같습니다——widget은 새로운 입력 경로를 도입하지
않습니다.

```tsx
import { createElement, TextField } from "@dopejs/pingo";

createElement(TextField, {
  value,
  revision,
  semanticLabel: "수신자",
  width: 320,
  error: value === "" ? "수신자는 비워 둘 수 없습니다" : undefined,
  onTransaction: (t) => apply(t),
});
```

### Props(TextField)

| Prop              | 타입                           | 기본값                   | 설명                                                          |
| ----------------- | ------------------------------ | ------------------------ | ------------------------------------------------------------- |
| `value`           | `string`                       | `""`                     | 제어 텍스트                                                   |
| `revision`        | `number \| bigint`             | `0n`                     | 제어 값의 권위 있는 revision                                  |
| `controller`      | `TextEditingController`        | —                        | 로컬 controller. `value`/`revision`과 상호 배타적             |
| `readOnly`        | `boolean`                      | —                        | 읽기 전용                                                     |
| `password`        | `boolean`                      | —                        | 비밀번호 모드(평문은 DisplayList와 접근성 값에 들어가지 않음) |
| `maxGraphemes`    | `number`                       | —                        | 자소 상한                                                     |
| `inputMode`       | `EditableInputMode`            | —                        | 소프트 키보드 레이아웃 힌트                                   |
| `width`           | `number`                       | `240`                    | 테두리를 포함한 전체 너비                                     |
| `height`          | `number`                       | `lineHeight × rows + 16` | 테두리를 포함한 전체 높이                                     |
| `fontSize`        | `number`                       | `14`                     | 글자 크기                                                     |
| `lineHeight`      | `number`                       | `round(fontSize × 1.5)`  | 줄 높이                                                       |
| `color`           | `Color`                        | `#1f2329ff`              | 텍스트 색상                                                   |
| `backgroundColor` | `Color`                        | `#ffffffff`              | 필드 배경색                                                   |
| `borderColor`     | `Color`                        | `#c0c4ccff`              | 테두리 색상                                                   |
| `errorColor`      | `Color`                        | `#d03050ff`              | 오류 상태의 테두리와 설명 색상                                |
| `error`           | `string`                       | —                        | 비어 있지 않으면 오류 상태: 오류 색 테두리 + 아래쪽 오류 설명 |
| `onTransaction`   | `(t: EditTransaction) => void` | —                        | Core 편집 트랜잭션 콜백                                       |
| `onSubmit`        | `() => void`                   | —                        | 한 줄 Enter 제출                                              |
| `semanticLabel`   | `string`                       | —                        | 접근성 이름(역할은 항상 `textbox`)                            |

`TextArea`는 여기에 `rows`(기본값 `3`)가 하나 더 있으며, 기본 높이 계산에 쓰입니다.

## Pressable과 Button

`Pressable`은 새로운 Scene 노드 종류를 도입하지 않습니다. `button` 의미를 갖고, 눌리면 자동으로
포커스를 가져가며, 네이티브 click/tap을 `onPress`로 매핑하는 `View`일 뿐입니다. 스타일은 전적으로
`style`과 `children`이 결정하고, `disabled`이면 불투명도를 낮추고 이벤트를 떼어 냅니다.

| Prop               | 타입         | 기본값                         | 설명                                    |
| ------------------ | ------------ | ------------------------------ | --------------------------------------- |
| `children`         | `PingoNode`  | —                              | 내용(Button은 `string \| number`, 필수) |
| `disabled`         | `boolean`    | `false`                        | 비활성 상태                             |
| `onPress`          | `() => void` | —                              | 활성화 콜백                             |
| `className`        | `string`     | —                              | 클래스 이름(스타일시트에 연결)          |
| `style`            | `PingoStyle` | —                              | 인라인 스타일                           |
| `width` / `height` | `number`     | —                              | 크기                                    |
| `semanticLabel`    | `string`     | `Button`은 `children`에서 취함 | 접근성 이름                             |

`Button`은 추가로 `color`와 `fontSize`를 받습니다(내부 텍스트에 전달).

## @dopejs/pingo-ui와의 경계

두 레이어는 서로 다른 질문에 답합니다.

- **widgets** —— 동작 정확성: 편집 트랜잭션, 포커스, 의미 역할, 최소 장식. 어떤 디자인 의견도 없으며
  색상과 글자 크기는 모두 오버라이드할 수 있습니다.
- **@dopejs/pingo-ui** —— 디자인 시스템: shadcn 사고방식의 완성 컴포넌트(변형, 크기, 테마, 스타일시트).
  내부적으로 widgets, `@dopejs/pingo-editing`, 런타임 hooks를 조합하며 엔진에는 전혀 손대지 않습니다.

선택 제안: 바로 쓸 수 있는 디자인 시스템이 필요하면 [pingo-ui 컴포넌트](/ko/components)를 바로 사용하고,
자체 디자인 언어는 있지만 편집 트랜잭션 세부는 만지고 싶지 않다면 widgets를 기초로 사용하고, 완전한
커스텀(예: 게임 HUD)이라면 [기본 요소](/ko/guide/elements) 프리미티브를 직접 사용하십시오.

## 접근성

`TextField` / `TextArea`는 `textbox` 역할을 갖고 나오며, `error` 설명은 `alert` 역할입니다.
`Pressable` / `Button`은 `button` 역할이며 `disabled`는 `semanticValue`로 노출됩니다. 이름은 모두
`semanticLabel`에 의존합니다——보이는 label이 없을 때 생략하지 마십시오. 자세한 내용은
[접근성](/ko/guide/accessibility)을 보십시오.
