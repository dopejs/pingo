---
title: Slider
description: 수치 슬라이더입니다. 드래그와 키보드 미세 조정을 지원하며 pingo 캔버스에 렌더링합니다.
---

# Slider

슬라이더는 하나의 구간 안에서 값을 선택하는 데 사용합니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다. 슬라이더 핸들을 드래그하거나 방향키로 미세 조정할 수 있으며, 사이트 테마에 따라 밝은 모드와 어두운 모드가 전환됩니다.

:::preview slider-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { Slider } from "@dopejs/pingo-ui";

root.render(
  createElement(Slider, {
    defaultValue: 40,
    min: 0,
    max: 100,
    step: 1,
    semanticLabel: "音量",
    onValueChange: (value) => console.log(value),
  }),
);
```

`Slider`는 내부에서 hooks로 드래그 상태를 보유하므로 반드시 `createElement`를 사용해 컴포넌트 형태로 마운트해야 합니다. `value`를 전달하면 제어 모드로 동작하며, 그렇지 않으면 `defaultValue`를 사용해 컴포넌트가 스스로 상태를 관리하게 합니다.

## 예제

### 구간과 스텝

`min` / `max`는 값의 구간을 제한하며(기본값 0–100), `step`은 키보드 미세 조정의 단위를 결정합니다(기본값 1).

### 비활성화

`disabled`를 전달하면 슬라이더가 더 이상 드래그와 키보드 입력에 반응하지 않습니다.

## Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | `number` | — | 제어되는 현재 값 |
| `defaultValue` | `number` | `min` | 비제어 초기 값 |
| `onValueChange` | `(value: number) => void` | — | 값 변경 콜백 |
| `min` | `number` | `0` | 최솟값 |
| `max` | `number` | `100` | 최댓값 |
| `step` | `number` | `1` | 키보드 스텝 |
| `disabled` | `boolean` | `false` | 비활성화 상태 |
| `semanticLabel` | `string` | — | 접근성 이름 |
| `className` | `string` | — | 컴포넌트 클래스 이름 뒤에 추가 |

## 접근성

컴포넌트는 `slider` 시맨틱 역할을 가지며, 시맨틱 값은 현재 수치의 문자열 형태입니다. `←`/`↓`는 `step`만큼 감소시키고, `→`/`↑`는 `step`만큼 증가시키며, `Home`/`End`는 구간의 양 끝으로 이동합니다. 값은 항상 `[min, max]` 범위 안으로 고정됩니다.
