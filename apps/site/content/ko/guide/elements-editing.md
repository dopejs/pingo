---
title: "편집 가능 요소: Input과 TextArea"
description: 엔진 네이티브 편집 가능 텍스트 프리미티브——제어 revision 트랜잭션 계약, EditContext 입력 브리지, 비밀번호와 읽기 전용.
---

# 편집 가능 요소: Input과 TextArea

`Input`과 `TextArea`(`@dopejs/pingo`에서는 `UnstyledTextArea`로 export, 아래 참조)는 엔진 네이티브
편집 가능 텍스트 프리미티브입니다. 캐럿, 선택 영역, IME 조합, 클립보드, 실행 취소/다시 실행이 모두
Core가 구현하므로 **canvas 위에 어떤 HTML 입력 컨트롤도 덮을 필요가 없습니다**. 아래 미리보기는 실제로
입력할 수 있습니다——클릭해서 포커스하고, 한글 입력기, 드래그 선택, Ctrl+Z를 시험해 보십시오.

:::preview elements-input
:::

## 사용법

제어(controlled) 방식: `value` + 단조 증가하는 `revision`을 넘기고, `onTransaction`에서 Core가 보낸
트랜잭션을 확인합니다.

```tsx
import { createElement, Input, type EditTransaction } from "@dopejs/pingo";

let value = "주문 메모";
let revision = 1n;

function applyDelta(current: string, transaction: EditTransaction): string {
  const delta = transaction.delta;
  return delta === undefined
    ? current
    : current.slice(0, delta.range.start) + delta.text + current.slice(delta.range.end);
}

createElement(Input, {
  value,
  revision,
  semanticLabel: "주문 메모",
  onTransaction: (transaction) => {
    value = applyDelta(value, transaction);
    revision = transaction.revision;
  },
});
```

순수 로컬 상태라면 `value` / `revision`을 넘기지 않고 `TextEditingController`를 쓸 수도 있습니다
(hooks 상황에서는 `useTextEditingController`). `controller`와 `value`/`revision`은 상호 배타적입니다.

## revision 트랜잭션 계약

상태 소유권은 명확합니다. **Shell은 업무 데이터를 소유하고, Core는 활성 편집 세션의 순간 상태를
소유합니다.**

1. 입력이 Core에 도착하면 `base_revision`이 현재 세션과 일치하는지 검증합니다.
2. 통과하면 **즉시 적용하고 다시 그립니다**——키 입력마다 전체 렌더 파이프라인을 돌 필요가 없습니다.
3. Core는 역방향으로 버전이 부여된 `EditTransaction`을 발행합니다.
4. Shell은 확인(자신의 `value` / `revision` 갱신)하거나, 업무 검증에 실패하면 새 `revision`이 붙은
   보정값을 보냅니다. 오래된 revision이 더 새로운 Core 입력을 덮어쓰는 일은 절대 없으며, 같은 revision의
   확인은 실행 취소 스택을 비우지 않습니다.

`EditTransaction`의 필드:

| 필드           | 타입                                                        | 설명                                                                                                     |
| -------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `nodeId`       | `number`                                                    | 트랜잭션을 만든 편집 노드                                                                                |
| `baseRevision` | `bigint`                                                    | 트랜잭션이 기반한 revision                                                                               |
| `revision`     | `bigint`                                                    | 트랜잭션 후의 새 revision                                                                                |
| `delta`        | `{ range: { start, end }, text }`                           | 텍스트 차이. 오프셋은 UTF-16이며 EditContext/InputEvent에 맞춥니다. 순수 선택 영역 트랜잭션에는 없습니다 |
| `selection`    | `{ anchor, focus, anchorAffinity, focusAffinity }`          | 트랜잭션 후의 선택 영역                                                                                  |
| `composition`  | `{ start, end }`                                            | 진행 중인 IME 조합 구간                                                                                  |
| `kind`         | `"edit" \| "composition" \| "external" \| "undo" \| "redo"` | 트랜잭션 종류                                                                                            |

