---
title: Aspect Ratio
description: 고정된 가로세로비로 내용을 제약하는 컨테이너. pingo canvas에 렌더링됩니다.
---

# Aspect Ratio

Aspect Ratio는 내용이 고정된 가로세로비를 유지하게 합니다. 너비는 레이아웃이 결정하고 높이는 비율에 따라
자동 계산됩니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링합니다.

:::preview aspect-ratio-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { AspectRatio } from "@dopejs/pingo-ui";

root.render(
  createElement(AspectRatio, {
    ratio: 16 / 9,
    children: coverImage,
  }),
);
```

컴포넌트 너비는 부모 컨테이너의 100%이며, `ratio`는 너비를 높이로 나눈 값입니다. 예를 들어 `16 / 9`는
와이드 화면입니다.

## Props

| Prop        | 타입        | 기본값 | 설명                           |
| ----------- | ----------- | ------ | ------------------------------ |
| `ratio`     | `number`    | `1`    | 가로세로비(너비 ÷ 높이)        |
| `children`  | `PingoNode` | —      | 제약을 받을 내용(필수)         |
| `className` | `string`    | —      | 컴포넌트 클래스 이름 뒤에 추가 |

## 접근성

Aspect Ratio는 순수한 레이아웃 컨테이너로 추가 의미를 도입하지 않습니다. CSS subset에는 `aspect-ratio`
속성이 없으므로, 컴포넌트는 실측 너비로 높이를 계산합니다. 첫 프레임은 높이 0으로 렌더링되고 측정이
도착한 뒤 높이가 확정됩니다.
