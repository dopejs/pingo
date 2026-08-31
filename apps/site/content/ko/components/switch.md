---
title: Switch
description: 즉시 적용되는 불리언 설정을 위한 제어형 스위치 컨트롤로, pingo 캔버스에 렌더링됩니다.
---

# Switch

스위치는 즉시 적용되는 불리언 설정에 사용합니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링하며, 사이트 테마에 따라 밝은 모드와 어두운 모드가 전환됩니다. Switch는 제어형 컴포넌트입니다. 미리보기에는 정적인 켜짐/꺼짐/비활성 조합이 표시되며, 상호작용은 호출자가 보유한 상태에 의해 구동됩니다.

:::preview switch-basic
:::

## 사용법

```tsx
import { useSignal, type PingoNode } from "@dopejs/pingo";
import { Switch } from "@dopejs/pingo-ui";

// useSignal은 hook이므로 컴포넌트 스코프 안에서 실행해야 합니다.
function AirplaneMode(): PingoNode {
  const on = useSignal(false);
  return (
    <Switch
      checked={on.get()}
      semanticLabel="비행기 모드"
      onCheckedChange={(next) => on.set(next)}
    />
  );
}

root.render(<AirplaneMode />);
```

`checked`는 부모 컴포넌트가 보유하며, `onCheckedChange`가 이를 업데이트합니다. 컴포넌트 자체는 상태를 저장하지 않습니다.

## 예제

### 비활성

`disabled`를 전달하면 스위치가 포인터와 키보드에 더 이상 반응하지 않으며, 시맨틱 값이 `disabled`로 변경됩니다.

## Props

| Prop              | 타입                         | 기본값  | 설명                           |
| ----------------- | ---------------------------- | ------- | ------------------------------ |
| `checked`         | `boolean`                    | —       | 스위치 상태(필수, 제어형)      |
| `onCheckedChange` | `(checked: boolean) => void` | —       | 상태 전환 콜백                 |
| `disabled`        | `boolean`                    | `false` | 비활성 상태                    |
| `className`       | `string`                     | —       | 컴포넌트 클래스 이름 뒤에 추가 |
| `semanticLabel`   | `string`                     | —       | 접근성 이름                    |

## 접근성

컴포넌트는 `switch` 시맨틱 역할을 가지며, 시맨틱 값이 상태에 따라 `on` / `off` / `disabled` 사이를 전환합니다. 포인터를 누르면 자동으로 포커스됩니다. 스위치에는 보이는 텍스트가 없으므로 항상 `semanticLabel`을 제공해야 합니다.
