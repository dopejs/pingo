---
title: Toggle
description: 굵게, 기울임꼴 등 즉시 켜고 끄는 두 가지 상태 전환 버튼으로, pingo canvas 위에 렌더링됩니다.
---

# Toggle

두 가지 상태를 전환하는 버튼으로, 한 번 누르면 켜진 상태를 유지하고 다시 누르면 꺼집니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다. 클릭하여 상태를 전환할 수 있으며 사이트 테마에 따라 밝은 모드와 어두운 모드가 전환됩니다.

:::preview toggle-basic
:::

## 사용법

```tsx
import { Toggle } from "@dopejs/pingo-ui";

root.render(
  <Toggle defaultPressed onPressedChange={(pressed) => console.log(pressed)}>
    굵게
  </Toggle>,
);
```

`Toggle`은 내부적으로 hooks를 통해 상태를 보유하므로 반드시 JSX로 컴포넌트 형태로 마운트해야 합니다. `pressed`를 전달하면 제어 모드로 진입하며, 그렇지 않으면 `defaultPressed`를 사용하여 컴포넌트가 스스로 상태를 가지도록 합니다.

## 예시

### 비활성화

`disabled`를 전달하면 버튼이 포인터와 키보드에 더 이상 반응하지 않으며 Enter/스페이스로도 활성화되지 않습니다.

## Props

| Prop              | 타입                         | 기본값  | 설명                           |
| ----------------- | ---------------------------- | ------- | ------------------------------ |
| `children`        | `string`                     | —       | 버튼 텍스트(필수)              |
| `pressed`         | `boolean`                    | —       | 제어되는 눌림 상태             |
| `defaultPressed`  | `boolean`                    | `false` | 비제어 초기 눌림 상태          |
| `onPressedChange` | `(pressed: boolean) => void` | —       | 상태 전환 콜백                 |
| `disabled`        | `boolean`                    | `false` | 비활성화 상태                  |
| `className`       | `string`                     | —       | 컴포넌트 클래스 이름 뒤에 추가 |

## 접근성

컴포넌트는 button 시맨틱을 가지며, 시맨틱 값은 상태에 따라 `on` / `off` 간에 전환됩니다. 포인터를 누르면 자동으로 포커스되며 `Enter`와 `스페이스` 모두 활성화할 수 있습니다.
