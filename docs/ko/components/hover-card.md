---
title: Hover Card
description: 호버 시 펼쳐지는 리치 콘텐츠 카드로, 열기 및 닫기 지연을 지원합니다.
---

# Hover Card

Hover Card는 트리거에 호버(또는 포커스)하면 리치 콘텐츠 카드를 펼칩니다. Tooltip보다 더 많은 정보(예: 사용자 프로필 미리보기)를 담을 수 있습니다. 아래 미리보기는 pingo 엔진이 실시간으로 렌더링하며(제어되는 `open` 상시 표시로 시연), 사이트 테마에 따라 밝은 모드와 어두운 모드가 전환됩니다.

:::preview hover-card-basic
:::

## 사용법

```tsx
import { createElement } from "@dopejs/pingo";
import { HoverCard } from "@dopejs/pingo-ui";

root.render(
  createElement(HoverCard, {
    openDelayMs: 300,
    closeDelayMs: 200,
    children: createElement("text", { value: "@pingo" }),
    content: createElement("text", { value: "Canvas 렌더링 엔진 및 UI 컴포넌트 라이브러리." }),
  }),
);
```

카드는 열린 뒤 카드 자체에 호버해도 닫히지 않으므로, `closeDelayMs`는 포인터가 트리거와 카드 사이의 빈 공간을 건너갈 수 있는 시간을 확보해 줍니다. `open`을 전달하면 제어 모드로 전환되며, `onOpenChange`와 함께 상태를 직접 관리할 수 있습니다.

## Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `children` | `PingoNode` | — | 트리거 요소(필수) |
| `content` | `PingoNode` | — | 카드 콘텐츠(필수) |
| `open` | `boolean` | — | 제어되는 열림/닫힘 상태 |
| `onOpenChange` | `(open: boolean) => void` | — | 열림/닫힘 변경 콜백 |
| `openDelayMs` | `number` | `300` | 열기 지연(밀리초) |
| `closeDelayMs` | `number` | `200` | 닫기 지연(밀리초) |
| `className` | `string` | — | 앵커 컨테이너 클래스명 뒤에 추가 |

## 접근성

트리거는 포커스 시에도 카드를 열며, 포커스를 잃으면 닫히므로 키보드 사용자가 콘텐츠를 놓치지 않습니다.