## 입력 브리지: EditContext와 폴백 프록시

메인 스레드는 우선순위에 따라 운영체제의 텍스트 입력 서비스에 연결합니다.

1. **EditContext** —— canvas에 바인딩해 텍스트/선택/조합을 받고, 입력기에 control, selection, 문자 경계를
   보고합니다. 후보창이 캐럿 옆에 붙을 수 있는 이유입니다.
2. **엔진이 관리하는 입력 프록시** —— EditContext를 쓸 수 없을 때, 호스트는 **하나뿐인** 전역 숨겨진
   `textarea`로 `beforeinput`, 조합, 소프트 키보드, 클립보드를 일괄 처리합니다.

이것은 플랫폼 폴백 구현이지 EmbedDOM 컴포넌트 모델이 아닙니다. Scene 안에는 각 편집 노드와 일대일로
대응하는 DOM이 존재하지 않습니다. 두 경로는 같은 편집 동작 계약 테스트를 통과합니다.

## 여러 줄: TextArea 프리미티브

`TextArea` 프리미티브는 `Input`과 같은 `editableText` 서브시스템을 공유하며, 유일한 차이는 `multiline`
불변 조건을 컴포넌트가 고정한다는 점입니다. Enter는 `onSubmit`을 일으키지 않고 줄바꿈을 삽입합니다.
위아래 방향키로 줄을 넘나들 때는 기대 열(desired-x)을 유지합니다.

:::preview elements-textarea
:::

## Props(Input / UnstyledTextArea)

둘은 `EditableTextProps`를 공유합니다(`multiline`은 외부에 공개되지 않고 컴포넌트가 고정).

| Prop            | 타입                           | 기본값   | 설명                                                                               |
| --------------- | ------------------------------ | -------- | ---------------------------------------------------------------------------------- |
| `value`         | `string`                       | —        | 제어 텍스트                                                                        |
| `revision`      | `number \| bigint`             | —        | 제어 값의 권위 있는 revision. 오래된 값은 더 새로운 Core 입력을 덮어쓰지 않습니다  |
| `controller`    | `TextEditingController`        | —        | 안정적인 로컬 controller. `value`/`revision`과 상호 배타적                         |
| `readOnly`      | `boolean`                      | `false`  | 읽기 전용                                                                          |
| `password`      | `boolean`                      | `false`  | 비밀번호 모드(아래 참조)                                                           |
| `maxGraphemes`  | `number`                       | —        | 자소 상한                                                                          |
| `inputMode`     | `EditableInputMode`            | `"text"` | 소프트 키보드 힌트: `decimal` `email` `none` `numeric` `search` `tel` `text` `url` |
| `onTransaction` | `(t: EditTransaction) => void` | —        | Core 편집 트랜잭션 콜백                                                            |
| `onSubmit`      | `() => void`                   | —        | 한 줄 Enter 제출. 여러 줄의 Enter는 줄바꿈에 양보합니다                            |

텍스트 외관은 `TextProps`에서 상속합니다: `color`, `fontSize`, `fontWeight`, `lineHeight`, `fontFamily`,
`font`. 크기, `padding`, `backgroundColor`, 테두리(`style` 채널) 등은 [CommonProps](/api)에서 옵니다.

## 접근성과 프라이버시

- 편집 노드는 `textbox` 의미를 갖고 나옵니다. `semanticLabel`로 이름을 제공하십시오(보이는 label이 없을
  때 특히 중요합니다).
- 비밀번호 내용은 Core 안에서 마스킹된 글리프로만 그려집니다. 평문은 DisplayList, 녹화 재생, devtools,
  접근성 값 어디에도 들어가지 않으며, 비밀번호 대상은 클립보드에도 쓰지 않습니다.

더 깊은 설계(텍스트 위치 모델, bidi 경계, 계약 테스트 매트릭스)는 [텍스트와 편집](/ko/guide/editing)을
보십시오.
