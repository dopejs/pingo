---
title: Checkbox
description: pingo 캔버스에 렌더링되는, 텍스트 라벨을 지원하는 제어형 다중 선택 상자입니다.
---

# Checkbox

다중 선택 상자는 독립적인 불리언 스위치에 사용합니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링하며 사이트 테마에 따라 밝은 모드와 어두운 모드를 전환합니다. Checkbox는 제어형 컴포넌트입니다. 미리보기에는 정적인 켜짐/꺼짐/비활성 조합이 표시되며, 상호작용은 호출자가 보유한 상태에 의해 구동됩니다.

:::preview checkbox-basic
:::

## 사용법

```tsx
import { createElement, useSignal, type PingoNode } from "@dopejs/pingo";
import { Checkbox } from "@dopejs/pingo-ui";

// useSignal은 훅이므로 컴포넌트 스코프 안에서 실행해야 합니다.
function NotificationSetting(): PingoNode {
  const enabled = useSignal(false);
  return createElement(Checkbox, {
    checked: enabled.get(),
    label: "알림 사용",
    onCheckedChange: (next) => enabled.set(next),
  });
}

root.render(createElement(NotificationSetting));
```

`checked`는 부모 컴포넌트가 보유하며 `onCheckedChange`가 이를 갱신합니다. 컴포넌트 자체는 상태를 저장하지 않습니다. `label`은 선택 사항이며 제공하면 선택 상자 오른쪽에 텍스트를 렌더링합니다.

## 예제

### 비활성

`disabled`를 전달하면 선택 상자가 포인터와 키보드에 반응하지 않으며, 의미론적 값이 `disabled`로 변경됩니다.

## Props

| Prop | 유형 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `checked` | `boolean` | — | 선택 상태(필수, 제어형) |
| `onCheckedChange` | `(checked: boolean) => void` | — | 상태 전환 콜백 |
| `disabled` | `boolean` | `false` | 비활성 상태 |
| `label` | `string` | — | 선택 상자 오른쪽의 텍스트 라벨 |
| `className` | `string` | — | 컴포넌트 클래스 이름 뒤에 추가 |
| `semanticLabel` | `string` | — | 접근성 이름 |

## 접근성

컴포넌트는 `checkbox` 의미론적 역할을 가지며, 의미론적 값은 상태에 따라 `checked` / `unchecked` / `disabled` 사이에서 전환됩니다. 포인터를 누르면 자동으로 포커스됩니다. ✓ 표시기는 글꼴 글리프 적용 범위에 의존하며, 아이콘 에셋이 준비되기 전까지 자리표시자로 구현되어 있습니다.
