---
title: Input
description: pingo 편집 엔진이 구동하며 캔버스에 렌더링되는 단일 행 텍스트 입력란.
---

# Input

단일 행 텍스트 입력입니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다. 클릭하면 실제로 입력, 선택, 삭제할 수 있으며 사이트 테마에 따라 밝고 어두운 모드가 전환됩니다.

:::preview input-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { Input } from "@dopejs/pingo-ui";

root.render(
  createElement(Input, {
    semanticLabel: "邮箱",
    width: 320,
    onValueChange: (value) => console.log(value),
  }),
);
```

`Input`은 내부적으로 hooks를 통해 안정적인 `TextEditingController`를 유지합니다. 따라서 반드시 `createElement(Input, props)` 형태로 컴포넌트로 마운트해야 하며, 직접 함수처럼 호출할 수 없습니다. 편집 세부 사항은 [텍스트 편집 가이드](/guide/editing)를 참조하십시오.

## 예시

### 접두사·접미사 및 비밀번호

`prefix`/`suffix` 슬롯에는 아이콘이나 단위를 넣을 수 있습니다. `password`는 마스킹 입력을 활성화하며 `disabled`는 필드 전체를 잠급니다.

:::preview input-adornments
:::

### 제어 사용법

자신의 `controller`를 전달하면 제어 모드로 진입합니다. 이때 `value`는 초기값으로만 취급되어 무시되며, 호출자가 컨트롤러를 소유하고 렌더링 간에 동일한 인스턴스를 유지해야 합니다.

## Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | `""` | 비제어 사용 시 초기값. `controller`를 설정하면 무시됩니다 |
| `onValueChange` | `(value: string) => void` | — | 편집 트랜잭션이 적용될 때마다 최신 값을 콜백합니다 |
| `controller` | `TextEditingController` | — | 고급 탈출구: 호출자가 소유한 영속 컨트롤러 |
| `onTransaction` | `(transaction: EditTransaction) => void` | — | 각 편집 트랜잭션의 원시 콜백 |
| `onSubmit` | `() => void` | — | 제출(Enter) 콜백 |
| `disabled` | `boolean` | `false` | 비활성 상태 |
| `readOnly` | `boolean` | `false` | 읽기 전용 상태 |
| `password` | `boolean` | `false` | 마스킹 입력 |
| `inputMode` | `"decimal" \| "email" \| "none" \| "numeric" \| "search" \| "tel" \| "text" \| "url"` | `"text"` | 소프트 키보드 레이아웃 힌트 |
| `className` | `string` | — | 컴포넌트 클래스 이름 뒤에 추가됩니다 |
| `width` | `number` | — | 고정 너비(px) |
| `semanticLabel` | `string` | — | 접근성 이름 |
| `prefix` | `PingoNode` | — | 아이콘이나 통화 기호 같은 전치 장식 |
| `suffix` | `PingoNode` | — | 단위나 지우기 버튼 같은 후치 장식 |

## 접근성

`semanticLabel`로 필드 이름을 제공합니다. `disabled`와 `readOnly` 모두 필드를 편집 시퀀스에서 제외합니다. 현재 알려진 제한 사항: 플레이스홀더 텍스트와 포커스 링 스타일이 없습니다.
